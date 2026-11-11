const { Router } = require("express");
const indexController = require("../controllers/indexController");
const { requireLogin, requireAdmin } = require("../middleware/auth");

const indexRouter = Router();

indexRouter.get("/", indexController.homeGet);
indexRouter.get("/join", requireLogin, indexController.joinGet);
indexRouter.post("/join", requireLogin, indexController.joinPost);
indexRouter.get("/new", requireLogin, indexController.messageGet);
indexRouter.post("/new", requireLogin, indexController.messagePost);
indexRouter.post("/messages/:id/delete", requireAdmin, indexController.messageDelete);

module.exports = indexRouter;
