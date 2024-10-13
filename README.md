# **Logfile-Serving REST API (Node.js)**

This repo contains a simple containerised backend REST API server that serves up the contents of its host's `/var/log` folder.

## How to run:

First, build the project using docker command line:

```
docker build -t logfile_serving_rest_api .
```

Next, run it:

```
docker run -p 127.0.0.1:2000:2000 -p 127.0.0.1:2443:2443 --name logfile_serving_rest_api -e NODE_ENV=docker logfile_serving_rest_api
```

Use an application like Postman to test out the application:

```
curl --location 'localhost:2000/api/version'
```

# Assumptions:

Firstly, it's assumed that log entries are stored in JSON format.

Secondly, it's assumed that new log entries are appended to the log files in ***more or less*** the order that they appear in real life, but that their timestamps could be slightly out of chronological order. Thus, when "tailing" a particular log file via the `n` query parameter, sometimes logs representing events which actually occurred **earlier** than the first log in the window could get omitted. For example:

```
Log A 2024-10-12T17:20:38.456
Log B 2024-10-12T17:20:38.123  <—— event occurred AFTER that in log A, which is fine
Log C 2024-10-12T17:20:38.789
```

```
Log A 2024-10-12T17:20:38.456
┌─────────────────────────────┐
│Log B 2024-10-12T17:20:38.123│ n = 2, excludes log A
│Log C 2024-10-12T17:20:38.789│
└─────────────────────────────┘
```

Lastly, it's assumed that the log files were created in a way similar to doing `touch filename.log`.
