const fs = require("fs");
const { generateKeyPairSync } = require("crypto");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem"
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem"
  }
});

if (!fs.existsSync("../keys")) fs.mkdirSync("../keys");

fs.writeFileSync("../keys/public.pem", publicKey);
fs.writeFileSync("../keys/private.pem", privateKey);