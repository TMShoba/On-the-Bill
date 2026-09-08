import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

function mapBooking(row) {
  return {
    id: row.id,
    artistId: row.artist_id,
    artistName: row.artist_name,
    clientName: row.client_name,
    clientEmail: row.client_email,
    eventDate: row.event_date,
    venue: row.venue,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

// GET /api/bookings
router.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
    .all();
  res.json(rows.map(mapBooking));
});

// POST /api/bookings
router.post("/", (req, res) => {
  const { artistId, clientName, clientEmail, eventDate, venue, message } =
    req.body;

  if (!artistId || !clientName || !clientEmail || !eventDate) {
    return res.status(400).json({
      message:
        "artistId, clientName, clientEmail and eventDate are required",
    });
  }

  const artist = db
    .prepare("SELECT id, stage_name FROM artists WHERE id = ?")
    .get(artistId);

  if (!artist) {
    return res.status(404).json({ message: "Artist not found" });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO bookings (
      id, artist_id, artist_name, client_name, client_email,
      event_date, venue, message, status, created_at
    ) VALUES (
      @id, @artist_id, @artist_name, @client_name, @client_email,
      @event_date, @venue, @message, 'pending', @created_at
    )`
  ).run({
    id,
    artist_id: artistId,
    artist_name: artist.stage_name,
    client_name: clientName,
    client_email: clientEmail,
    event_date: eventDate,
    venue: venue || "",
    message: message || "",
    created_at: createdAt,
  });

  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  res.status(201).json(mapBooking(row));
});

// PATCH /api/bookings/:id
router.patch("/:id", (req, res) => {
  const { status } = req.body;

  if (!status || !["pending", "confirmed", "declined"].includes(status)) {
    return res.status(400).json({
      message: "status must be pending, confirmed, or declined",
    });
  }

  const existing = db
    .prepare("SELECT id FROM bookings WHERE id = ?")
    .get(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: "Booking not found" });
  }

  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(
    status,
    req.params.id
  );

  const row = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(req.params.id);
  res.json(mapBooking(row));
});

export default router;
