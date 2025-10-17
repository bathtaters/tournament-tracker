import { defaults, limits, meta, types } from "../../assets/validation";

export type ValidKey = keyof typeof types;

export const metadata = meta;

export const getBaseData = (key: ValidKey) => ({
  types: types[key],
  defaults: defaults[key],
  limits: limits[key],
});

export const getDefault = <K extends ValidKey>(
  key: K,
  id: keyof (typeof defaults)[K],
) => defaults[key][id];

export const getLimit = <K extends ValidKey>(
  key: K,
  id: keyof (typeof limits)[K],
) => limits[key][id];
