# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
COPY test-log-file-2022.log /var/log
COPY test-log-file-2023.log /var/log
COPY test-log-file-2024.log /var/log
RUN npm i
CMD ["npm", "run", "start"]
EXPOSE 2000
EXPOSE 2443
