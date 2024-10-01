import "dotenv/config"
import territoryModel from "../models/territoryModel.js"
import teamModel from "../models/teamModel.js";
import { CustomError } from "../utils/functions.js";
import lobbyModel from "../models/lobbyModel.js";

export const createTerritory = async (req, res, next)=>{
  const {territoryname, subterritories, minScore, alias} = req.body;
  try {
    const territory = await territoryModel.create({
      name: territoryname,
      subterritories: subterritories,
      requiredScore: minScore,
    });
    if (alias){
      territory.alias = alias;
      await territory.save();
    }
    const { name, requiredScore, sub, isCaptured, ownerName } = territory;
    return res.status(200).json({
      success: true,
      message: "territory created successfully",
      territory: { name, requiredScore, subterritories: sub, isCaptured, ownerName },
    });
  } catch(error){
    return next(error);
  }
}

export const getAllTerritories = async (req, res, next)=>{
  try {
    const territories = await territoryModel.find();
    return res.status(200).json({
      success: true,
      territories,
    })
  } catch(error){
    return next(error);
  }
}

export const getAvailableTerritories = async (req, res, next)=>{
  try {
    const availableTerritories = await territoryModel.find({
      isCaptured: false
    });
    return res.status(200).json({
      success: true,
      territories: availableTerritories.map((
        { name, requiredScore, subterritories, isCaptured, ownerName }
      )=>(
        { name, requiredScore, subterritories, isCaptured, ownerName }
      )),
    })
  } catch(error){
    return next(error);
  }
}

export const transferTerritory = async (req, res, next)=>{
  const teamId = req.teamId;
  const query = req.body.name;
  const minScore = req.body.score;

  try {
    const territory = await territoryModel.findOne({
      $or : [
        { name: query },
        { alias: { $regex: query, $options: "i" } }
      ]
    });
    const team = await teamModel.findById(teamId);
    // const lobby = await lobbyModel.findById(team.lobby_id);

    if (territory.isCaptured){
      const prevTeamId = territory.capturedBy;
      const prevTeam = await teamModel.findById(prevTeamId);
      if (team.score < prevTeam.score) return next(CustomError(400, "Insufficiant Score"));
      const theirTerritories = prevTeam.territories;
      prevTeam.territories = theirTerritories.filter(territoryObj=>territoryObj._id.toString()!=territory._id.toString());
      await prevTeam.save();
    }
    territory.isCaptured = true;
    territory.capturedBy = teamId;
    territory.ownerName = team.name;
    territory.requiredScore = minScore;
    team.territories.push(territory._id);
    await team.save()
    await territory.save()

    const { 
      name, 
      territories, 
      lobbyId, 
      state, 
      areQuestionsSeeded, 
      score 
    } = team;
    const { name: planetName, requiredScore, subterritories, isCaptured, ownerName } = territory;
    return res.status(200).json({
      success: true,
      territory: { name: planetName, requiredScore, subterritories, isCaptured, ownerName },
      team: { name, territories, lobbyId, state, areQuestionsSeeded, score },
    })
  } catch(error){
    return next(error);
  }
}