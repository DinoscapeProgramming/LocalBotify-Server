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

console.log("Public Key:\n", publicKey);
console.log("Private Key:\n", privateKey);

const fs = require("fs");
fs.writeFileSync("public.pem", publicKey);
fs.writeFileSync("private.pem", privateKey);