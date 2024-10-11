# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
COPY test-log-file-1.log /var/log
RUN npm i
CMD ["npm", "run", "start"]
EXPOSE 2000
EXPOSE 2443
