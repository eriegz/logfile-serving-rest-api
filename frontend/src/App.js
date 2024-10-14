import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState('');
  const [n, setN] = useState('');
  const [search, setSearch] = useState('');

  const [logs, setLogs] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const queryParams = {};
    if (file) queryParams.file = file;
    if (n) queryParams.n = n;
    if (search) queryParams.search = search;

    const queryParamsStr = new URLSearchParams(queryParams).toString();
    const queryParamsIfExists = queryParamsStr ? `?${queryParamsStr}` : '';

    const apiUrl = `http://localhost:2000/api/logs${queryParamsIfExists}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setLogs(data))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Logfile Search App</h1>

        {/* Centered form with left-justified contents */}
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>File:</label>
            <select
              value={file}
              onChange={(e) => setFile(e.target.value)}
            >
              <option value="">Select a file</option> {/* Default option */}
              <option value="noextension">noextension</option>
              <option value="test-log-file-2018-chunk-size.log">test-log-file-2018-chunk-size.log</option>
              <option value="test-log-file-2019-empty-file.log">test-log-file-2019-empty-file.log</option>
              <option value="test-log-file-2020-only-newlines.log">test-log-file-2020-only-newlines.log</option>
              <option value="test-log-file-2021-long-and-short-lines.log">test-log-file-2021-long-and-short-lines.log</option>
              <option value="test-log-file-2022-large-file.log">test-log-file-2022-large-file.log</option>
              <option value="test-log-file-2023.log">test-log-file-2023.log</option>
              <option value="test-log-file-2024-short-file.log">test-log-file-2024-short-file.log</option>
            </select>
          </div>
          <div className="form-group">
            <label>n:</label>
            <input
              type="number"
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="Enter number of lines"
            />
          </div>
          <div className="form-group">
            <label>Search:</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter search term"
            />
          </div>
          <button type="submit">Search Logs</button>
        </form>

        {/* Displaying logs in cards */}
        <div className={`log-cards ${logs.length > 0 ? 'with-logs' : ''}`}>
          {logs.map((log, index) => (
            <div key={index} className="log-card">
              <p className="filename-line">Filename: <strong>{log.filename}</strong></p>
              <p>Number of Lines: <strong>{log.numLines}</strong></p>
              {log.lines.map((line, idx) => (
                <div key={idx} className="log-lines-card">
                  <p className="log-line">{line}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
