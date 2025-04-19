const express = require("express");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = "./messages.json";

// Hilfsfunktion: prüfen, ob der Request von einem Browser kommt
function isBrowserRequest(req) {
  const accept = req.get("Accept") || "";
  return accept.includes("text/html");
}

// GET: Nachrichten abrufen (404 für Browser, JSON für Clients)
app.get("/api/messages", (req, res) => {
  if (isBrowserRequest(req)) {
    // Browser sieht hier nur 404, kein JSON
    return res.status(404).send("Nicht gefunden");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Fehler beim Lesen der Datei.");
    const messages = JSON.parse(data || "[]");
    res.json(messages);
  });
});

// POST: Neue Nachricht speichern (404 für Browser, JSON für Clients)
app.post("/api/messages", (req, res) => {
  // Browser-/Formular-POSTs über HTML werden hier geblockt
  const contentType = req.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    return res.status(404).send("Nicht gefunden");
  }

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
      res.status(201).json(newMessage);

      // Sende die neue Nachricht an alle verbundenen Clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newMessage));
        }
      });
    });
  });
});

// WebSocket: Wenn ein Client verbunden ist, warte auf Nachrichten
wss.on("connection", (ws) => {
  console.log("Neuer WebSocket-Client verbunden");

  // Sende die letzten Nachrichten an den neuen Client
  fs.readFile(filePath, "utf8", (err, data) => {
    if (!err) {
      const messages = JSON.parse(data || "[]");
      ws.send(JSON.stringify(messages));
    }
  });

  // Wenn der Client eine Nachricht sendet, könnte man darauf reagieren
  ws.on("message", (message) => {
    console.log(`Nachricht vom Client: ${message}`);
  });

  // Wenn die Verbindung geschlossen wird
  ws.on("close", () => {
    console.log("WebSocket-Verbindung geschlossen");
  });
});

// Starte den Server mit WebSocket
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
