const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { LOG_DIR } = require("../config");

router.get("/logs", async (req, res) => {
  const { file, n, search } = req.query;

  if (!/^[a-zA-Z0-9_.-]+\.([a-zA-Z0-9]+)$/.test(file)) {
    return res
      .status(500)
      .send({ error: "File names can only include letters, numbers, and single periods" });
  }

  const numLines = n
    ? parseInt(n, 10)
    : 5;

  try {
    let result = [];

    // If `file` is undefined, process all files in the log directory:
    if (!file) {
      const directoryContents = await fs.promises.readdir(LOG_DIR);
      const files = directoryContents.filter(it => fs.lstatSync(path.join(LOG_DIR, it)).isFile());

      for (const logFile of files) {
        const filePath = path.join(LOG_DIR, logFile);
        const lines = await readLinesFromEndOfFile(filePath, numLines, search);
        result.push({
          filename: logFile,
          lines
        });
      }
    } else {
      const filePath = path.join(LOG_DIR, file);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send({ error: "Log file not found" });
      }

      const lines = await readLinesFromEndOfFile(filePath, numLines, search);
      result.push({
        filename: file,
        lines
      });
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error reading log files" });
  }
});

async function readLinesFromEndOfFile(filePath, n, searchTerm) {
  logger.info("Beginning line read from file", filePath);
  const fileSize = fs.statSync(filePath).size;
  const fileDescriptor = fs.openSync(filePath, 'r');

  let buffer = Buffer.alloc(1); // Buffer into which we'll read one byte at a time
  let position = fileSize - 1; // Start from the last byte
  let chunk = '';
  let outputLines = [];

  try {
    while (position >= 0 && outputLines.length < n) {
      fs.readSync(fileDescriptor, buffer, 0, 1, position); // Read 1 byte from the current position
      const character = buffer.toString('utf-8');
      chunk = character + chunk;

      if ((character === '\n' || position == 0) && chunk.length > 1) {
        if (searchTerm === undefined || chunk.toLowerCase().includes(searchTerm.toLowerCase())) {
          outputLines.unshift(chunk.trim());
        }
        chunk = '';
      }

      position--;
    }
  } catch (err) {
    console.error('Error reading file:', err);
  } finally {
    fs.closeSync(fileDescriptor);
  }

  logger.info("Done reading from file", filePath);
  return outputLines;
}

module.exports = router;
