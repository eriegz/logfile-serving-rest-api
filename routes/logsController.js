const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const { LOG_DIR } = require("../config");

router.get("/logs", async (req, res) => {
  const { file, n, search } = req.query;

  const parsedN = parseInt(n, 10);
  const nIsInvalid = n !== undefined && (!Number.isInteger(Number(n)) || isNaN(parsedN));
  if (nIsInvalid || parsedN < 0 || parsedN > 200) {
    return res.status(400).send({ error: "'n' must be an integer between 0 and 200" });
  }
  if (search !== undefined && search.length > 100) {
    return res.status(400).send({ error: "'search' query parameter cannot exceed 100 characters" });
  }
  // The regex below prevents directory traversal via string inputs such as `../`, `~/`, `/`, etc.
  if (file !== undefined && /(^\/|\.{2,}[\/\\]|~[\/\\]|%2e%2e%2f|%2f)/i.test(file)) {
    return res
      .status(500)
      .send({ error: "Please enter a valid filename" });
  }

  const numLines = n
    ? parsedN
    : 5;

  try {
    let finalOutput = [];

    // If `file` is undefined, then process all files in the log directory:
    if (!file) {
      const directoryContents = await fs.readdir(LOG_DIR);

      finalOutput = await Promise.all(
        directoryContents.map(async (item) => {
          const itemPath = path.join(LOG_DIR, item);
          const itemStats = await fs.lstat(itemPath);
          if (itemStats.isFile()) {
            const lines = await readLinesFromEndOfFile(itemPath, numLines, search);
            return {
              filename: item,
              numLines: lines.length,
              lines
            };
          }
        })
      );

      // Filter out undefined results from non-file entries
      finalOutput = finalOutput.filter(Boolean);
    } else {
      const itemPath = path.join(LOG_DIR, file);
      try {
        await fs.access(itemPath);
      } catch (err) {
        return res.status(404).send({ error: "Log file not found" });
      }
      const itemStats = await fs.lstat(itemPath);
      if (!itemStats.isFile()) {
        return res.status(404).send({ error: "Log file not found" });
      }

      const lines = await readLinesFromEndOfFile(itemPath, numLines, search);
      finalOutput.push({
        filename: file,
        numLines: lines.length,
        lines
      });
    }

    res.send(finalOutput);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error reading log files" });
  }
});

async function readLinesFromEndOfFile(filePath, n, search) {
  const fileSize = (await fs.stat(filePath)).size;
  const fileDescriptor = await fs.open(filePath, 'r');

  // 20 KB is the optimum chunk size based on benchmark tests performed on a 156 MB sample log file.
  // Increasing it beyond 20 KB results in only marginal performance improvements, if any.
  const CHUNK_SIZE_BYTES = 1024 * 20;
  let buffer = Buffer.alloc(CHUNK_SIZE_BYTES);
  // Note: `fileReadPosition` can be negative, but its value will get clamped to a minimum value of
  // 0 before being used for any file reads, and its negative value can help us calculate the number
  // of bytes to read, down below.
  let fileReadPosition = fileSize - CHUNK_SIZE_BYTES;
  let chunk = '';
  let outputLines = [];
  let numLinesProcessed = 0;

  try {
    while (fileReadPosition >= -CHUNK_SIZE_BYTES && numLinesProcessed < n) {
      const bytesToRead = fileReadPosition < 0
        ? CHUNK_SIZE_BYTES + fileReadPosition
        : CHUNK_SIZE_BYTES;
      const positionClamped = Math.max(fileReadPosition, 0);
      const { bytesRead: numBytesRead } = await fileDescriptor.read(
        buffer,
        0,
        bytesToRead,
        positionClamped
      );
      if (numBytesRead === 0) {
        break;
      }

      const newText = buffer.toString('utf-8', 0, numBytesRead);
      // Prepend the new chunk in front of any existing `chunk`, so that we will pick up where we
      // left off with any previous line fragments.
      chunk = newText + chunk;

      const lines = chunk
        .split('\n')
        .filter(ea => ea.length > 0);
      // This section ensures that any fragments are moved into the next loop iteration, and if this
      // current iteration is the last one then `chunk` will get processed later on, outside the
      // loop. If `chunk` contains ONLY newline characters, then `line'` will return
      // undefined, in which case we want to reset `chunk` so that these characters don't move on
      // to subsequent iterations.
      if (lines.length !== 0) {
        chunk = lines.shift()
      } else {
        chunk = "";
      }

      // Read the lines starting from the back and check for the search term in each one:
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (search === undefined || line.toLowerCase().includes(search.toLowerCase())) {
          outputLines.unshift(line);
        }
        numLinesProcessed++;
        if (numLinesProcessed >= n) {
          break;
        }
      }

      fileReadPosition -= CHUNK_SIZE_BYTES;
    }

    if (chunk.length > 0
      && numLinesProcessed < n
      && (search === undefined || chunk.toLowerCase().includes(search.toLowerCase()))
    ) {
      outputLines.unshift(chunk.trim());
    }
  } catch (err) {
    console.error('Error reading file:', err);
  } finally {
    await fileDescriptor.close();
  }

  return outputLines;
}

module.exports = router;
