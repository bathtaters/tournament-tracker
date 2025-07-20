// !! Does not Mock plan.utils !! -- If they both fail tests fix plan.utils first. \\
const { generatePlan } = require("./plan.services");
const {
  getDayCount,
  midOut,
  customMax,
  shuffle,
} = require("../utils/shared.utils");
const planUtils = require("../utils/plan.utils");
const { batchSet, get } = require("../db/models/settings");
const { toObjArray, asType } = require("./settings.services");
const { abort, isActive } = require("../utils/multithread.utils");

// Mock dependencies
jest.mock("../utils/shared.utils");
jest.mock("../db/models/settings");
jest.mock("./settings.services");
jest.mock("../utils/multithread.utils");
jest.mock("../utils/log.adapter", () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

// Helper
const dateToStr = (date) => (date ? date.toISOString().split("T")[0] : null);

describe("Plan Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock shared utils
    shuffle.mockImplementation((arr) => [...arr]); // No shuffle, make deterministic
    midOut.mockImplementation(function* (count) {
      for (let i = 0; i < count; i++) {
        yield i;
      } // Modify midOut behavior to simplify
    });
    customMax.mockImplementation((items, getValue) => {
      const values = items.map(getValue);
      const maxVal = Math.max(...values);
      return items[values.findIndex((val) => val === maxVal)];
    });
    getDayCount.mockImplementation((start, end) => {
      return Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
    });

    // Mock settings services
    toObjArray.mockImplementation((obj) =>
      Object.entries(obj).map(([id, value]) => ({ id, value }))
    );
    asType.mockReturnValue(3); // planstatus = 3 (in progress)

    // Mock settings DB
    batchSet.mockResolvedValue();
    get.mockResolvedValue([{ id: "planstatus", value: "3" }]);

    // Mock multithread utils
    isActive.mockReturnValue(true);
    abort.mockResolvedValue();
  });

  describe("generatePlan", () => {
    it("should throw an error with insufficient data", async () => {
      await expect(generatePlan([], [], {})).rejects.toThrow(
        "Insufficient data"
      );
      await expect(generatePlan(null, [], {})).rejects.toThrow(
        "Insufficient data"
      );
      await expect(generatePlan([{ id: "event1" }], [], {})).rejects.toThrow(
        "Insufficient data"
      );
    });

    it("should throw an error when events have invalid player count", async () => {
      const events = [{ id: "event1", playercount: 0 }];
      const voters = [{ id: "voter1", events: ["event1"] }];
      const settings = {
        datestart: "2025-07-15",
        dateend: "2025-07-17",
        dayslots: 2,
      };

      await expect(generatePlan(events, voters, settings)).rejects.toThrow(
        "Invalid event player count"
      );
    });

    it("should throw an error when no events have been voted for", async () => {
      jest.spyOn(planUtils, "filterUnvoted").mockReturnValueOnce([]);

      const events = [{ id: "event1", playercount: 2 }];
      const voters = [{ id: "voter1", events: [], days: [] }];
      const settings = {
        datestart: "2025-07-15",
        dateend: "2025-07-17",
        dayslots: 2,
      };

      await expect(generatePlan(events, voters, settings)).rejects.toThrow(
        "No events have been voted for"
      );
    });

    it("should prioritize plandates and planslots over datestart/end and dayslots", async () => {
      // Setup test data with both specific plan settings and default settings
      const events = [
        { id: "event1", playercount: 2 },
        { id: "event2", playercount: 2 },
        { id: "event3", playercount: 2 },
      ];

      const voters = [
        { id: "voter1", events: ["event1", "event2"], days: [] },
        { id: "voter2", events: ["event1", "event3"], days: [] },
        { id: "voter3", events: ["event2", "event3"], days: [] },
      ];

      // Create settings with both specific plan settings and fallback settings
      const expectedStart = "2025-08-01";
      const expectedEnd = "2025-08-03";
      const settings = {
        // Specific plan settings (should be prioritized)
        plandates: [expectedStart, expectedEnd],
        planslots: 3,

        // Fallback settings (should be used only if specific settings are missing)
        datestart: "2025-07-15",
        dateend: "2025-07-17",
        dayslots: 2,
      };

      // Mock getDayCount to return a specific value for the test
      getDayCount.mockImplementation((start, end) => {
        // Verify that the correct dates were used (from plandates, not datestart/end)
        expect(dateToStr(start)).toEqual(expectedStart);
        expect(dateToStr(end)).toEqual(expectedEnd);
        return 3; // 3 days between Aug 1 and Aug 3
      });

      // Execute the function
      const result = await generatePlan(events, voters, settings);

      // Verify that a slot 3 exists (i.e. planslots=3 was used over dayslots=2)
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ slot: 3 })])
      );

      // Verify that getDayCount was called
      expect(getDayCount).toHaveBeenCalled();
      expect.assertions(4);
    });

    it("should generate a valid plan with correct event assignments", async () => {
      // Setup test data
      const events = [
        { id: "event1", playercount: 2 },
        { id: "event2", playercount: 3 },
        { id: "event3", playercount: 2 },
      ];

      const voters = [
        { id: "voter1", events: ["event1", "event2"], days: ["2025-07-15"] },
        { id: "voter2", events: ["event1", "event3"], days: ["2025-07-16"] },
        { id: "voter3", events: ["event2", "event3"], days: ["2025-07-17"] },
        { id: "voter4", events: ["event2"], days: [] },
        { id: "voter5", events: ["event3"], days: [] },
      ];

      const settings = {
        datestart: "2025-07-15",
        dateend: "2025-07-17",
        dayslots: 2,
      };

      const startDate = new Date(settings.datestart).getTime();
      const endDate = new Date(settings.dateend).getTime();

      // Mock getDayCount to return 3 days
      getDayCount.mockReturnValue(3);

      // Execute the function
      const result = await generatePlan(events, voters, settings);

      // Verify results
      expect(Array.isArray(result)).toBe(true);

      // Check that all events are accounted for
      const scheduled = result.filter(({ day }) => day);
      const unscheduled = result.filter(({ day }) => !day);
      expect(scheduled.length + unscheduled.length).toBe(events.length);

      // Verify each scheduled event has the correct number of players
      for (const event of scheduled) {
        const originalEvent = events.find((e) => e.id === event.id);
        expect(event.players.length).toBe(originalEvent.playercount);

        // Verify slot is within range
        expect(event.slot).toBeLessThan(settings.dayslots);
        expect(event.slot).toBeGreaterThanOrEqual(0);

        // Verify day is within range
        const eventDate = new Date(event.day).getTime();
        expect(eventDate).toBeGreaterThanOrEqual(startDate);
        expect(eventDate).toBeLessThanOrEqual(endDate);

        // Verify players are not assigned to slots they can't attend
        for (const playerId of event.players) {
          const voter = voters.find((v) => v.id === playerId);
          const slotIndex =
            event.slot +
            (getDayCount.mock.results[0].value -
              1 -
              Math.floor((eventDate - startDate) / (24 * 60 * 60 * 1000))) *
              settings.dayslots;
          expect(voter.ignoreSlots).not.toContain(slotIndex);
        }
      }

      // Verify progress updates were called
      expect(batchSet).toHaveBeenCalled();
      expect(toObjArray).toHaveBeenCalledWith(
        expect.objectContaining({ planprogress: expect.any(Number) })
      );
    });

    it("should handle plan cancellation during generation", async () => {
      // Setup test data
      const events = [{ id: "event1", playercount: 2 }];
      const voters = [
        { id: "voter1", events: ["event1"], days: [] },
        { id: "voter2", events: ["event1"], days: [] },
      ];
      const settings = {
        datestart: "2025-07-15",
        dateend: "2025-07-17",
        dayslots: 2,
      };

      // Mock to force a cancel after first progress update
      let callCount = 0;
      asType.mockImplementation(() => {
        callCount++;
        return callCount > 1 ? 2 : 3;
      });

      // Execute the function
      await generatePlan(events, voters, settings);

      // Verify cancellation was triggered
      expect(isActive).toHaveBeenCalled();
      expect(abort).toHaveBeenCalled();
    });
  });
});
