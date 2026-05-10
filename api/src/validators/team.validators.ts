import { bySet } from "./shared.validators";
import { RequestHandler } from "express";

const validate = bySet("team");

export default {
  id: validate("id") as RequestHandler[],
  createTeam: validate([], "all", false) as RequestHandler[],
  updateTeam: validate("id", "all", true) as RequestHandler[],
};
