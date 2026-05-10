import { pbkdf2, randomUUID, timingSafeEqual } from "crypto";
import { pwsalt } from "../config/dbServer.json";
import { Player } from "../types/models";

const SALT = pwsalt || "SALT";

// Session ID
export const newSessionID = () => randomUUID();

// Strip password from player data
export const stripPassword = ({
  password,
  session,
  lower_name,
  ...player
}: Player) => player;

// Check password from player data
export const testPassword = ({ id, session, password }: Player) => ({
  id,
  session,
  password: !!password,
});

// Test password
export const passwordsMatch = (a: string, b: string) =>
  timingSafeEqual(Buffer.from(a, "base64url"), Buffer.from(b, "base64url"));

// Encrypt password
const settings = {
  iterations: 1049,
  keyLength: 64,
  digest: "sha512",
};
export const encryptPassword = (password: string, salt = "") =>
  new Promise<string>((res, rej) =>
    pbkdf2(
      password,
      `${SALT}${salt}`,
      settings.iterations,
      settings.keyLength,
      settings.digest,
      (err, key) => (err ? rej(err) : res(key.toString("base64url"))),
    ),
  );
