import { Router } from "express"
import { verifyAdmin } from "../../middlewares/verifyAdmin.js";
import { verifyUniqueLobby } from "../../middlewares/verifyUnique.js";
import { createLobby, deleteLobby, getAllLobbies, getAvailableLobbies, getLobbyData } from "../../controllers/lobbyController.js";
import { verifyLobbyExistsByName } from "../../middlewares/verifyExists.js";
import { verifyLobbyState } from "../../middlewares/verifyState.js";
import { gameStates } from "../../../constants.js";

const router = new Router();

/** 
 * Admin creates a lobby with custom lobby name
 * BODY: { lobbyName, limit{default: 6} }
 * HEADERS: { adminName }
 */
router.route("/create").post(
  verifyAdmin,
  verifyUniqueLobby,
  createLobby
)

/**
 * To get lobby date (teams score and leaderboard)
 * HEADERS: { adminName, lobbyName }
 */
router.route("/").get(
  verifyAdmin,
  verifyLobbyExistsByName,
  getLobbyData
)

router.route("/all").get(
  verifyAdmin,
  getAllLobbies
)

/**
 * To get lobbies that are not full yet(max-capacity: 6 teams)
 * HEADER: { adminName }
 */
router.route("/available").get(
  verifyAdmin,
  getAvailableLobbies
)


router.route("/").delete(
  verifyAdmin,
  verifyLobbyExistsByName,
  verifyLobbyState([ gameStates.gameOver ]),
  deleteLobby
)


export default router;