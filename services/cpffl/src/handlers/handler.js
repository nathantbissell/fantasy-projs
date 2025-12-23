const serverless = require("serverless-http");
const app = require("../../index.ts");

exports.handler = serverless(app);
