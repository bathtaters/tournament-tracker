import type { Limit } from "common/InputForm/InputForm.d";
import { defaults, limits, meta, types } from "../../assets/validation";

export type ValidKey = keyof typeof types;

export const metadata = meta;

export const getBaseData = <K extends ValidKey>(key: K) => ({
  types: types[key] as Record<keyof (typeof types)[K], string>,
  defaults: defaults[key] as Record<keyof (typeof defaults)[K], any>,
  limits: limits[key] as Record<keyof (typeof limits)[K], Limit>,
});

export const getDefault = <K extends ValidKey>(
  key: K,
  id: keyof (typeof defaults)[K],
): any | undefined => defaults[key][id];

export const getLimit = <K extends ValidKey>(
  key: K,
  id: keyof (typeof limits)[K],
): Limit => limits[key][id];
