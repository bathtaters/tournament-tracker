import type { Settings, SettingsType } from "types/base";
import type { SettingsEntry } from "types/models";
import logger from "../utils/log.adapter";

// Convert between values
export function asType({ value, type }: SettingsEntry): any {
  switch (type) {
    case "string":
      return value;
    case "bigint":
    case "number":
      return +value;
    case "date":
      return new Date(value);
    case "boolean":
      return !!value && value !== "false";
    case "object":
    default:
      return value ? JSON.parse(value) : null;
  }
}

function toType(value: any, type: SettingsType): string {
  switch (type) {
    case "string":
      return value;
    case "bigint":
    case "number":
      return value.toString();
    case "boolean":
      return !value || value === "false" ? "false" : "true";
    case "date":
      if (value.toISOString) return value.toISOString();
      else logger.warn("non-date passed as date", value);
    // case "object": ... Do nothing ...
  }
  return value && JSON.stringify(value);
}

function getType(value: any, forceType?: SettingsType) {
  let type = forceType || typeof value;
  if (type === "object" && value && typeof value.toISOString === "function")
    type = "date";
  return { value: toType(value, type), type };
}

export const toObjArray = (settings: Partial<Settings>) =>
  Object.keys(settings).map(
    (id) => ({ ...getType(settings[id]), id }) as SettingsEntry,
  );

export const fromObjArray = (settingsArr: SettingsEntry[]) =>
  (settingsArr ?? []).reduce(
    (settings, entry) => ({ ...settings, [entry.id]: asType(entry) }),
    {} as Partial<Settings>,
  );
