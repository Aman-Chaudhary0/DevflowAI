import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const requiredEnvVars = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

function validateEnv() {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
}

async function bootstrap() {
  validateEnv();
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    socket.emit("connected", { socketId: socket.id });
  });

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Devflow AI backend running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
