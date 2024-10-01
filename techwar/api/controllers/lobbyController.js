import { gameStates } from "../../constants.js";
import lobbyModel from "../models/lobbyModel.js";
import teamModel from "../models/teamModel.js";

export const createLobby = async (req, res, next) => {
  const lobbyName = req.body.lobbyname;
  const limit = req.body.limit || 6;
  try {
    const lobby = await lobbyModel.create({
      name: lobbyName,
      limit,
    })
    return res.status(200).json({
      success: true,
      message: "Lobby created successfully",
      lobby: {
        id: lobby.id,
        name: lobby.name,
        state: lobby.state,
        limit: lobby.limit
      }
    })
  } catch(error){
    return next(error);
  }
};

export const getAllLobbies = async (req, res, next)=>{
  try {
    const lobbies = await lobbyModel.find();
    return res.status(200).json({
      success: true,
      lobbies,
    })
  } catch(error){
    return next(error)
  }
  
}

/////////////////////////////////////////////////////////
export const getLobbyData = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    const { _id, name, state, limit, teams, quiz } = lobby;
    teams.sort((team1, team2)=>team2.score - team1.score);
    const teamData = await Promise.all(
      teams.map(async (teamObj) => {
        const team = await teamModel.findById(teamObj.teamId);
        const name = team.name;
        const { score, active } = teamObj; 
        return {
          score,
          active,
          name         
        };
      })
    );
    return res.status(200).json({
      success: true,
      lobby: {
        id: _id,
        name,
        state,
        limit,
        teams: teamData,
        quiz
      }
    })
  } catch(error){
    return next(error);
  }
}

export const getLobbyDisplayData = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    return res.status(200).json({
      success: true,
      lobby: {
        name: lobby.name,
        state: lobby.state,
        teamsCount: lobby.teams.length,
        quiz: lobby.quiz
      }
    })
  } catch(error){
    return next(error);
  }
}
//////////////////////////////////////////////////////////

export const getAvailableLobbies = async (req, res, next)=>{
  try {
    const lobbies = await lobbyModel.find({
      $expr: { $lt: [{ $size: "$teams" }, "$limit"] },
      state: gameStates.idle
    });
    return res.status(200).json({
      availableLobbies: lobbies.map(({ id, name, state })=>({id, name, state})),
      success: true
    })
  } catch(error){
    return next(error);
  }
}

export const deleteLobby = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findOneAndDelete({
      _id: lobbyId
    })
    return res.status(200).json({
      success: true,
      message: "lobby has been successfully deleted",
      lobby,
    })
  } catch(error){
    return next(error);
  }
}
