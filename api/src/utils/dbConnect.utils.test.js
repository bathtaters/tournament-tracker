// Mock Config
const mockServerCfg = {
  connectionString: "TestConnString",
  users: [{ name: "test", pass: "testpw" }],
  server: { serverVars: "server" },
};

// Imports/Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const connectUtils = require("./dbConnect.utils");
jest.mock("../config/dbServer.json", () => mockServerCfg, { virtual: true });

afterAll(() => {
  warnSpy.mockRestore();
});

// Test
describe("getConnStr", () => {
  const mockRepl = jest.spyOn(connectUtils, "replaceFromObj");

  beforeAll(() => {
    mockRepl.mockImplementation((o) => o);
  });
  afterAll(() => {
    mockRepl.mockRestore();
  });

  it("gets connStr", () => {
    expect(connectUtils.getConnStr("test", mockServerCfg)).toBe(
      mockServerCfg.connectionString
    );
  });

  it("gets connStr w/o user", () => {
    const result = connectUtils.getConnStr(null, {
      connectionString: "TestConnString",
    });
    expect(result).toBe("TestConnString");
    expect(connectUtils.replaceFromObj).toHaveBeenCalledTimes(2);
  });

  describe("error handling", () => {
    it("fails on missing config", () => {
      expect(() => connectUtils.getConnStr(null, {})).toThrow(
        "Server config is invalid"
      );
    });

    it("fails on user not found", () => {
      expect(() => connectUtils.getConnStr("MissingUser")).toThrow(
        "No credentials for MissingUser"
      );
    });
  });

  describe("external calls", () => {
    it("calls replFromObj() using serverData", () => {
      connectUtils.getConnStr("test", mockServerCfg);

      expect(connectUtils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(connectUtils.replaceFromObj).toHaveBeenNthCalledWith(
        1,
        mockServerCfg.connectionString,
        mockServerCfg.server,
        { pre: "%", caseI: 1 }
      );
    });

    it("calls replFromObj() using userData", () => {
      connectUtils.getConnStr("test", mockServerCfg);

      expect(connectUtils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(connectUtils.replaceFromObj).toHaveBeenNthCalledWith(
        2,
        mockServerCfg.connectionString,
        mockServerCfg.users[0],
        { pre: "%", caseI: 1, esc: 1 }
      );
    });

    it("calls replFromObj() using envData", () => {
      connectUtils.getConnStr("test", mockServerCfg);

      expect(connectUtils.replaceFromObj).toHaveBeenCalledTimes(3);
      expect(connectUtils.replaceFromObj).toHaveBeenNthCalledWith(
        3,
        mockServerCfg.connectionString,
        expect.objectContaining({ HOME: process.env.HOME || "" }),
        { pre: "\\$" }
      );
    });
  });
});

describe("retryBlock", () => {
  const mockFunc = jest.fn((...args) => Promise.resolve(args));

  it("passes args to function", async () => {
    await connectUtils.retryBlock(mockFunc, ["a", "b", "c"], 1);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith("a", "b", "c");
  });

  it("returns result on success", () => {
    mockFunc.mockResolvedValueOnce("Success");

    return expect(connectUtils.retryBlock(mockFunc, [], 1)).resolves.toBe(
      "Success"
    );
  });

  it("retries on fail", async () => {
    warnSpy.mockImplementationOnce(() => {}).mockImplementationOnce(() => {});
    mockFunc.mockRejectedValueOnce("Fail");

    await connectUtils.retryBlock(mockFunc, [], 3);
    expect(mockFunc).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("calls retryCb on each retry", async () => {
    const retryMock = jest.fn();
    mockFunc.mockRejectedValueOnce("Fail");

    await connectUtils.retryBlock(mockFunc, [], 2, 0, 0, retryMock);
    expect(retryMock).toHaveBeenCalledTimes(1);
    expect(retryMock).toHaveBeenCalledWith("Fail");
  });

  it("throws error if err.code not in retryCodes", () => {
    expect.assertions(1);
    mockFunc.mockRejectedValueOnce({ message: "Fail", code: 20 });

    return expect(
      connectUtils.retryBlock(mockFunc, [], 1, 0, [10])
    ).rejects.toEqual({ message: "Fail", code: 20, stack: expect.any(String) });
  });

  it("doesn't throw if err.code is in retryCodes", () => {
    mockFunc.mockRejectedValueOnce({ message: "Fail", code: 10 });

    return expect(
      connectUtils.retryBlock(mockFunc, [], 2, 0, [10])
    ).resolves.toEqual([]);
  });

  it("throws on max retries reached", () => {
    expect.assertions(1);
    warnSpy.mockImplementationOnce(() => {});
    mockFunc.mockRejectedValueOnce("Fail");

    return expect(connectUtils.retryBlock(mockFunc, [], 1)).rejects.toThrow(
      "Max retries reached"
    );
  });

  it("works without args", async () => {
    await connectUtils.retryBlock(mockFunc, undefined, 1);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith();
  });
});

describe("replaceFromObj", () => {
  it("missing obj returns input str", () => {
    expect(connectUtils.replaceFromObj("test")).toBe("test");
  });

  it("basic text replace", () => {
    expect(connectUtils.replaceFromObj("test", { es: "ar" })).toBe("tart");
  });

  it("replaces prefix", () => {
    expect(
      connectUtils.replaceFromObj("test es", { es: "ar" }, { pre: "t" })
    ).toBe("art es");
  });

  it("replaces suffix", () => {
    expect(
      connectUtils.replaceFromObj("test es", { es: "ar" }, { suff: "t" })
    ).toBe("tar es");
  });

  it("replaces all matches", () => {
    expect(connectUtils.replaceFromObj("test es", { es: "ar" }, {})).toBe(
      "tart ar"
    );
  });

  it("replaces one match", () => {
    expect(
      connectUtils.replaceFromObj("test es", { es: "ar" }, { notAll: true })
    ).toBe("tart es");
  });

  it("replaces case-sensitive", () => {
    expect(connectUtils.replaceFromObj("test ES", { es: "ar" }, {})).toBe(
      "tart ES"
    );
  });

  it("replaces case-insensitive", () => {
    expect(
      connectUtils.replaceFromObj("test ES", { es: "ar" }, { caseI: true })
    ).toBe("tart ar");
  });

  it("escapes replacements", () => {
    expect(
      connectUtils.replaceFromObj("test es", { test: '"test;' }, { esc: true })
    ).toBe("%22test%3B es");
  });
});
