const admin = require("firebase-admin");

let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: read from environment variable (JSON string)
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  credential = admin.credential.cert(serviceAccount);
} else {
  // Local development: read from file
  const serviceAccount = require("../secrets/firebase-service-account.json");
  credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({ credential });

module.exports = admin;
