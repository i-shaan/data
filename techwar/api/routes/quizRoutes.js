import { Router } from "express";
import { startQuiz, verifyAnswer, submitQuiz } from "../controllers/quizController.js";
import { verifyLobbyExists, verifyTeamExists } from './../middlewares/verifyExists.js';
import { verifyLobbyState } from "../middlewares/verifyState.js";
import { verifyTeamState } from './../middlewares/verifyState.js';
import { gameStates } from "../../constants.js";
import { validateToken } from "../middlewares/validateToken.js";
import { verifyQuizRunnig } from "../middlewares/verifyTimeLimit.js";
const router = Router();

/**
 * ROUTE:- /start?questions=5(default)
 * HEADERS:- { token }
 * check if (lobby state and team state are not quiz)
 * then changes the state for that lobby and teams inside
 * assign questions
 */
router.route("/start").post(
  validateToken,
  verifyLobbyExists, 
  verifyTeamExists,
  verifyLobbyState([gameStates.attack, gameStates.quiz]), // lobby state is controlled by server (idle=>(quiz->deploy->attack)(rounds)=>gameOver)
  verifyTeamState([gameStates.idle, gameStates.quiz]), // if user resends the request in quiz state 
  verifyQuizRunnig,
  startQuiz
)

/**
 * HEADERS:- { token }
 * BODY:- { quesId, answer } (by user)
 * check if (lobby state and team state are quiz)
 * then checks the ans matches that ques
 * changes the question state to attempted.
 * assign points, if correct 
 */
router.route("/question/verify").post(
  validateToken,
  verifyLobbyExists, 
  verifyTeamExists, 
  verifyLobbyState([gameStates.quiz]),
  verifyTeamState([gameStates.quiz]),
  verifyQuizRunnig,
  verifyAnswer
)

/**
 * HEADERS:- { token }
 * check the (lobby and team gameStates are quiz or not.)
 * set all attempting ques to attempted
 * Change the user state to idle
 *? if (last team in lobby is sending the request) change the lobby state to idle
 */
router.route("/submit").post(
  validateToken,
  verifyLobbyExists, 
  verifyTeamExists, 
  verifyLobbyState([gameStates.quiz]),
  verifyTeamState([gameStates.quiz]),
  verifyQuizRunnig,
  submitQuiz
)

export default router;