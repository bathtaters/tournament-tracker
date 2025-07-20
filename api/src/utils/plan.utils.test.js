// Imports/Mocks
const {
  getVoterSlots,
  getEventScores,
  planStatus,
  filterUnvoted,
  resetEvent,
  slotToEvent,
  _unrankedEventFactor,
} = require("./plan.utils");
const { toDateStr, getDayCount } = require("./shared.utils");
const { toObjArray } = require("../services/settings.services");

// Copy algorithm from CODE
const unrankedPenalty = -Math.trunc(3 / _unrankedEventFactor);
expect(unrankedPenalty).toBe(-1); // <- Update if factor changes

// Mock dependencies
jest.mock("./shared.utils", () => ({
  toDateStr: jest.fn((date) => (date instanceof Date ? "DATE" : date)),
  getDayCount: jest.fn((start, end) => 1),
}));

jest.mock("../services/settings.services", () => ({
  toObjArray: jest.fn((obj) => [obj]),
}));

// Setup Tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Tests
describe("planStatus", () => {
  it("returns object array with planstatus only", () => {
    const result = planStatus(1);

    expect(toObjArray).toHaveBeenCalledWith({ planstatus: 1 });
    expect(result).toEqual([{ planstatus: 1 }]);
  });

  it("returns object array with planstatus and planprogress", () => {
    const result = planStatus(1, 50);

    expect(toObjArray).toHaveBeenCalledWith({
      planstatus: 1,
      planprogress: 50,
    });
    expect(result).toEqual([{ planstatus: 1, planprogress: 50 }]);
  });
});

describe("filterUnvoted", () => {
  it("filters events no one voted for", () => {
    const events = [
      { id: "event1", playercount: 2 },
      { id: "event2", playercount: 2 },
      { id: "event3", playercount: 2 },
    ];

    const voters = [
      { id: "voter1", events: ["event1", "event2"] },
      { id: "voter2", events: ["event1"] },
    ];

    const result = filterUnvoted(events, voters);

    expect(result).toEqual([
      { id: "event1", playercount: 2 },
      { id: "event2", playercount: 2 },
    ]);
  });

  it("filters events with too many players", () => {
    const events = [
      { id: "event1", playercount: 2 },
      { id: "event2", playercount: 3 }, // Too many
      { id: "event3", playercount: 1 },
    ];

    const voters = [
      { id: "voter1", events: ["event1", "event2", "event3"] },
      { id: "voter2", events: ["event1", "event2", "event3"] },
    ];

    const result = filterUnvoted(events, voters);

    expect(result).toEqual([
      { id: "event1", playercount: 2 },
      { id: "event3", playercount: 1 },
    ]);
  });

  it("handles events without playercount", () => {
    const events = [
      { id: "event1" }, // No playercount
      { id: "event2", playercount: 3 },
    ];

    const voters = [
      { id: "voter1", events: ["event1", "event2"] },
      { id: "voter2", events: ["event1", "event2"] },
    ];

    const result = filterUnvoted(events, voters);

    expect(result).toEqual([{ id: "event1" }]);
  });
});

describe("getEventScores", () => {
  it("calculates scores correctly", () => {
    const voters = [
      { id: "voter1", events: ["event1", "event2", "event3"] },
      { id: "voter2", events: ["event2", "event1", "event3"] },
    ];

    const result = getEventScores("event1", voters, 3);

    expect(result).toEqual({
      voter1: 3, // First choice (3 - 0)
      voter2: 2, // Second choice (3 - 1)
      _total: 5, // Sum of scores
    });
  });

  it("handles unranked events", () => {
    const voters = [
      { id: "voter1", events: ["event1", "event2"] },
      { id: "voter2", events: ["event2"] }, // No event1
    ];

    const result = getEventScores("event1", voters, 3);

    expect(result).toEqual({
      voter1: 3,
      voter2: unrankedPenalty, // See top of file
      _total: 2,
    });
  });

  it("calculates weighted scores", () => {
    const voters = [
      { id: "voter1", events: ["event1", "event2", "event3"] },
      { id: "voter2", events: ["event2", "event1", "event3"] },
    ];

    const result = getEventScores("event1", voters, 3, true);

    expect(result.voter1).toBeCloseTo(3 / 3); // First choice (3 - 0) / eventCount
    expect(result.voter2).toBeCloseTo(2 / 3); // Second choice (3 - 1) / eventCount
    expect(result._total).toBeCloseTo(5 / 6); // Total (3 + 2) / (events * voters)
  });

  it("handles weighted unranked events", () => {
    const voters = [
      { id: "voter1", events: ["event1", "event2"] },
      { id: "voter2", events: ["event2"] }, // No event1
    ];

    const result = getEventScores("event1", voters, 3, true);

    expect(result.voter1).toBeCloseTo(3 / 3);
    expect(result.voter2).toBeCloseTo(-_unrankedEventFactor);
    expect(result._total).toBeCloseTo((3 + unrankedPenalty) / 6);
    // Total = (3 - 1) / (events * voters)
  });
});

describe("slotToEvent", () => {
  it("converts slot to event data", () => {
    const slot = { id: "event1", players: ["player1", "player2"] };
    const startDate = new Date("2023-01-01 ");
    const result = slotToEvent(slot, 5, 3, startDate);

    expect(result).toEqual({
      id: "event1",
      day: "DATE",
      slot: 3, // 5 % 3 + 1
      players: ["player1", "player2"],
    });

    // Verify date
    expect(toDateStr).toHaveBeenCalled();
    const dateArg = toDateStr.mock.calls[0][0];
    expect(dateArg).toBeInstanceOf(Date);
    expect(dateArg.getDate()).toBe(2); // day + (5 // 3) = 1 + 1
  });

  it("handles different slot indices", () => {
    const slot = { id: "event1", players: [] };
    const startDate = new Date("2023-01-01 ");

    // First slot of first day
    let result = slotToEvent(slot, 0, 3, startDate);
    expect(result.slot).toBe(1); // 0 % 3 + 1

    // Second slot of first day
    result = slotToEvent(slot, 1, 3, startDate);
    expect(result.slot).toBe(2); // 1 % 3 + 1

    // First slot of second day
    result = slotToEvent(slot, 3, 3, startDate);
    expect(result.slot).toBe(1); // 3 % 3 + 1
  });
});

describe("resetEvent", () => {
  it("returns cleared event data", () => {
    const result = resetEvent("event1");

    expect(result).toEqual({
      id: "event1",
      day: null,
      slot: 0,
      players: [],
    });
  });
});

describe("getVoterSlots", () => {
  it("converts voter days to slot numbers", () => {
    const voters = [
      { id: "voter1", days: ["2023-01-01", "2023-01-02"] },
      { id: "voter2", days: ["2023-01-03"] },
    ];
    const startDate = new Date("2023-01-01");

    // Mock getDayCount to return specific values
    getDayCount
      .mockImplementationOnce(() => 1) // First day
      .mockImplementationOnce(() => 2) // Second day
      .mockImplementationOnce(() => 3); // Third day

    const result = getVoterSlots(voters, 3, startDate);

    expect(result).toEqual([
      {
        id: "voter1",
        days: ["2023-01-01", "2023-01-02"],
        ignoreSlots: [0, 1, 2, 3, 4, 5], // Days 1 and 2
      },
      {
        id: "voter2",
        days: ["2023-01-03"],
        ignoreSlots: [6, 7, 8], // Day 3
      },
    ]);

    expect(getDayCount).toHaveBeenCalledTimes(3);
    expect(getDayCount).toHaveBeenNthCalledWith(1, startDate, "2023-01-01");
    expect(getDayCount).toHaveBeenNthCalledWith(2, startDate, "2023-01-02");
    expect(getDayCount).toHaveBeenNthCalledWith(3, startDate, "2023-01-03");
  });

  it("handles empty days array", () => {
    const voters = [{ id: "voter1", days: [] }];

    const result = getVoterSlots(voters, 3, new Date());

    expect(result).toEqual([{ id: "voter1", days: [], ignoreSlots: [] }]);

    expect(getDayCount).not.toHaveBeenCalled();
  });
});
