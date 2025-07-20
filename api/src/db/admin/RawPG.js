// Allows injection of Raw SQL as argument for pg

const RawPG = (str) => ({
  value: str,
  rawType: true,
  toPostgres: () => str,
  toString: () => str,
});

module.exports = RawPG;
