import { Router } from "express";
import { verifyLobbyExists, verifyTeamExists } from "../middlewares/verifyExists.js";
import { getAllTeams, getAllTeamsScore, getCurrentScore, getTeamData, loginTeam, logoutTeam } from "../controllers/teamController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router();

router.route("/").get(
  validateToken,
  getTeamData
)

/**
 * Teams login using provided lobby name and their team name
 * BODY: { teamName, lobbyName, password }
 */
router.route("/login").post(
  loginTeam
)

router.route("/score/all").get(
  getAllTeamsScore
)

/**
 * To change the gameState to gameOver for team and lobby (if every team inside lobby agree to the same state)
 * Headers: { (jwt with teamId, lobbyId) }
 */
router.route("/logout").post(
  validateToken,
  verifyLobbyExists,
  verifyTeamExists,
  logoutTeam
)

/**
 * To fetch the current score of a team
 * HEADERS: { (jwt with teamId, lobbyId) }
 */
router.route("/score").get(
  validateToken,
  // verifyLobbyExists,
  verifyTeamExists,
  getCurrentScore
)

export default router;