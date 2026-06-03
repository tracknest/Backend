import "./env.ts";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import session from "express-session";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import logger from "./config/logger.ts";
import { RedisStore as SessionRedisStore } from "connect-redis";
import { RedisStore } from "rate-limit-redis";
import compression from "compression";
import hpp from "hpp";
import redisClient, { connectRedis } from "./config/redis.ts";
import passport from "./config/passport.ts";
import authRoutes from "./routes/auth.route.ts";
import swaggerDocs from "./docs/swagger.ts";
import mongoose from "mongoose";
import { createAdapter } from "@socket.io/redis-adapter";
import { verifyCloudinary } from "./config/cloudinary.ts";
import errorHandler from "./middleware/errorHandler.middleware.ts";

// ─── Required ENV Check ───────────────────────────────────────────────────────
const REQUIRED_ENV = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SESSION_SECRET",
  "REDIS_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

REQUIRED_ENV.forEach((env) => {
  if (!process.env[env]) {
    console.error(`Error: Missing required environment variable ${env}`);
    process.exit(1);
  }
});

// ─── App & Server Setup ───────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("chat message", (msg: string) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ─── Mongo Sanitize (manual — replaces express-mongo-sanitize) ───────────────
const mongoSanitize = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
): void => {
  const sanitize = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key] as Record<string, unknown>);
      }
    }
  };

  if (req.body) sanitize(req.body as Record<string, unknown>);
  if (req.params) sanitize(req.params as Record<string, unknown>);
  // intentionally skip req.query — read-only getter in Express 5+

  next();
};

// ─── Database ─────────────────────────────────────────────────────────────────
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error: " + err);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      logger.warn(
        "⚠️  Running without MongoDB — DB-dependent routes will fail. " +
          "Fix: whitelist your IP on MongoDB Atlas → Network Access."
      );
    }
  }
};

// ─── Server Bootstrap ─────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  // 1. Connect Redis first — rate limiter and session store depend on it
  await connectRedis();

  // 2. Core middleware — order matters: security → parsing → sanitization
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "10kb" }));         // ← body parsed HERE, before routes
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(mongoSanitize);
  app.use(hpp());

  // 3. Rate limiter — created after Redis is ready, registered before routes
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
  });
  app.use(globalLimiter);

  // 4. Session store — created after Redis is ready, registered before routes
  app.use(
    session({
      store: new SessionRedisStore({
        client: redisClient as any,
        prefix: "session:",
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );

  // 5. Passport — must come after session middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // 6. Health check — lightweight, no auth needed
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Routes — registered after all middleware is in place
  app.use("/api/v1/auth", authRoutes);

  // 8. Swagger docs
  swaggerDocs(app);

  // 9. 404 handler
  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // 10. Global error handler — must be last
  app.use(errorHandler);

  // 11. Verify Cloudinary credentials
  await verifyCloudinary();

  // 12. Attach Redis adapter to Socket.IO
  const pubClient = redisClient;
  const subClient = redisClient.duplicate();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Socket.IO Redis adapter attached");

  // 13. Connect MongoDB — non-fatal in dev if Atlas IP not whitelisted
  await connectDB();

  // 14. Start listening
  server.listen(PORT, () => {
    logger.info(
      `Server running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`
    );
  });
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    logger.info("HTTP server closed");

    await mongoose.connection.close();
    logger.info("MongoDB connection closed");

    await redisClient.quit();
    logger.info("Redis connection closed");

    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection: " + reason);
  process.exit(1);
});

export { app, server, io };