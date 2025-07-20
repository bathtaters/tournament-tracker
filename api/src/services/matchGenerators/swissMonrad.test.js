// Spies
const utils = require("./matchGen.utils");
const avgSpy = jest.spyOn(utils, "avg"),
  errSpy = jest.spyOn(console, "error");
afterAll(() => {
  avgSpy.mockRestore();
  errSpy.mockRestore();
});

// Mocks
const generateMatchups = require("./swissMonrad");

// NOTE: Uses un-mocked matchGen.utils, ensure that passes test first //

describe("generateMatchups", () => {
  let stats, fullStats, blankStats, allMatchups;

  beforeEach(() => {
    stats = {
      a: { matchRate: 0.7, oppMatch: 0.2, gameRate: 0.9, oppGame: 0.3 },
      b: { matchRate: 0.5, oppMatch: 0.5, gameRate: 0.7, oppGame: 0.4 },
      c: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.7, oppGame: 0.3 },
      d: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.3 },
      e: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.2 },
      f: { matchRate: 0.5, oppMatch: 0.4, gameRate: 0.3, oppGame: 0.2 },
      ranking: ["a", "b", "c", "d"],
    };
    fullStats = { ...stats, ranking: stats.ranking.concat("e", "f") };
    blankStats = { ranking: stats.ranking, noStats: true };
    allMatchups = [
      { id: "e", opp: "f", count: 10 },
      { id: "f", opp: "e", count: 10 },
    ];
  });

  it("pairs using stats to rank", () => {
    expect(generateMatchups(stats, { playerspermatch: 2 })).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("randomly pairs w/o data", () => {
    const anyone = expect.stringMatching(/^[abcd]$/);
    expect(generateMatchups(blankStats, { playerspermatch: 2 })).toEqual([
      [anyone, anyone],
      [anyone, anyone],
    ]);
  });

  it("pairs with uneven playerCount", () => {
    expect(generateMatchups(stats, { playerspermatch: 3 })).toEqual([
      ["a", "b", "c"],
      ["d"],
    ]);
  });

  it("works with NaN scores", () => {
    stats.b.gameRate = NaN;
    stats.e.oppGame = NaN;
    expect(generateMatchups(stats, { playerspermatch: 2 })).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("no repeat byes", () => {
    expect(
      generateMatchups(stats, {
        playerspermatch: 3,
        byes: ["d", "c"],
      })
    ).toEqual([["a", "c", "d"], ["b"]]);
  });

  it("no repeat matchups", () => {
    expect(
      generateMatchups(fullStats, {
        playerspermatch: 2,
        oppData: {
          a: ["f", "e", "d", "b"],
          b: ["a", "d"],
          c: ["f"],
          d: ["f", "b", "a"],
          e: ["f", "a"],
          f: ["a", "e", "d", "c"],
        },
      })
    ).toEqual([
      ["a", "c"],
      ["b", "f"],
      ["d", "e"],
    ]);
  });

  it("least amount of repeat byes", () => {
    expect(
      generateMatchups(stats, {
        playerspermatch: 3,
        byes: ["a", "b", "c", "d", "d", "d", "c", "c", "b", "a"],
      })
    ).toEqual([["a", "c", "d"], ["b"]]);
  });

  it("least amount of repeat matchups", () => {
    expect(
      generateMatchups(fullStats, {
        playerspermatch: 2,
        oppData: {
          a: ["f", "f", "f", "e", "e", "d", "d", "d", "b", "c"],
          b: ["a", "d", "d", "d", "c", "e", "f"],
          c: ["f", "f", "b", "a", "d"],
          d: ["f", "f", "b", "b", "b", "a", "a", "a", "c"],
          e: ["f", "f", "f", "a", "a", "b"],
          f: ["a", "a", "a", "e", "e", "e", "d", "d", "c", "c", "b"],
        },
      })
    ).toEqual([
      ["a", "c"],
      ["b", "f"],
      ["d", "e"],
    ]);
  });

  it("pair least paired from all events to tie break", () => {
    const extStats = {
      ...fullStats,
      g: fullStats.f,
      ranking: fullStats.ranking.concat("g"),
    };

    expect(
      generateMatchups(extStats, { playerspermatch: 2, allMatchups })
    ).toEqual([["a", "b"], ["c", "d"], ["e", "g"], ["f"]]);
    expect(generateMatchups(extStats, { playerspermatch: 2 })).toEqual([
      ["a", "b"],
      ["c", "d"],
      ["e", "f"],
      ["g"],
    ]);
  });

  it("throws error and prints reports", () => {
    avgSpy.mockReturnValue(NaN); // force error
    errSpy.mockImplementationOnce(() => {}).mockImplementationOnce(() => {}); // ignore errs
    stats.ranking = [];

    expect(() => generateMatchups(stats, { playerspermatch: 2 })).toThrow(
      "SWISS MONRAD failed to find best match pairing."
    );
    avgSpy.mockReset();

    expect(errSpy).toHaveBeenCalledTimes(2);
    expect(errSpy).toHaveBeenNthCalledWith(
      1,
      "SWISS MONRAD Input Data:",
      stats,
      {
        playerspermatch: 2,
        byes: undefined,
        oppData: undefined,
      }
    );
    expect(errSpy).toHaveBeenNthCalledWith(2, "SWISS MONRAD Results:", {
      bestScore: NaN,
      totalCount: 0,
      playerScores: expect.anything(),
      stats,
    });
  });
});
