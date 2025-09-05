/** The TypeScript compiler will automatically load this file.
 * Include any module augmentations in here. */
import "express";

// Add custom methods to the Response type
declare module "express-serve-static-core" {
  interface Response {
    sendAndLog: Response["send"];
  }
}
