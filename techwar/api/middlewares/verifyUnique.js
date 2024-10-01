import { CustomError } from "../utils/functions.js";
import lobbyModel from "../models/lobbyModel.js";
import teamModel from "../models/teamModel.js";
import territoryModel from "../models/territoryModel.js";

export const verifyUniqueLobby = async (req, res, next)=>{
  const lobbyName = req.body.lobbyname;
  if (!lobbyName) return next(CustomError(400, "Lobby name required"))
  try {
    const lobby = await lobbyModel.findOne({
      name: lobbyName
    })
    if (lobby) return next(CustomError(400, "Lobby already exists"));
    return next();
  } catch(error){
    return next(error);
  }
}

export const verifyUniqueTeam = async (req, res, next)=>{
  const teamName = req.body.teamname;
  if (!teamName) return next(CustomError(400, "Team name required"));
  try {
    const team = await teamModel.findOne({
      name: teamName
    })
    if (team) return next(CustomError(400, "Team already exists"));
    return next();
  } catch(error){
    return next(error);
  }
}

export const verifyUniqueTerritory = async (req, res, next)=>{
  const territoryName = req.body.territoryname;
  if (!territoryName) return next(CustomError(400, "Territory name required"));
  try {
    const territory = await territoryModel.findOne({
      name: territoryName
    })
    if (territory) return next(CustomError(400, "Territory already exists"));
    return next();
  } catch(error){
    return next(error);
  }
}