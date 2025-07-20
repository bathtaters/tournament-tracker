/** Copy JSON of validation/meta data from API to client */

const fs = require("fs");
const { join } = require("path");
const meta = require("../config/meta");
const validation = require("../config/validation");

const clientPath = join(
  meta.rootPath,
  "..",
  "client",
  "src",
  "assets",
  "validation.json"
);
const data = JSON.stringify({ ...validation, meta });

fs.writeFileSync(clientPath, data);
console.log("Validate config copied to client --", clientPath);
