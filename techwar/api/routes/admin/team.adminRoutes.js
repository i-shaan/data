import { Router } from "express"
import { verifyAdmin } from "../../middlewares/verifyAdmin.js";
import { verifyLobbyExistsByName, verifyTeamExistsByName } from "../../middlewares/verifyExists.js";
import { verifyUniqueTeam } from "../../middlewares/verifyUnique.js";
import { createTeam, forceMigrateTeam, getAllTeams, getAllTeamsScore, getTeamData, migrateTeam, updateTeamScore } from "../../controllers/teamController.js";
import { gameStates } from "../../../constants.js";
import { verifyLobbyState, verifyTeamState } from "../../middlewares/verifyState.js";

const router = new Router();

/**
 * Admin create a team for a lobby with the available team name
 * and seed ques in userdb
 * HEADERS: { lobbyName, adminName }
 * BODY: { teamName, password }
 */
router.route("/create").post(
  verifyAdmin,
  verifyLobbyExistsByName,
  verifyUniqueTeam,
  createTeam
)

/**
 * To get team data 
 * HEADERS: { adminName, teamname }
 */
router.route("/").get(
  verifyAdmin,
  verifyTeamExistsByName,
  getTeamData
)

router.route("/score").patch(
  verifyAdmin,
  verifyTeamExistsByName,
  updateTeamScore
)
////////////////////////////////////////////////
/**
 * Place team to another lobby,
 * check if team and lobby exists
 * check its state is idle or  not
 * make it inactive for its previous lobby
 * check if already present in new lobby
 * check if new lobby is already full
 * ??? reset user score
 * HEADERS: { adminname, lobbyname, teamname }
*/
router.route("/migrate").post(
  verifyAdmin,
  verifyLobbyExistsByName,
  verifyTeamExistsByName,
  verifyLobbyState([ gameStates.idle ]), // state of new lobby
  verifyTeamState([ gameStates.gameOver ]),
  migrateTeam,
)

/**
 * /team/migrate/force
 * If team mistakenly loses the auth token, admin can forcefully logout the team 
 * team will be removed from the lobby
 * team state will be changed to idle
 * team can be migrated to new lobby, score is reset
 */

router.route("/migrate/force").post(
  verifyAdmin,
  verifyTeamExistsByName,
  verifyLobbyExistsByName,
  verifyLobbyState([ gameStates.idle ]),
  forceMigrateTeam
)

export default router;