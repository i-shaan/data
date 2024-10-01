import { Router } from "express"
import { validateToken } from "../middlewares/validateToken.js";
import { verifyLobbyExists, verifyTeamExists } from "../middlewares/verifyExists.js";
import { getAllTeams } from "../controllers/teamController.js";
import { getLobbyData, getLobbyDisplayData } from "../controllers/lobbyController.js";

const router = Router();

// to fetch all team of that lobby
router.route("/teams").get(
  validateToken,
  verifyLobbyExists,
  verifyTeamExists,
  getAllTeams
)

router.route("/").get(
  validateToken,
  verifyLobbyExists,
  verifyTeamExists,
  // getLobbyData
  getLobbyDisplayData
)

export default router;