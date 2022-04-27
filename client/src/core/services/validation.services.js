import valid from "../../assets/validation.json";

export const getBaseData = (key) => ({
  // types: valid.types[key],
  defaults: valid.defaults[key],
  limits: valid.limits[key],
})