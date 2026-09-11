import express from "express";
import userRouter from "./user.router.js";
import repoRouter from "./repo.router.js";
import issueRouter from "./issue.router.js";

const mainRouter = express.Router();

mainRouter.get("/", (req, res) => {
    res.send("Welcome!");
});

mainRouter.use("/users", userRouter);
mainRouter.use("/repositories", repoRouter);
mainRouter.use("/issues", issueRouter);

export default mainRouter;