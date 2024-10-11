# **Logfile-Serving REST API (Node.js)**

This repo contains a simple containerised backend REST API server that serves up the contents of its host's `/var/log` folder.

## How to run:

First, build the project using docker command line:

```
docker build -t logfile_serving_rest_api .
```

Next, run it:

```
docker run -p 127.0.0.1:2000:2000 --name logfile_serving_rest_api -e NODE_ENV=local logfile_serving_rest_api
```

Use an application like Postman to test out the application:

```
curl --location 'localhost:2000/api/version'
```
