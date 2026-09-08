import express from "express";
import cors from "cors";
import db from "./db.js";
import artistsRouter from "./routes/artists.js";
import bookingsRouter from "./routes/bookings.js";
import authRouter from "./routes/auth.js";

// Auto-seed if empty
const artistCount = db.prepare("SELECT COUNT(*) AS c FROM artists").get().c;
if (artistCount === 0) {
  await import("./seed.js");
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "On the Bill API",
    version: "1.1.0",
    database: "SQLite",
    endpoints: {
      artists: "GET /api/artists",
      artist: "GET /api/artists/:id",
      bookings: "GET|POST /api/bookings",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "sqlite",
    time: new Date().toISOString(),
  });
});

app.use("/api/artists", artistsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/auth", authRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`On the Bill API (SQLite) running at http://localhost:${PORT}`);
});
