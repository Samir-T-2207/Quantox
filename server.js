const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = "./messages.json";

// GET: Nachrichten abrufen
app.get("/api/messages", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Fehler beim Lesen der Datei.");
    const messages = JSON.parse(data || "[]");
    res.json(messages);
  });
});

// POST: Neue Nachricht speichern
app.post("/api/messages", (req, res) => {
  const newMessage = {
    Content: req.body.Content,
    Sender: req.body.Sender,
    Timestamp: new Date()
  };

  fs.readFile(filePath, "utf8", (err, data) => {
    const messages = err ? [] : JSON.parse(data || "[]");
    messages.push(newMessage);

    fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
      if (err) return res.status(500).send("Fehler beim Speichern.");
      res.status(201).send("Nachricht gespeichert!");
    });
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
