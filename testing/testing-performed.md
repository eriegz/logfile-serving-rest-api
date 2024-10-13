# Testing Performed

### The basic stuff:

- test that the Docker container stands up and populates the `/var/log` folder with sample data
- test that the endpoint works
- test that all query parameters work:
  - test that `file` correctly selects one file among many
  - test that `n` correctly filters number of lines returned
  - test that `search` correctly filters only lines matching the search term

### Different input combinations:

- test out omitting query params:
  - test omitting `file` and having the endpoint return results from all files
  - test omitting `n` and having the endpoint return the default 5 lines
  - test omitting `search` and returning all lines that fit the other criteria

### Bad inputs:

- test out bad inputs:
  - test that `n` only allows integer-like input when present, e.g. 3, '3', 3.0, etc.
  - that that `n` is an integer between 0 and 200
  - test that `file` cannot contain directory traversal characters, e.g.: `~/`, `../`, `/`, etc.
  - test that `file` only looks for files, as opposed to directories
  - test that `search` cannot exceed 100 characters
- test out bad states:
  - test that an empty array is returned when there are no files in the `/var/log` directory

### Dirty inputs/ boundary values / edge cases:

- test file names containing no file extension
- test out files containing really short lines
- test out files containing really long lines that exceed the chunk size
- test files ending in multiple newline characters
- test files containing random newline characters between logs
- test empty files
- test files containing ONLY newline characters
- test files ending in N newline characters, where N > chunk size
- test files containing a length of text equal to the chunk size
- test many different files of the above categories all in one request

### Performance:

- ensure performance is adequate when processing large files, e.g.: 156 MB
- ensure that multiple files can be read asynchronously
