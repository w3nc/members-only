const { S3Client } = require("@aws-sdk/client-s3");

// Neon Object Storage is S3-compatible. Credentials come from `neon deploy`.
const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = "assets";

module.exports = { s3, BUCKET };