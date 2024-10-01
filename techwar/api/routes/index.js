import { Router } from "express";
import teamRouter from "./teamRoutes.js";
import quizRouter from "./quizRoutes.js"
import territoryRouter from "./territoryRoutes.js"
import adminRouter from "./admin/index.js"
import lobbyRouter from "./lobbyRoutes.js"

const router = Router();

router.use("/team", teamRouter);
router.use("/quiz", quizRouter);
router.use("/admin", adminRouter);
router.use("/lobby", lobbyRouter);
router.use("/territory", territoryRouter);

export default router;