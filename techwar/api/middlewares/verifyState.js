import lobbyModel from "../models/lobbyModel.js";
import teamModel from "../models/teamModel.js";
import { CustomError } from "../utils/functions.js";

/**
 * to verify current state from array of possible gameStates
 */

export const verifyTeamState = (checkStates)=>{
  return async (req, res, next)=>{
    const teamId = req.teamId;
    try {
      const team = await teamModel.findById(teamId);
      if (!team) return next(CustomError(400, "Team does not exist"));
      for (const state of checkStates){
        if (team.state == state) return next();
      }
      return next(CustomError(400, `team is currently in ${team.state} state`));
    } catch(error){
      return next(error);
    }
  }
}

export const verifyLobbyState = (checkStates)=>{
  return async (req, res, next)=>{
    const lobbyId = req.lobbyId;
    try {
      const lobby = await lobbyModel.findById(lobbyId);
      if (!lobby) return next(CustomError(400, "Lobby does not exist"));
      for (const state of checkStates){
        if (lobby.state == state) return next();
      }
      return next(CustomError(400, `Lobby is currently in ${lobby.state} state`));
    } catch(error){
      return next(error);
    }
  }
}