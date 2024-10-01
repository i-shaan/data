import { gameStates, questionStates, stateDurations } from "../../constants.js";
import { CustomError, shuffleArray } from "../utils/functions.js";
import lobbyModel from "../models/lobbyModel.js";
import teamModel from "../models/teamModel.js";

/**
 * if (quiz){
 *  userState(quiz (that mean ques assigned for that round or not))
 *    checks if amount of questions requested is greater than the size of questions stored in userdb
 *    if (assigned) send the ques in "attempting" state
 *    else send ques in "notAttempted" state and make them "attempting"
 * }
 */
export const initQuiz = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    // if (lobby.teams.length != lobby.limit){
    //   return next(CustomError(400, `Only ${lobby.teams.length} teams are present in lobby. ${lobby.limit} teams are required to init the quiz.`))
    // }
    // If all teams of lobby have logged in then quiz can start
    if (lobby.activeCount != lobby.teams.length) return next(CustomError(400, `Only ${lobby.activeCount} teams has/have joined. Waiting for ${lobby.limit-lobby.activeCount} teams.`));

    lobby.state = gameStates.quiz;
    lobby.quiz.startedAt = Date.now();
    lobby.quiz.endedAt = new Date(lobby.quiz.startedAt.getTime() + stateDurations.quiz);
    await lobby.save();
    
    return res.status(200).json({
      currentState: lobby.state,
      quizStartedAt: lobby.quiz.startedAt,
      quizEndsAt: lobby.quiz.endedAt,
      success: true,
      message: "Quiz has been initialized successfully"
    })
  } catch(error){
    return next(error);
  }
}

export const endQuiz = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  try {
    const lobby = await lobbyModel.findById(lobbyId);
    for (const teamObj of lobby.teams){
      const team = await teamModel.findById(teamObj.teamId);
      if (team.state == gameStates.quiz) return next(CustomError(400, `Team: ${team.name} is still attempting the quiz.`));
    }
    lobby.state = gameStates.gameOver;
    lobby.quiz.endedAt = Date.now();
    await lobby.save();

    return res.status(200).json({
      currentState: lobby.state,
      quizStartedAt: lobby.quiz.startedAt,
      quizEndedAt: lobby.quiz.endedAt,
      success: true,
      message: "Quiz has been ended successfully"
    })
  } catch(error){
    return next(error);
  }
}

export const startQuiz = async (req, res, next)=>{
  const teamId = req.teamId;
  const lobbyId = req.lobbyId;
  const quesCount = parseInt(req.query.questions) || 5;
  try {
    const team = await teamModel.findOne({
      _id: teamId,
      lobby_id: lobbyId
    });

    if (quesCount > team.questions.length) return next(CustomError(400, "Invalid amount of questions requested"));

    const lobby = await lobbyModel.findOne({
      _id: lobbyId,
      "teams.teamId": team._id
    });

    if (!lobby.teams.find(teamObj=>teamObj.teamId.toString() == team._id.toString()).active) return next(CustomError(400, `Team: ${team.name} has not logged in yet.`))
    if (!team.areQuestionsSeeded) return next(CustomError(400, "Question have not been seeded yet."))


    if (team.state == gameStates.quiz){
      const attemptingQuestions = team.questions.filter((question)=>(
        question.state === questionStates.attempting
      ));
      return res.status(200).json({
        questions: attemptingQuestions.map(({ id, question, options })=>({ id, question, options })),
        count: attemptingQuestions.length,
        quiz: lobby.quiz,
        success: true
      })
      
    } else {
        team.state = gameStates.quiz;

        const startIndex = Math.floor(Math.random() * team.questions.length);
        let questions = [];
        const availableQues = team.questions;
        let quesChecked = 0;
        let i = 0;

        while (i < quesCount && quesChecked < availableQues.length){
          const iterator = (i+startIndex) % availableQues.length;
          if (team.questions[iterator].state == questionStates.notAttempted){
            team.questions[iterator].state = questionStates.attempting;
            questions.push(availableQues[iterator]);
            i++;
          }
          quesChecked++;
        }
        
        await team.save();
        await lobby.save();
        
        shuffleArray(questions);

        return res.status(200).json({
          questions: questions.map(
            ({ id, question, options })=>({ id, question, options })
          ),
          count: questions.length,
          quiz: lobby.quiz,
          success: true
        })
    }
  } catch(error){
    return next(error);
  }
}

// TODO: change the logic back to _id intead of s_no
/**
 *  if (question state != attempting) error
 *  else compare and return
 * }
 */


export const verifyAnswer = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  const teamId = req.teamId;
  const quesId = req.body.id;
  const answer = req.body.answer;
  
  try {
    const team = await teamModel.findOne({
      _id: teamId,
      lobby_id: lobbyId
    });

    const questions = [...team.questions];
    let ques = {};
    questions.forEach(question=>{
      if (question.id == quesId){
        if (question.state != questionStates.attempting) return next(CustomError(400, "Invalid question id || question is not in attempting state."));
        question.state = questionStates.attempted;
        ques = question;
      }
    })
    team.questions = questions;
    if (ques.answer == answer){
      team.score += ques.points;
      await team.save();
      
      const lobby = await lobbyModel.findById(team.lobby_id)
      lobby.teams = lobby.teams.map(teamObj=>{
        if (teamObj.teamId.toString() == team._id.toString()){
          teamObj.score = team.score;
        }
        return teamObj;
      })
      await lobby.save();

      return res.status(200).json({
        success: true,
        correct: true,
        pointsWon: ques.points,
        currentScore: team.score,
      })
    } else {
      await team.save();
      return res.status(200).json({
        success: false,
        correct: false,
        pointsWon: 0,
        currentScore: team.score, 
      })
    }

  } catch(error){
    return next(error);
  }
}

/**
 * check if any ques left to attempt
 * set all the attempting question to attempted question
 * change userState to idle
 */
export const submitQuiz = async (req, res, next)=>{
  const lobbyId = req.lobbyId;
  const teamId = req.teamId;
  try {
    const team = await teamModel.findOne({
      _id: teamId,
      lobby_id: lobbyId 
    })

    for (let i = 0; i < team.questions.length; i++){
      if (team.questions[i].state == questionStates.attempting){
        team.questions[i].state = questionStates.attempted;
      }
    }
    
    team.state = gameStates.gameOver;

    await team.save();

    // const lobby = await lobbyModel.findOne({
    //   _id: lobbyId,
    //   "teams.teamId": team._id 
    // });

    // let isQuizOver = true;    
    // for (const teamObj of lobby.teams){
    //   const team = await teamModel.findById(teamObj.teamId);
    //   if (team.state != gameStates.idle) isQuizOver = false;
    // }

    // if (isQuizOver) lobby.state = gameStates.gameOver
    
    // await lobby.save();

    return res.json({
      team: {
        state: team.state,
        score: team.score
      },
      // lobbyState: lobby.state,
      success: true
    })

  } catch(error){
    return next(error);
  }

}
