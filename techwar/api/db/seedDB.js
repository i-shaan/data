/**
 * Seed Questions, TeamIDs, LobbyIDs into DB
 */
import mongoose from "mongoose"
import teamModel from "../models/teamModel.js"
// import questionModel from "../models/questionsModel.js"
import { questions } from "../../questions.js"
import "dotenv/config"
import { getNQuestions, shuffleArray } from "../utils/functions.js"
import { questionToSeed } from "../../constants.js"
import { connectDB } from "./connectDB.js"

const dbConnectionString = process.env.MONGO_URI

export const seedQuestions = async ()=>{
  try {
    await connectDB(dbConnectionString);
    const teams = await teamModel.find();
    for (const team of teams){
      if (team.areQuestionsSeeded){
        continue;
      }
      console.log(`Team: ${team.name}`);
      let questionsForThisTeam = getNQuestions(questionToSeed, questions);
      shuffleArray(questionsForThisTeam);
      team.questions = questionsForThisTeam;
      team.areQuestionsSeeded = true;
      await team.save();
    } 
    console.log("\nSuccessfully, seeded questions for each team each team");
  } catch (error){
    console.error("Error seeding questions:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seedQuestions();


