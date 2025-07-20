// Imports/Spies/Mocks
const utils = require("./session.utils");

describe("newSessionID", () => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}\b-(?:[0-9a-fA-F]{4}\b-){3}[0-9a-fA-F]{12}$/;

  it("return is uuid", () => {
    expect(utils.newSessionID()).toMatch(uuidRegex);
  });
  it("returns unique values each time", () => {
    expect(utils.newSessionID()).not.toBe(utils.newSessionID());
  });
});

describe("stripPassword", () => {
  it("strips out password field", () => {
    expect(utils.stripPassword({ test: "1", password: 2 })).not.toHaveProperty(
      "password"
    );
  });
  it("strips out session field", () => {
    expect(
      utils.stripPassword({ test: "1", session: false })
    ).not.toHaveProperty("session");
  });
  it("passes other fields", () => {
    expect(utils.stripPassword({ a: 0, b: "2", c: true })).toEqual({
      a: 0,
      b: "2",
      c: true,
    });
  });
});

describe("passwordsMatch", () => {
  const b64urlChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  it("accepts base64url", () => {
    expect(() => utils.passwordsMatch(b64urlChars, b64urlChars)).not.toThrow();
  });
  it("returns true on match", () => {
    expect(utils.passwordsMatch("gwR83S-o2N_qpAl", "gwR83S-o2N_qpAl")).toBe(
      true
    );
  });
  it("returns false on mismatch", () => {
    expect(utils.passwordsMatch("gwR83S-o1N_qpAl", "gwR83S-o2N_qpAl")).toBe(
      false
    );
  });
});

describe("encryptPassword", () => {
  const b64urlRegex = /^[A-Za-z0-9_-]+$/;

  it("encoded string is not same as input string", async () => {
    const pw = await utils.encryptPassword("testValue");
    expect(pw).not.toBe("testValue");
  });
  it("encodes as base64url string", async () => {
    const pw = await utils.encryptPassword("testValue");
    expect(typeof pw).toBe("string");
    expect(pw).toMatch(b64urlRegex);
  });
  it("allows non-base64url characters on input", async () => {
    const pw = await utils.encryptPassword(
      '~*-!"\'\\&%*@_!#)@($%&#$&([]{};";?/.<.|\\`'
    );
    expect(pw).toMatch(b64urlRegex);
  });
});
