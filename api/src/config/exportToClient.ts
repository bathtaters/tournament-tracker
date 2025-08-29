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
  "validation.ts",
);
const data = Object.entries({ ...validation, meta })
  .map(
    ([key, value]) =>
      `export const ${key} = ${JSON.stringify(value)} as const;`,
  )
  .join("\n");

fs.writeFileSync(clientPath, data);

console.log("Validate config copied to client --", clientPath);
