import { Router } from "express"
import { validateToken } from "../middlewares/validateToken.js";
import { getAllTerritories, getAvailableTerritories } from "../controllers/territoryController.js";
import { verifyTeamExists } from "../middlewares/verifyExists.js";

const router = Router();

router.route("/all").get(
  validateToken,
  verifyTeamExists,
  getAllTerritories
)

// not captured
router.route("/free").get(
  validateToken,
  verifyTeamExists,
  getAvailableTerritories
)

export default router;