import express from 'express';
import repoController from '../controllers/repoController.js';

const repoRouter = express.Router();

repoRouter.get("/", repoController.getAllRepos);
repoRouter.post("/", repoController.createRepo);
repoRouter.get("/:id", repoController.getRepoById);
repoRouter.put("/:id", repoController.updateRepo);
repoRouter.delete("/:id", repoController.deleteRepo);

export default repoRouter;
