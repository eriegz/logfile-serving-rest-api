# **Logfile-Serving REST API (Node.js)**

This repo contains a simple containerised backend REST API server that serves up the contents of its host's `/var/log` folder.

## How to run:

The following command will spin up both the frontend and backend applications as individual Docker services:

```
docker-compose --env-file .docker-env up --build frontend backend-proxy backend-1 backend-2
```

Use an application like Postman to test out the backend REST API:

```
curl --location 'localhost:2000/api/logs'
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
