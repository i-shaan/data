import { Router } from "express";

import teamRouter from "./team.adminRoutes.js"
import lobbyRouter from "./lobby.adminRoutes.js"
import territoryRouter from "./territory.adminRoutes.js"
import quizRouter from "./quiz.AdminRoutes.js"

const router = new Router();

router.use("/team", teamRouter);
router.use("/lobby", lobbyRouter);
router.use("/quiz", quizRouter);
router.use("/territory", territoryRouter);

export default router;