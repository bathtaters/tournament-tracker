/** The TypeScript compiler will automatically load this file.
 * Include any module augmentations in here. */
import "express";
import "express-session";

// Add custom methods to the Response type
declare module "express-serve-static-core" {
  interface Request {
    session: Request["session"] & { user: any };
  }
  interface Response {
    sendAndLog: Response["send"];
  }
}
