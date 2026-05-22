require("dotenv").config();

const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
} = require("@aws-sdk/lib-dynamodb");

const clientConfig = {
  region: "us-east-1",
};

if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
} else {
  console.warn(
    "AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not set; using default AWS credential provider chain."
  );
}

const client = new DynamoDBClient(clientConfig);

const dynamodb =
  DynamoDBDocumentClient.from(client);

module.exports = dynamodb;