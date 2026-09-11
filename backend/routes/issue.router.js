import express from 'express';
import issueController from '../controllers/issueController.js';

const issueRouter = express.Router();

issueRouter.get("/", issueController.getAllIssues);
issueRouter.post("/", issueController.createIssue);
issueRouter.get("/:id", issueController.getIssueById);
issueRouter.put("/:id", issueController.updateIssue);
issueRouter.delete("/:id", issueController.deleteIssue);

export default issueRouter;
