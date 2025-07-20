// Imports/Mocks
const warnSpy = jest.spyOn(global.console, "warn");
const ops = require("./interface");
const utils = require("../../utils/dbInterface.utils");
const direct = require("./directOps");

jest.mock("./directOps", () => ({
  query: jest.fn((...args) => Promise.resolve(args)),
}));
jest.mock("../../utils/dbInterface.utils");

const soloInner = jest.fn((r) => r);
const firstInner = jest.fn((r) => r);

// Setup Tests
const client = {
  query: jest.fn((...args) => Promise.resolve(["testClient", ...args])),
};

beforeAll(() => {
  utils.queryValues.mockImplementation((a) =>
    a.flatMap((o) => Object.values(o))
  );
  utils.queryLabels.mockImplementation((a, k) => Object.keys(k));
  utils.getSolo.mockImplementation(() => soloInner);
  utils.getFirst.mockImplementation(() => firstInner);
  utils.getReturn.mockImplementation((r) => r);
});

afterAll(() => {
  warnSpy.mockRestore();
});

// Tests

// ----- SELECT ----- //

describe("getCount", () => {
  afterEach(() => {
    direct.query.mockClear();
  });

  it("table param only", async () => {
    await ops.getCount("test");
    expect(direct.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS count FROM test ;",
      expect.anything()
    );
  });
  it("filter param", async () => {
    await ops.getCount("test", "FILTER");
    expect(direct.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS count FROM test FILTER;",
      expect.anything()
    );
  });
  it("args param", async () => {
    await ops.getCount("test", 0, ["args"]);
    expect(direct.query).toHaveBeenCalledWith(expect.anything(), ["args"]);
  });
  it("uses sqlHelpers", async () => {
    await ops.getCount("test");
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });

  it("uses custom client", async () => {
    await ops.getCount("test", 0, ["args"], client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      "SELECT COUNT(*) AS count FROM test ;",
      ["args"]
    );
  });
});

describe("getRows", () => {
  it("table param only", () =>
    expect(ops.getRows("test")).resolves.toEqual(["SELECT * FROM test ;", []]));
  it("filter param", () =>
    expect(ops.getRows("test", "FILTER")).resolves.toEqual([
      "SELECT * FROM test FILTER;",
      [],
    ]));
  it("args param", () =>
    expect(ops.getRows("test", 0, ["args"])).resolves.toEqual([
      "SELECT * FROM test ;",
      ["args"],
    ]));
  it("cols param", () =>
    expect(ops.getRows("test", 0, 0, "cols")).resolves.toEqual([
      "SELECT cols FROM test ;",
      [],
    ]));
  it("all params", () =>
    expect(ops.getRows("test", "FILTER", ["args"], "cols")).resolves.toEqual([
      "SELECT cols FROM test FILTER;",
      ["args"],
    ]));
  it("cols as string", () =>
    expect(ops.getRows("test", 0, 0, "colA, colB")).resolves.toEqual([
      "SELECT colA, colB FROM test ;",
      [],
    ]));
  it("cols as array", () =>
    expect(ops.getRows("test", 0, 0, ["colA", "colB"])).resolves.toEqual([
      "SELECT colA, colB FROM test ;",
      [],
    ]));

  it("adds limit and offset", () =>
    expect(ops.getRows("test", 0, 0, 0, 12, 34)).resolves.toEqual([
      "SELECT * FROM test  LIMIT 12 OFFSET 34;",
      [],
    ]));

  it("uses sqlHelpers", async () => {
    await ops.getRows("test");
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getSolo).toHaveBeenCalledTimes(1);
    expect(soloInner).toHaveBeenCalledTimes(1);
  });

  it("uses custom client", async () => {
    await ops.getRows("test", 0, "args", 0, 0, 0, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith("SELECT * FROM test ;", "args");
  });
});

describe("getRow", () => {
  const getRowsSpy = jest.spyOn(ops, "getRows");

  it("uses getRows", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledTimes(1);
  });
  it("table param", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      "test",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined
    );
  });
  it("id param", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      "WHERE id = $1",
      ["ID"],
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined
    );
  });
  it("no id param", async () => {
    await ops.getRow("test", null, "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      "",
      null,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined
    );
  });
  it("col param", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      "cols",
      expect.anything(),
      expect.anything(),
      undefined
    );
  });
  it("idCol param", async () => {
    await ops.getRow("test", "ID", "cols", { idCol: "idCol", getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      "WHERE idCol = $1",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      undefined
    );
  });
  it("getOne param", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: true });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      "WHERE id = $1",
      expect.anything(),
      expect.anything(),
      1,
      expect.anything(),
      undefined
    );
    expect(utils.getFirst).toHaveBeenCalledWith(true);

    getRowsSpy.mockClear();
    await ops.getRow("test", "ID", "cols", { getOne: false });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      "WHERE id = $1",
      expect.anything(),
      expect.anything(),
      0,
      expect.anything(),
      undefined
    );
    expect(utils.getFirst).toHaveBeenCalledWith(false);
  });
  it("client param", async () => {
    await ops.getRow("test", "ID", "cols", { getOne: false, client });
    expect(getRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      client
    );
  });

  it("uses sqlHelpers", async () => {
    await ops.getRow("test", "ID", null, { getOne: true });
    expect(utils.getFirst).toHaveBeenNthCalledWith(1, true);
    await ops.getRow("test", "ID", null, { getOne: false });
    expect(utils.getFirst).toHaveBeenNthCalledWith(2, false);
    expect(utils.getFirst).toHaveBeenCalledTimes(2);
    expect(firstInner).toHaveBeenCalledTimes(2);
  });
});

// ----- DELETE ----- //

describe("rmvRows", () => {
  it("basic query", () =>
    expect(ops.rmvRows("test")).resolves.toEqual([
      "DELETE FROM test  RETURNING *;",
      [],
    ]));

  it("passes args", () =>
    expect(ops.rmvRows("test", ["args"])).resolves.toEqual([
      expect.anything(),
      ["args"],
    ]));

  it("passes filter", () =>
    expect(ops.rmvRows("test", 0, "FILTER")).resolves.toEqual([
      "DELETE FROM test FILTER RETURNING *;",
      expect.anything(),
    ]));

  it("custom returning", async () => {
    await expect(ops.rmvRows("test", null, null, null, null)).resolves.toEqual([
      expect.not.stringContaining("RETURNING"),
      expect.anything(),
    ]);
    await expect(
      ops.rmvRows("test", null, null, null, "custom")
    ).resolves.toEqual([
      expect.stringContaining("RETURNING custom"),
      expect.anything(),
    ]);
  });

  it("uses sqlHelpers", async () => {
    await ops.rmvRows("test", ["args"], "FILTER");
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(0);
  });

  it("uses custom client", async () => {
    await ops.rmvRows("test", 0, 0, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      "DELETE FROM test  RETURNING *;",
      []
    );
  });
});

describe("rmvRow", () => {
  const rmvRowsSpy = jest.spyOn(ops, "rmvRows");

  it("uses rmvRows", async () => {
    await ops.rmvRow("test", "ID");
    expect(rmvRowsSpy).toHaveBeenCalledTimes(1);
  });

  it("table param", async () => {
    await ops.rmvRow("test", "ID");
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      "test",
      expect.anything(),
      expect.anything(),
      null
    );
  });

  it("args param", async () => {
    await ops.rmvRow("test", "ID");
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      ["ID"],
      expect.anything(),
      null
    );
  });

  it("filter param", async () => {
    await ops.rmvRow("test", "ID");
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "WHERE id = $1",
      null
    );
  });

  it("client param", async () => {
    await ops.rmvRow("test", "ID", client);
    expect(rmvRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      client
    );
  });

  it("uses sqlHelpers", async () => {
    await ops.rmvRow("test", "ID");
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith();
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
});

// ----- INSERT ----- //

describe("addRows", () => {
  it("correct query", async () => {
    await expect(
      ops.addRows("test", [
        { a: 11, b: 12 },
        { a: 21, b: 22 },
      ])
    ).resolves.toEqual([
      "INSERT INTO test (a,b) VALUES 0, 1 RETURNING *;",
      [11, 12, 21, 22],
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(["a", "b"]);
  });

  it("adds empty row", () => {
    warnSpy.mockImplementationOnce(() => {});
    return expect(ops.addRows("test", [])).resolves.toEqual([
      "INSERT INTO test DEFAULT VALUES  RETURNING *;",
      [],
    ]);
  });

  it("upsert changes query", async () => {
    await expect(
      ops.addRows("test", [{ a: 1 }], { returning: "custom" })
    ).resolves.toEqual([
      expect.stringContaining("RETURNING custom"),
      expect.any(Array),
    ]);
    await expect(
      ops.addRows("test", [{ a: 1 }], { returning: null })
    ).resolves.toEqual([
      expect.not.stringContaining("RETURNING"),
      expect.any(Array),
    ]);
  });

  it("custom returning", async () => {
    return expect(
      ops.addRows("test", [{ a: 1 }], { upsert: 1 })
    ).resolves.toEqual([expect.stringMatching(/^UPSERT/), expect.any(Array)]);
  });

  it("uses custom client", async () => {
    await ops.addRows("test", [{ a: 11 }], { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      "INSERT INTO test (a) VALUES 0 RETURNING *;",
      [11]
    );
  });

  it("throws on missing objArray", () =>
    expect(ops.addRows("test")).rejects.toEqual(
      new Error("Missing rows to add to test table.")
    ));

  it("warns on empty objects", async () => {
    warnSpy.mockImplementationOnce(() => {});
    await ops.addRows("test", []);
    expect(warnSpy).toHaveBeenCalledWith("Added empty row to test");
  });

  it("uses sqlHelpers", async () => {
    await ops.addRows("test", [{ a: 1 }]);
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getSolo).toHaveBeenCalledTimes(1);
    expect(soloInner).toHaveBeenCalledTimes(1);
  });
});

describe("addRow", () => {
  const addRowsSpy = jest.spyOn(ops, "addRows");

  it("uses getRows", async () => {
    await ops.addRow("test", "obj");
    expect(addRowsSpy).toHaveBeenCalledTimes(1);
  });
  it("table param", async () => {
    await ops.addRow("test", "obj");
    expect(addRowsSpy).toHaveBeenCalledWith(
      "test",
      expect.anything(),
      expect.anything()
    );
  });
  it("rowObj param", async () => {
    await ops.addRow("test", "obj");
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      ["obj"],
      expect.anything()
    );
  });
  it("no rowObj param", async () => {
    warnSpy.mockImplementationOnce(() => {});
    await ops.addRow("test", null);
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      [],
      expect.anything()
    );
  });
  it("options param", async () => {
    await ops.addRow("test", "obj", { test: true });
    expect(addRowsSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ test: true })
    );
  });

  it("uses sqlHelpers", async () => {
    await ops.getRow("test", "ID");
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(true);
    expect(firstInner).toHaveBeenCalledTimes(1);
  });
});

// ----- UPDATE ----- //

describe("updateRow", () => {
  let origDirectMock;

  beforeAll(() => {
    origDirectMock = direct.query.getMockImplementation();
    direct.query.mockImplementation((...args) => Promise.resolve([args]));
  });

  afterAll(() => {
    direct.query.mockImplementation(origDirectMock);
  });

  it("correct query", async () => {
    await expect(
      ops.updateRow("test", "ID", { a: 1, b: 2, c: 3 })
    ).resolves.toEqual([
      {
        id: "ID",
        0: "UPDATE test SET a = $1, b = $2, c = $3 WHERE id = $4 RETURNING *;",
        1: [1, 2, 3, "ID"],
        a: 1,
        b: 2,
        c: 3,
      },
    ]);
    expect(utils.strTest).toHaveBeenCalledTimes(1);
    expect(utils.strTest).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("param idCol", async () => {
    const res = await ops.updateRow("test", "ID", { a: 1 }, { idCol: "IDCOL" });
    expect(res[0][0]).toEqual(
      "UPDATE test SET a = $1 WHERE IDCOL = $2 RETURNING *;"
    );
  });

  it("param returning", async () => {
    let res = await ops.updateRow(
      "test",
      "ID",
      { a: 1 },
      { returning: "custom" }
    );
    expect(res[0][0]).toEqual(expect.stringContaining("RETURNING custom"));
    res = await ops.updateRow("test", "ID", { a: 1 }, { returning: null });
    expect(res[0][0]).toEqual(expect.not.stringContaining("RETURNING"));
  });

  it("param looseMatch", async () => {
    const res = await ops.updateRow(
      "test",
      "ID",
      { a: 1 },
      { looseMatch: true }
    );
    expect(res[0][0]).toBe(
      "UPDATE test SET a = $1 WHERE id ILIKE $2 RETURNING *;"
    );
  });

  it("throws on empty updateObj", () => {
    expect.assertions(1);
    return expect(ops.updateRow("test", "ID")).rejects.toEqual(
      new Error("No properties provided to update test[ID]")
    );
  });

  it("sends error on empty return", async () => {
    direct.query.mockResolvedValueOnce(null);
    return expect(
      ops.updateRow("test", "ID", { a: 1 })
    ).resolves.toHaveProperty("0.error", "Missing return value.");
  });

  it("uses sqlHelpers", async () => {
    await ops.updateRow("test", "ID", { a: 1 });
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(true);
    expect(firstInner).toHaveBeenCalledTimes(1);
  });

  it("param returnArray", async () => {
    await ops.updateRow("test", "ID", { a: 1 }, { returnArray: true });
    expect(utils.getFirst).toHaveBeenCalledTimes(1);
    expect(utils.getFirst).toHaveBeenCalledWith(false);
  });

  it("no rowId updates all", async () => {
    const res = await ops.updateRow("test", null, { a: 1 });
    expect(res[0][0]).toBe("UPDATE test SET a = $1 RETURNING *;");
  });

  it("uses custom client", async () => {
    await ops.updateRow("test", "ID", { a: 1 }, { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      "UPDATE test SET a = $1 WHERE id = $2 RETURNING *;",
      [1, "ID"]
    );
  });
});

describe("updateRows", () => {
  let origDirectMock;
  const testUpdate = [
    { id: "A", a: 1, b: 2 },
    { id: "B", a: 3, b: 4 },
  ];

  beforeAll(() => {
    origDirectMock = direct.query.getMockImplementation();
    direct.query.mockImplementation((...args) => Promise.resolve([args]));
  });

  afterAll(() => {
    direct.query.mockImplementation(origDirectMock);
  });

  it("correct query", async () => {
    await expect(ops.updateRows("test", testUpdate)).resolves.toEqual([
      {
        0: "UPDATE test SET a = upd.a, b = upd.b FROM (VALUES ($1::UUID, $2, $3), ($4::UUID, $5, $6)) AS upd(id, a, b) WHERE test.id = upd.id RETURNING test.*;",
        1: ["A", 1, 2, "B", 3, 4],
      },
    ]);
  });

  it("checks for SQL injection", async () => {
    await ops.updateRows("test", testUpdate);
    expect(utils.strTest).toHaveBeenCalledTimes(2);
    expect(utils.strTest).toHaveBeenCalledWith(["id", "a", "b"]);
    expect(utils.strTest).toHaveBeenCalledWith(["UUID"]);
  });

  it("param idCol", async () => {
    const res = await ops.updateRows("test", testUpdate, { idCol: "a" });
    expect(res[0][0]).toContain("WHERE test.a = upd.a");
  });

  it("param returning", async () => {
    let res = await ops.updateRows("test", testUpdate, { returning: "custom" });
    expect(res[0][0]).toContain("RETURNING test.custom");
    res = await ops.updateRows("test", testUpdate, {
      returning: "other.custom",
    });
    expect(res[0][0]).toContain("RETURNING other.custom");
    res = await ops.updateRows("test", testUpdate, { returning: null });
    expect(res[0][0]).not.toContain("RETURNING");
  });

  it("param types", async () => {
    let res = await ops.updateRows("test", testUpdate, { types: {} });
    expect(res[0][0]).toContain("$1::UUID,"); // default
    res = await ops.updateRows("test", testUpdate, {
      types: { a: "SMALLINT" },
    });
    expect(res[0][0]).toContain("$2::SMALLINT,");
    res = await ops.updateRows("test", testUpdate, { types: { id: null } });
    expect(res[0][0]).toContain("$1,");
  });

  it('table named "upd"', async () => {
    let res = await ops.updateRows("test", testUpdate);
    expect(res[0][0]).toContain(" = upd.id ");
    res = await ops.updateRows("upd", testUpdate);
    expect(res[0][0]).toContain(" = u.id ");
  });

  it("throws on empty updateObjArr", async () => {
    expect.assertions(3);
    const expectErr = new Error(
      "No properties or keys provided to update test"
    );
    await expect(ops.updateRows("test", [])).rejects.toEqual(expectErr);
    await expect(ops.updateRows("test", null)).rejects.toEqual(expectErr);
    await expect(ops.updateRows("test", [{ a: 1 }, { b: 2 }])).rejects.toEqual(
      expectErr
    );
  });

  it("uses sqlHelpers", async () => {
    await ops.updateRows("test", testUpdate);
    expect(utils.getReturn).toHaveBeenCalledTimes(1);
  });

  it("uses custom client", async () => {
    await ops.updateRows("test", testUpdate, { client });
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE test SET"),
      ["A", 1, 2, "B", 3, 4]
    );
  });
});
