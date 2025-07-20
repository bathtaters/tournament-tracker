const { pbkdf2, timingSafeEqual, randomUUID } = require("crypto");
const SALT = require("../config/dbServer.json").pwsalt || "SALT";

// Session ID
exports.newSessionID = () => randomUUID();

// Strip password from player data
exports.stripPassword = ({ password, session, lower_name, ...player }) =>
  player;

// Check password from player data
exports.checkPassword = ({ id, session, password }) => ({
  id,
  session,
  password: !!password,
});

// Test password
exports.passwordsMatch = (a, b) =>
  timingSafeEqual(Buffer.from(a, "base64url"), Buffer.from(b, "base64url"));

// Encrypt password
const pwsettings = {
  iters: 1049,
  keylen: 64,
  digest: "sha512",
};
exports.encryptPassword = (password, salt = "") =>
  new Promise((res, rej) =>
    pbkdf2(
      password,
      `${SALT}${salt}`,
      pwsettings.iters,
      pwsettings.keylen,
      pwsettings.digest,
      (err, key) => (err ? rej(err) : res(key.toString("base64url")))
    )
  );
