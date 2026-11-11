const { Router } = require("express");
const authController = require("../controllers/authController");

const authRouter = Router();

authRouter.get("/sign-up", authController.signUpGet);
authRouter.post("/sign-up", authController.signUpPost);
authRouter.get("/log-in", authController.logInGet);
authRouter.post("/log-in", authController.logInPost);
authRouter.get("/log-out", authController.logOut);

module.exports = authRouter;
