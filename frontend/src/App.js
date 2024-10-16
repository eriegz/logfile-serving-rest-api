import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [fileSelection, setFileSelection] = useState('');
  const [n, setN] = useState('');
  const [search, setSearch] = useState('');
  const [logFilesList, setLogFilesList] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch list of possible log files to choose from:
  useEffect(() => {
    const fetchLogFiles = async () => {
      try {
        fetch(`http://${process.env.REACT_APP_PROXY_HOST}/api/logfiles-list`)
          .then(response => response.json())
          .then(data => {
            const logFilesInfoArray = [];
            data.forEach(logFileInfoObj => {
              logFileInfoObj.files.forEach(file => {
                logFilesInfoArray.push({
                  machine: logFileInfoObj.machine,
                  file,
                });
              });
            });
            setLogFilesList(logFilesInfoArray);
          })
          .catch(error => console.error('Error:', error));
      } catch (error) {
        console.error('Error fetching log files:', error);
      }
    };

    fetchLogFiles();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const queryParams = {};
    if (n) queryParams.n = n;
    if (search) queryParams.search = search;
    if (fileSelection) {
      queryParams.file = logFilesList[fileSelection].file;
      queryParams.machine = logFilesList[fileSelection].machine;
    }

    const queryParamsStr = new URLSearchParams(queryParams).toString();
    const queryParamsIfExists = queryParamsStr ? `?${queryParamsStr}` : '';

    const apiUrl = `http://${process.env.REACT_APP_PROXY_HOST}/api/logs${queryParamsIfExists}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setLogs(data))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Logfile Search App</h1>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>File:</label>
            <select
              value={fileSelection}
              onChange={(e) => setFileSelection(e.target.value)}
            >
              <option value="">Select a file</option> {/* Selecting this will return all files */}
              {logFilesList.map((logFileInfo, index) => (
                <option key={index} value={index}>
                  {`Machine ${logFileInfo.machine} — ${logFileInfo.file}`}
                </option>
              ))}
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
