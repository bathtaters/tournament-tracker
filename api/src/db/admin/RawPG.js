const RawPG = str => ({
  value: str,
  rawType: true,
  toPostgres: () => str,
  toString: () => str,
});


module.exports = RawPG;