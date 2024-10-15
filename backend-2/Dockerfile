# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
COPY /logfiles/test-log-file-2021-long-and-short-lines.log /var/log
COPY /logfiles/test-log-file-2022-large-file.log /var/log
COPY /logfiles/test-log-file-2023.log /var/log
COPY /logfiles/test-log-file-2024-short-file.log /var/log
RUN npm i
CMD ["npm", "run", "start"]
