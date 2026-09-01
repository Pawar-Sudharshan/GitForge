import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import initRepo from './controllers/init.js'
import AddFile from './controllers/add.js'
import CommitFile from './controllers/commit.js'
import PushFile from './controllers/push.js'
import PullFile from './controllers/pull.js'
import RevertFile from './controllers/revert.js'
import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import http from "http"
import { Server } from "socket.io"

dotenv.config()


yargs(hideBin(process.argv)).command('start', 'start new server', {}, (argv) => {
  startServer(argv);
}).command('init', 'Initialize new repo', {}, (argv) => {
  initRepo(argv)
}).command('add <file>', 'Add files to stage', {}, (argv) => {
  AddFile(argv)
}).command('commit <message>', 'Save staged changes to history', {}, (argv) => {
  CommitFile(argv)
}).command('push', 'Upload local commits to remote repo', {}, (argv) => {
  PushFile(argv)
}).command('pull', 'Retrieve remote repo details', {}, (argv) => {
  PullFile(argv)
}).command('revert', 'Revert to a previous commit', {}, (argv) => {
  RevertFile(argv)
}).demandCommand(1).help().argv


function startServer() {
  // console.log("server is stated!");
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  // mongoos connection
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("MongoDB connected");
  }).catch((err) => {
    console.log(err);
  });

}