module.exports = {
  HTTP_PORT: 2000,
  HTTPS_PORT: 2443,
  VERSION: require("../package.json").version,
  SSL_CERT_PATH: "security/ssl/local/localhost-cert.crt",
  SSL_KEY_PATH: "security/ssl/local/localhost-key.pem",
};
