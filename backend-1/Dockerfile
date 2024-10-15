# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
COPY /logfiles/noextension /var/log
COPY /logfiles/test-log-file-2018-chunk-size.log /var/log
COPY /logfiles/test-log-file-2019-empty-file.log /var/log
COPY /logfiles/test-log-file-2020-only-newlines.log /var/log
RUN npm i
CMD ["npm", "run", "start"]
