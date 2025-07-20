// Import
const { swapPlayersService, getUniqueIds } = require("./swapPlayers.services");

describe("getUnique IDs", () => {
  it("filters out a dupe", () => {
    expect(
      getUniqueIds(
        [
          { v: "a", x: 1 },
          { v: "b", x: 2 },
          { v: "c", x: 3 },
          { v: "b", x: 4 },
          { v: "d", x: 5 },
        ],
        "v"
      )
    ).toEqual(["a", "b", "c", "d"]);
  });
  it("filters out multiple dupes", () => {
    expect(
      getUniqueIds(
        [
          { v: "a", x: 1 },
          { v: "b", x: 2 },
          { v: "c", x: 3 },
          { v: "b", x: 4 },
          { v: "d", x: 5 },
          { v: "b", x: 6 },
          { v: "d", x: 7 },
          { v: "d", x: 8 },
          { v: "d", x: 9 },
          { v: "b", x: 10 },
        ],
        "v"
      )
    ).toEqual(["a", "b", "c", "d"]);
  });
  it("passes non-duped array", () => {
    expect(
      getUniqueIds(
        [
          { v: "a", x: 1 },
          { v: "b", x: 2 },
          { v: "c", x: 3 },
          { v: "d", x: 4 },
        ],
        "v"
      )
    ).toEqual(["a", "b", "c", "d"]);
  });
  it("passes empty array", () => {
    expect(getUniqueIds([])).toEqual([]);
  });
});

// Test Services & Utils
describe("swapPlayersService + Utils", () => {
  let swaps, matches;

  beforeEach(() => {
    swaps = [{ playerid: "c" }, { playerid: "b" }];
    matches = [
      {
        id: "m1",
        players: ["a", "c"],
        wins: [1, 3],
        drops: ["a"],
        reported: true,
      },
      {
        id: "m2",
        players: ["b", "d"],
        wins: [2, 4],
        drops: ["b"],
        reported: true,
      },
    ];
  });

  it("swaps players", () => {
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ players: ["a", "b"] }),
      expect.objectContaining({ players: ["c", "d"] }),
    ]);
  });
  it("same match", () => {
    swaps[1] = { playerid: "a" };
    matches = [matches[0]];
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ players: ["c", "a"], wins: [3, 1] }),
    ]);
  });
  it("swaps wins", () => {
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ wins: [1, 2] }),
      expect.objectContaining({ wins: [3, 4] }),
    ]);
  });
  it("swaps drops", () => {
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ drops: ["a", "b"] }),
      expect.anything(),
    ]);
  });
  it("passes idx", () => {
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ id: "m1" }),
      expect.objectContaining({ id: "m2" }),
    ]);
  });
  it("swaps player with bye", () => {
    matches[1].players = ["b"];
    matches[1].wins = [2];
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ players: ["a", "b"] }),
      expect.objectContaining({ players: ["c"] }),
    ]);
  });
  it("doesn't swap wins with bye", () => {
    matches[1].players = ["b"];
    matches[1].wins = [2];
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ wins: [1, 3] }),
      expect.objectContaining({ wins: [2] }),
    ]);
  });
  it("swaps drops with bye", () => {
    matches[1].players = ["b"];
    matches[1].wins = [2];
    expect(swapPlayersService(matches, swaps)).toEqual([
      expect.objectContaining({ drops: ["a", "b"] }),
      expect.anything(),
    ]);
  });

  it("clear drops from unreported match", () => {
    matches[1].reported = false;
    expect(swapPlayersService(matches, swaps)[1]).toHaveProperty("drops", []);
  });

  it("throws error for missing player", () => {
    swaps[1].playerid = "a";
    expect(() => swapPlayersService(matches, swaps)).toThrow(
      "Player is not registered for match: a"
    );
  });
});
