const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const { LOG_DIR } = require("../config");

router.get("/logs", async (req, res) => {
  const { file, n, search } = req.query;

  const parsedN = parseInt(n, 10);
  if (n !== undefined && (!Number.isInteger(Number(n)) || isNaN(parsedN))) {
    return res.status(400).send({ error: "'n' must be an integer" });
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
  let position = fileSize - CHUNK_SIZE_BYTES;
  let chunk = '';
  let outputLines = [];

  try {
    while (position >= -CHUNK_SIZE_BYTES && outputLines.length < n) {
      const bytesToRead = position < 0
        ? CHUNK_SIZE_BYTES + position
        : CHUNK_SIZE_BYTES;
      const positionClamped = Math.max(position, 0);
      const { bytesRead } = await fileDescriptor.read(buffer, 0, bytesToRead, positionClamped);

      if (bytesRead === 0) {
        break;
      }

      const data = buffer.toString('utf-8', 0, bytesRead);
      chunk = data + chunk;

      const lines = chunk
        .split('\n')
        .filter(ea => ea.length > 0);
      chunk = lines.shift(); // Keep the last incomplete line for the next chunk

      // Read the lines starting from the back and check for the search term in each one:
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (search === undefined || line.toLowerCase().includes(search.toLowerCase())) {
          outputLines.unshift(line);
        }
        if (outputLines.length >= n) {
          break;
        }
      }

      position -= CHUNK_SIZE_BYTES;
    }

    // If the last chunk contained a partial line, process it
    const match = search === undefined || chunk.toLowerCase().includes(search.toLowerCase());
    if (chunk.length > 0 && outputLines.length < n && match) {
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
