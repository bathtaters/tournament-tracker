import type { RequestHandler } from "express";
import type { Team } from "types/models";
import * as teams from "../db/models/team";
import { arrToObj } from "../utils/shared.utils";
import { matchedData } from "express-validator";

// Gets

const getAllTeams: RequestHandler = async (_, res) => {
  const teamMap: TeamMap = await teams.list().then(arrToObj("id"));
  return res.sendAndLog(teamMap);
};

const getTeam: RequestHandler = async (req, res) => {
  const { id } = matchedData(req);
  const teamObj = await teams.get(id);
  return res.sendAndLog(teamObj);
};

const getEventTeams: RequestHandler = async (req, res) => {
  const { id } = matchedData(req);
  const teamMap: TeamMap = await teams.list(id).then(arrToObj("id"));
  return res.sendAndLog(teamMap);
};

// Sets

const createTeam: RequestHandler = async (req, res) => {
  const { players, name } = matchedData(req);
  const result = await teams.add(players, name, req);
  return res.sendAndLog(result);
};

const removeTeam: RequestHandler = async (req, res) => {
  const { id } = matchedData(req);
  const { id: deleted } = await teams.rmv(id, req);
  return res.sendAndLog({ success: deleted === id });
};

const updateTeam: RequestHandler = async (req, res) => {
  const { id, ...updates } = matchedData(req);
  const result = await teams.set(id, updates, req);
  return res.sendAndLog(result);
};

export default {
  getAllTeams,
  getTeam,
  getEventTeams,
  createTeam,
  removeTeam,
  updateTeam,
};

type TeamMap = Record<Team["id"], Team>;
