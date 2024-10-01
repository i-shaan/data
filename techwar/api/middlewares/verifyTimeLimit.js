import { CustomError } from "../utils/functions.js";
import lobbyModel from "../models/lobbyModel.js"
import { gameStates } from "../../constants.js";

export const verifyQuizRunnig = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    const currentTime = Date.now();
    if (currentTime > lobby.quiz.endedAt.getTime()){
      lobby.state = gameStates.gameOver;
      await lobby.save();
      return res.status(200).json({
        success: false,
        hasQuizEnded: true,
        message: "Quiz has ended."
      })
    }
    return next();
  } catch(error){
    return next(error);
  }
}