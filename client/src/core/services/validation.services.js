import valid from "../../assets/validation.json";

export const metadata = valid.meta;

export const getBaseData = (key) => ({
  // types: valid.types[key],
  defaults: valid.defaults[key],
  limits: valid.limits[key],
});

export const getDefault = (key, id) => valid.defaults[key][id];

export const getLimit = (key, id) => valid.limits[key][id];
