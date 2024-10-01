import { Router } from "express"
import { verifyAdmin } from "../../middlewares/verifyAdmin.js";
import { verifyLobbyExistsByName } from "../../middlewares/verifyExists.js";
import { endQuiz, initQuiz } from "../../controllers/quizController.js";
import { gameStates } from "../../../constants.js";
import { verifyLobbyState } from "../../middlewares/verifyState.js";
import { verifyQuizRunnig } from "../../middlewares/verifyTimeLimit.js";

const router = new Router();

// // TODO: comment out lobby limit

router.route("/start").post(
  verifyAdmin,
  verifyLobbyExistsByName,
  verifyLobbyState([ gameStates.idle ]),
  initQuiz
)

router.route("/end").post(
  verifyAdmin,
  verifyLobbyExistsByName,
  verifyLobbyState([ gameStates.quiz ]),
  verifyQuizRunnig,
  endQuiz
)


export default router;