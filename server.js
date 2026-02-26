const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      description TEXT,
      amount REAL,
      date TEXT
    )
  `);
});

// ROTAS API

app.get("/api/transactions", (req, res) => {
  db.all("SELECT * FROM transactions", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/api/transactions", (req, res) => {
  const { type, description, amount, date } = req.body;
  db.run(
    `INSERT INTO transactions (type, description, amount, date)
     VALUES (?, ?, ?, ?)`,
    [type, description, amount, date],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/api/transactions/:id", (req, res) => {
  db.run("DELETE FROM transactions WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});