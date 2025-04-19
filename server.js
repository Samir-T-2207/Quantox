const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let messages = [];

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.post("/messages", (req, res) => {
  const { sender, text } = req.body;
  if (sender && text) {
    const msg = { sender, text, timestamp: Date.now() };
    messages.push(msg);
    res.status(201).json(msg);
  } else {
    res.status(400).send("Missing fields");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
