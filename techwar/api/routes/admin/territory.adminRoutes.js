import { Router } from "express"
import { verifyAdmin } from './../../middlewares/verifyAdmin.js';
import { verifyUniqueTerritory } from "../../middlewares/verifyUnique.js";
import { createTerritory, transferTerritory } from "../../controllers/territoryController.js";
import { verifyTeamExistsByName } from "../../middlewares/verifyExists.js";

const router = new Router();

// TODO: seeding territories

router.route("/create").post(
  verifyAdmin,
  verifyUniqueTerritory,
  createTerritory
)

//add or transfer ownership
// headers: { teamname }
// body: { name (name/alias) }
router.route("/transfer").patch(
  verifyAdmin,
  verifyTeamExistsByName,
  transferTerritory,
)


export default router;