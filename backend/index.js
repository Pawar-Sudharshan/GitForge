import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import initRepo from "./controllers/init.js";
import AddFile from "./controllers/add.js";
import CommitFile from "./controllers/commit.js";
import PushFile from "./controllers/push.js";
import PullFile from "./controllers/pull.js";
import RevertFile from "./controllers/revert.js";
import mainRouter from './routes/main.router.js';

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

const cli = yargs(hideBin(process.argv))
  .command("start", "Start new server", {}, async () => {
    await startServer();
  })
  .command("init", "Initialize new repo", {}, (argv) => {
    initRepo(argv);
  })
  .command("add <file>", "Add files to stage", {}, (argv) => {
    AddFile(argv);
  })
  .command("commit <message>", "Save staged changes to history", {}, (argv) => {
    CommitFile(argv);
  })
  .command("push", "Upload local commits to remote repo", {}, (argv) => {
    PushFile(argv);
  })
  .command("pull", "Retrieve remote repo details", {}, (argv) => {
    PullFile(argv);
  })
  .command("revert", "Revert to a previous commit", {}, (argv) => {
    RevertFile(argv);
  })
  .demandCommand(1)
  .help();

await cli.parseAsync();

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in the .env file");
    }

    const app = express();

    const allowedOrigin =
      process.env.CLIENT_URL || "http://localhost:3000";

    // Middleware — order matters: parsers before routers
    app.use(
      cors({
        origin: allowedOrigin,
        credentials: true
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // API routes
    app.use('/', mainRouter);

    // Create HTTP server
    const httpServer = createServer(app);

    // Create Socket.IO server
    const io = new Server(httpServer, {
      cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      const userId = socket.handshake.query.userid;

      console.log("================");
      console.log("User ID:", userId);
      console.log("================");

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // MongoDB connection event
    mongoose.connection.once("open", () => {
      console.log("CRUD operations are ready");
    });

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const PORT = Number(process.env.PORT) || 5000;

    httpServer.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Stop the existing process and try again:\n`);
        console.error(`   Windows: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT} -State Listen | Select-Object -ExpandProperty OwningProcess) -Force`);
        console.error(`   Mac/Linux: kill -9 $(lsof -ti:${PORT})\n`);
      } else {
        console.error("❌ Server error:", err.message);
      }
      process.exitCode = 1;
    });

    httpServer.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
}