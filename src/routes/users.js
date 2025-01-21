const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * 회원가입
 * POST /users/signup
 */
router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [username, email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "회원가입 성공", userId: result.insertId });
  });
});

/**
 * 로그인
 * POST /users/login
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ error: "인증 실패" });

    const user = results[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ userId: user.id, message: "로그인 성공", token });
  });
});

/**
 * 회원정보 수정
 * PUT /users/:id
 * 보호된 경로: 토큰 검증 필요
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  // 요청된 id와 토큰의 id를 비교하여 권한 확인
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: "권한이 없습니다." });
  }

  const query =
    "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
  db.query(query, [username, email, password, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ message: "회원정보 수정 성공" });
  });
});

module.exports = { userRoutes: router };
