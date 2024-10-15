module.exports = {
  HTTP_PORT: process.env.HTTP_PORT,
  HTTPS_PORT: process.env.HTTPS_PORT,
  VERSION: require("../package.json").version,
  SSL_CERT_PATH: "security/ssl/local/localhost-cert.crt",
  SSL_KEY_PATH: "security/ssl/local/localhost-key.pem",
  LOG_FILE_HOST_1: `http://backend-1:${process.env.BACKEND_1_PORT}`,
  LOG_FILE_HOST_2: `http://backend-2:${process.env.BACKEND_2_PORT}`,
};
