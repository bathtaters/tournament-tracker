/* *** PLAYER Object *** */
import type { Request } from "express";
import type { Event, MatchDetail, Player, Team } from "types/models";
import {
  getCount,
  getRow,
  getRows,
  multiQuery,
  query,
} from "../admin/interface";
import { addRows, login, rmvRows, updateRows } from "./log";
import { player as strings } from "../sql/strings";
import { defaults } from "../../config/validation";
import {
  encryptPassword,
  newSessionID,
  passwordsMatch,
  stripPassword,
  testPassword,
} from "../../utils/session.utils";

// Player Table Operations //

/** Get single or all (ids only) players */
export const get = (id: Player["id"]) =>
  getRow<Player>("player", id).then((r) => r && stripPassword(r));

export const getAll = () =>
  getRow<Player>("player", null, "*", { getOne: false }).then((r) =>
    r.map(stripPassword),
  );

export const getUser = (name: Player["name"]) =>
  getRow<Pick<Player, "id" | "password">>("player", name, ["id", "password"], {
    idCol: "name",
    getOne: true,
    looseMatch: true,
  });

export const hasPass = (id: Player["id"]) =>
  getRow<Player>("player", id).then((r) => r && testPassword(r));

export const list = () =>
  getRow<Player>("player", null, ["id"], { getOne: false }).then((r) =>
    r.map(({ id }) => id),
  );

/** Add new player */
export const add = (playerData: Partial<Player>, req: Request) =>
  addRows<Player>("player", [{ ...defaults.player, ...playerData }], req);

export const rmv = (id: Player["id"], req: Request) =>
  rmvRows<Player>("player", id, null, req);

export const set = (
  id: Player["id"],
  newParams: Partial<Player>,
  req: Request,
) => updateRows("player", id, newParams, req);

export const hasAdmin = () => getCount("player", strings.hasAdminFilter);

/** Checks if the given player is an admin and, if so, at least 1 other admin exists (=> true). */
export const isLastAdmin = (id: Player["id"]) =>
  query<{ result: boolean }>(strings.isLastAdmin, [id]).then(
    (r) => r[0]?.result,
  );

/** Start/End/Fetch User Sessions */
export const resetLogin = (id: Player["id"], req: Request) =>
  updateRows<Player>(
    "player",
    id,
    { session: newSessionID(), password: null },
    { ...req, session: { user: req.session.user || id } } as Request,
  ).then((r) => r[0]?.session);

export const startSession = (name: Player["name"], req: Request) =>
  updateRows<Player>(
    "player",
    name.toLowerCase(),
    { session: req.sessionID },
    req,
    {
      idCol: "lower_name",
    },
  ).then((r) => r[0]?.session);

export const sessionPlayer = (session: Player["session"]) =>
  getRow<Player>("player", session, "*", { idCol: "session" }).then(
    (r) => r && stripPassword(r),
  );

export const endSession = (req: Request) =>
  updateRows<Player>("player", req.sessionID, { session: null }, req, {
    idCol: "session",
  });

/** Get Event detail for player */
export const getPlayerEvents = (playerids: Player["id"][]) =>
  multiQuery<Pick<Event, "id">>(
    playerids.map(() => strings.eventFilter),
    playerids.map((id) => [id]),
    true,
  ).then((lists) => lists.map((ids) => ids.map(({ id }) => id)));

/** Get Match detail for player */
export const getPlayerMatches = (playerid: Player["id"]) =>
  getRows<MatchDetail & { teamid: Team["id"] | null }>(
    "matchdetail",
    strings.matchFilter,
    [playerid],
    "m.*, t.id AS teamid",
  );

/** Check password (Or set if no password) --
 *  Return [user, null] on success, [null, reason string] on failure */
export async function checkPassword(
  name: Player["name"],
  password: Player["password"],
  user: Player,
  { sessionID }: Request,
) {
  if (!user?.id) return login(null, sessionID, "Player not found.", name);

  let guess;
  try {
    guess = await encryptPassword(password, user.id);
  } catch (err) {
    return login(
      user.id,
      sessionID,
      err.message || err || "Error encrypting password.",
    );
  }

  if (!user.password)
    return login(
      user.id,
      sessionID,
      "Password not set, contact administrator if you don't have a password link.",
    );

  return login(
    user.id,
    sessionID,
    passwordsMatch(guess, user.password) ? null : "Incorrect password.",
  );
}
