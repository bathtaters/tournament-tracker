// Imports
const {
  combinationCount,
  getCombinationN,
  getCombinations,
  getUniqueCombinations,
  permutationCount,
  getPermutations,
} = require("./combination.utils");

/** Sort array for comparison */
const sorted = (arr) =>
  arr.map((a) =>
    a?.length && Array.isArray(a[0]) ? sorted(a).sort() : a.sort()
  );

// Tests
describe("combinationCount", () => {
  it("correct combination counts", () => {
    expect(combinationCount(5, 3)).toBe(10); // 5C3
    expect(combinationCount(10, 4)).toBe(210); // 10C4
    expect(combinationCount(7, 7)).toBe(1); // 7C7
    expect(combinationCount(6, 0)).toBe(0); // 6C0 = None
  });
});

describe("getCombinationN", () => {
  it("includes all possible combinations", () => {
    const array = ["A", "B", "C", "D", "E"],
      comboCount = 10; // 5C3 = 10
    let combos = Array(comboCount)
      .fill(null)
      .map((_, c) => getCombinationN(c, array, 3, comboCount));
    combos = sorted(combos);

    expect.assertions(20);
    combos.forEach((combo) => expect(combo).toHaveLength(3));
    expect(combos).toContainEqual(["A", "B", "C"]);
    expect(combos).toContainEqual(["A", "B", "D"]);
    expect(combos).toContainEqual(["A", "B", "E"]);
    expect(combos).toContainEqual(["A", "C", "D"]);
    expect(combos).toContainEqual(["A", "C", "E"]);
    expect(combos).toContainEqual(["A", "D", "E"]);
    expect(combos).toContainEqual(["B", "C", "D"]);
    expect(combos).toContainEqual(["B", "C", "E"]);
    expect(combos).toContainEqual(["B", "D", "E"]);
    expect(combos).toContainEqual(["C", "D", "E"]);
  });
});

describe("getCombinations", () => {
  it("includes all possible combinations", () => {
    const array = ["A", "B", "C", "D"];
    const size = 2;
    let combos = Array.from(getCombinations(array, size));
    combos = sorted(combos);

    expect(combos).toHaveLength(6); // 4C2
    expect(combos).toContainEqual(["A", "B"]);
    expect(combos).toContainEqual(["A", "C"]);
    expect(combos).toContainEqual(["A", "D"]);
    expect(combos).toContainEqual(["B", "C"]);
    expect(combos).toContainEqual(["B", "D"]);
    expect(combos).toContainEqual(["C", "D"]);
  });

  it("invalid inputs return empty array", () => {
    expect(Array.from(getCombinations([], 2))).toEqual([]);
    expect(Array.from(getCombinations(null, 2))).toEqual([]);
  });
});

describe("getUniqueCombinations", () => {
  it("includes all unique combinations", () => {
    const array = [
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 3],
    ];
    let combos = Array.from(getUniqueCombinations(array, 2));
    combos = sorted(combos);

    expect(combos).toHaveLength(4);
    expect(combos).toContainEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(combos).toContainEqual([
      [1, 2],
      [5, 6],
    ]);
    expect(combos).toContainEqual([
      [3, 4],
      [5, 6],
    ]);
    expect(combos).toContainEqual([
      [1, 3],
      [5, 6],
    ]);

    // Overlapping elements are not included
    expect(combos).not.toContainEqual([
      [1, 2],
      [1, 3],
    ]);
    expect(combos).not.toContainEqual([
      [3, 4],
      [1, 3],
    ]);
  });

  it("invalid inputs return empty array", () => {
    expect(Array.from(getUniqueCombinations([], 2))).toEqual([]);
    expect(Array.from(getUniqueCombinations(null, 2))).toEqual([]);
  });
});

describe("permutationCount", () => {
  it("permutation count w/o blanks", () => {
    expect(permutationCount(5, 3, false)).toBe(60); // 5P3
    expect(permutationCount(4, 4, false)).toBe(24); // 4P4
    expect(permutationCount(3, 5, false)).toBe(0); // 3P5 (not enough elements)
  });

  it("permutation count w/ blanks", () => {
    expect(permutationCount(5, 3, true)).toBe(76); // 5P3 w/ blanks
    expect(permutationCount(3, 3, true)).toBe(28); // 3P3 w/ blanks
    expect(permutationCount(3, 5, true)).toBe(76); // 3P5 w/ blanks (Same as 5P3)
  });
});

describe("getPermutations", () => {
  it("includes all possible permutations w/o blanks", () => {
    const array = ["A", "B", "C"];
    let perms = Array.from(getPermutations(array, 2));

    expect(perms).toHaveLength(6); // 3P2
    expect(perms).toContainEqual(["A", "B"]);
    expect(perms).toContainEqual(["A", "C"]);
    expect(perms).toContainEqual(["B", "A"]);
    expect(perms).toContainEqual(["B", "C"]);
    expect(perms).toContainEqual(["C", "A"]);
    expect(perms).toContainEqual(["C", "B"]);
  });

  it("includes all possible permutations w/ blanks", () => {
    const array = ["A", "B"];
    let perms = Array.from(getPermutations(array, 2, true));

    expect(perms).toHaveLength(7); // 2P2 w/ blanks
    expect(perms).toContainEqual(["A", "B"]);
    expect(perms).toContainEqual(["B", "A"]);
    expect(perms).toContainEqual(["A", undefined]);
    expect(perms).toContainEqual(["B", undefined]);
    expect(perms).toContainEqual([undefined, "A"]);
    expect(perms).toContainEqual([undefined, "B"]);
    expect(perms).toContainEqual([undefined, undefined]);
  });
});
