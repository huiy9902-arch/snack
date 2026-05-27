const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readScores() {
  try {
    if (!fs.existsSync(SCORES_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

app.post('/api/scores', (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0 || username.length > 12) {
    return res.status(400).json({ error: '昵称需要1-12个字符' });
  }
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: '分数无效' });
  }

  const name = username.trim();
  const scores = readScores();
  const existing = scores.find(s => s.username === name);
  if (existing) {
    if (score > existing.score) existing.score = score;
  } else {
    scores.push({ username: name, score });
  }

  scores.sort((a, b) => b.score - a.score);
  writeScores(scores);

  res.json({ ok: true, rank: scores.findIndex(s => s.username === name) + 1 });
});

app.get('/api/leaderboard', (_req, res) => {
  const scores = readScores();
  scores.sort((a, b) => b.score - a.score);
  res.json(scores.slice(0, 10));
});

app.listen(PORT, () => {
  console.log(`贪吃蛇游戏运行在 http://localhost:${PORT}`);
});
