import { CustomError } from "../utils/functions.js";
import lobbyModel from "../models/lobbyModel.js";
import teamModel from "../models/teamModel.js";
import jwt from "jsonwebtoken";
import "dotenv/config"
import { gameStates } from "../../constants.js";
const jwtSecret = process.env.JWT_SECRET;

/**
 * Check if lobby is full 
 * if not, then create team and add to lobby
 */

export const createTeam = async (req, res, next)=>{
  const { teamname, password } = req.body;
  const lobbyId = req.lobbyId;
  if (!teamname) return next(CustomError(400, "Team name is required"));
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    if (lobby.teams.length == lobby.limit) return next(CustomError(400, "Lobby is full."));
    const team = await teamModel.create({
      name: teamname,
      lobby_id: lobbyId,
      password,
    });

    lobby.teams.push({ teamId: team._id });
    await lobby.save();
    return res.status(200).json({
      success: true,
      message: "Team has been created and added to lobby successfully",
    })
  } catch(error){
    return next(error);
  }
}

//////////////////////////////////////////////////
// To get team's data
export const getTeamData = async (req, res, next)=>{
  const teamId = req.teamId;
  try {
    const team = await teamModel.findById(teamId);
    return res.status(200).json({
      lobbyId: team.lobby_id,
      name: team.name,
      state: team.state,
      score: team.score,
      areQuestionsSeeded: team.areQuestionsSeeded,
      territories: team.territories,
    })
  } catch(error){
    return next(error);
  }
}

export const updateTeamScore = async (req, res, next)=>{
  const teamId = req.teamId;
  const updateScore = req.body.score;
  try {
    const team = await teamModel.findOneAndUpdate({
      _id: teamId
    }, {
      score: updateScore
    })
    return res.status(200).json({
      success: true,
      message: "Score has been updates successfully",
      team,
    })
  } catch(error){
    return next(error);
  }
}

export const getAllTeamsScore = async (req, res, next)=>{
  try {
    const teams = await teamModel.find();
    const scoreboard = [];
    for (const team of teams){
      const data = { name: team.name, score: team.score }
      scoreboard.push(data);
    }
    scoreboard.sort((f, s)=>s.score-f.score);
    return res.status(200).json({
      success: true,
      scoreboard,
    })
  } catch(error){
    return next(error);
  }
}

// used in 2 places (admin, team)
export const getAllTeams = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    const teamsInLobby = [];
    for (const teamObj of lobby.teams){
      const team = await teamModel.findById(teamObj.teamId);
      const { 
        name, 
        territories, 
        state, 
        areQuestionsSeeded, 
        score 
      } = team;
      teamsInLobby.push({ name, score, state, territories, areQuestionsSeeded });
      teamsInLobby.sort((team1, team2)=>team2.score - team1.score);
    } 
    return res.status(200).json({
      success: true,
      teams: teamsInLobby
    })
  } catch(error){
    return next(error);
  }
}

/////////////////////////////////////////////////////
/**
 * Logs in to a lobby
 * Returns a jwt with userId and lobbyId
 * gameCanStart: (true if activeTeams in lobby = 6 else false)
 */
export const loginTeam = async (req, res, next)=>{
  const { teamname, lobbyname, password } = req.body;
  try {
    const lobby = await lobbyModel.findOne({ name: lobbyname });
    if (!lobby) return next(CustomError(400, "Invalid lobby name."));

    const team = await teamModel.findOne({
      name: teamname,
      lobby_id: lobby.id,
      password,
    })

    if (!team) return next(CustomError(400, "Team does not exist | Team is not a part of this lobby | Incorrect password"));

    if (lobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString()).active){
      return next(CustomError(400, "Team has already been logged in. Multiple logins not allowed."))
    }

    lobby.teams = lobby.teams.map(teamObj=>{
      if (teamObj.teamId.toString() == team._id.toString()){
        teamObj.active = true;
      }
      return teamObj;
    })

    lobby.activeCount += 1;

    const token = jwt.sign({
      teamId: team._id,
      lobbyId: lobby._id
    }, jwtSecret, { expiresIn: '12h' });

    await lobby.save();

    return res.status(200).json({
      success: true,
      message: "Team has been logged in successfully",
      gameCanStart: lobby.activeCount == lobby.limit,
      token,
      activeTeams: lobby.activeCount
    })
  } catch(error){
    return next(error);
  }
}

/**
 * Logout from a lobby
 * Logging out team at the end of game (changing gameState for team to gameOver acception no further request)
 * if (active teams in lobby is 0 then lobby state is also changed to gameOver)
 */
export const logoutTeam = async (req, res, next)=>{
  const teamId = req.teamId;
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    const team = await teamModel.findOne({
      _id: teamId,
      lobby_id: lobbyId
    });
    if (!(lobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString()))) return next(CustomError("Team is not present in this lobby"));
    team.state = gameStates.idle;
    lobby.teams = lobby.teams.map(teamObj=>{
      if (teamObj.teamId.toString() == team._id.toString()){
        teamObj.active = false;
      }
      return teamObj;
    })
    lobby.activeCount -= 1;
    if (lobby.activeCount == 0 && lobby.quiz.endedAt.getTime() < Date.now()) lobby.state = gameStates.gameOver;
    await team.save();
    await lobby.save();
    return res.status(200).json({
      success: true,
      teamState: team.state,
      teamScore: team.score,
      lobbyState: lobby.state,
      activeTeams: lobby.activeCount,
      message: "team has been logged out successfully"
    })
  } catch(error){
    return next(error);
  }
}

/**
 * this gets the current score of a team
 * since a get request, only checking the token and if lobby and team exists or not
 */
export const getCurrentScore = async (req, res, next)=>{
  const teamId = req.teamId;
  try {
    const team = await teamModel.findById(teamId);
    return res.status(200).json({
      success: true,
      currentScore: team.score
    })
  } catch(error){
    return next(error);
  }
}

//////////////////////////////////////////////////
/**
 * To migrate to a new lobby
 * check if already present in new lobby
 * check if new lobby is already full
 * check if previous lobby state is gameOver or not
 * make it inactive for its previous lobby
 * reset user score???
 */
export const migrateTeam = async (req, res, next)=>{
  const teamId = req.teamId;
  const lobbyId = req.lobbyId;
  try {
    const team = await teamModel.findById(teamId);    
    const previousLobby = await lobbyModel.findById(team.lobby_id);
    const lobby = await lobbyModel.findById(lobbyId);
    
    if (lobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString())){
      return next(CustomError(400, "User already present in the requested lobby"));
    }

    if (previousLobby.state != gameStates.gameOver){
      // if lobby is attemting quiz but team has been logged out.
      return next(CustomError(400, "Quiz round for the team's current lobby has not ended."))
    }

    if (lobby.teams.length == lobby.limit){
      return next(CustomError(400, "Requested lobby is full."))
    }

    const prevLobbyTeams = previousLobby.teams;
    prevLobbyTeams.map(team=>{
      if (team.teamId.toString() == team._id.toString()){
        team.active = false;
      }
      return team;
    })
    previousLobby.teams = prevLobbyTeams;
    await previousLobby.save();
    
    lobby.teams.push({
      teamId: team._id,
      score: team.score
    })
    
    team.lobby_id = lobby._id;
    //? team.score = 0
    await lobby.save()
    await team.save();

    return res.status(200).json({
      success: true,
      message: "Successfully migrated team to the requested lobby",
      team: {
        id: team._id,
        name: team.name,
        state: team.state,
        prevScore: previousLobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString()).score,
        prevLobby: previousLobby.name,
        newLobby: lobby.name,
        lobbyState: lobby.state
      }
    })

  } catch(error){
    return next(error);
  }
}


export const forceMigrateTeam = async (req, res, next)=>{
  const teamId = req.teamId;
  const lobbyId = req.lobbyId;
  try {
    const team = await teamModel.findById(teamId);    
    const previousLobby = await lobbyModel.findById(team.lobby_id);
    const lobby = await lobbyModel.findById(lobbyId);

    if (lobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString())){
      return next(CustomError(400, "User already present in the requested lobby"));
    }

    if (lobby.teams.length == lobby.limit){
      return next(CustomError(400, "Requested lobby is full."))
    }
    
    if (previousLobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString()).active) previousLobby.activeCount--;

    previousLobby.teams = previousLobby.teams.filter(teamObj=>{
      if (teamObj.teamId.toString() != team._id.toString()){
        return team;
      }
    })

    team.state = gameStates.idle;
    
    lobby.teams.push({
      teamId: team._id,
      score: team.score
    })

    team.lobby_id = lobby._id;
    
    await lobby.save()
    await previousLobby.save();
    // team.score = 0;
    await team.save();

    return res.status(200).json({
      success: true,
      message: "Successfully migrated team to the requested lobby",
      team: {
        id: team._id,
        name: team.name,
        state: team.state,
        prevLobby: previousLobby.name,
        newLobby: lobby.name,
        lobbyState: lobby.state
      }
    })
    
  } catch(error){
    return next(error);
  }
}
/////////////////////////////////////////////////
