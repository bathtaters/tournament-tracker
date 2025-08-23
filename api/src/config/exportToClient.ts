/** Copy JSON of validation/metadata from API to client */

import fs from "fs";
import { join } from "path";
import meta from "../config/meta";
import * as validation from "../config/validation";

const clientPath = join(
  meta.rootPath,
  "..",
  "client",
  "src",
  "assets",
  "validation.json",
);
const data = JSON.stringify({ ...validation, meta });

fs.writeFileSync(clientPath, data);
console.log("Validate config copied to client --", clientPath);
