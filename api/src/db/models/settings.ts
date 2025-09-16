/* *** SETTINGS Operations *** */
import type { Request } from "express";
import type { SettingsEntry } from "types/models";
import { getRows } from "../admin/interface";
import { addRows, rmvRows } from "./log";

// Batch get settings object
export const getAll = () => getRows<SettingsEntry>("settings");

// Batch set from array of row objects
export const batchSet = (settings: SettingsEntry[], req: Request) =>
  addRows("settings", settings, req, { upsert: true });

export const get = (settings: SettingsEntry["id"][]) =>
  getRows<SettingsEntry>("settings", "WHERE id = ANY($1)", [settings]);

export const rmv = (id: SettingsEntry["id"], req: Request) =>
  rmvRows("settings", id, undefined, req);
