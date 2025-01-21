const express = require("express");
const db = require("../database/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * 할 일 목록 가져오기
 * GET /todos
 * 보호된 경로: 토큰 검증 필요
 */
router.get("/", authenticateToken, (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
    status,
    search,
  } = req.query;
  const offset = (page - 1) * limit;
  let baseQuery = "SELECT * FROM todos WHERE user_id = ?";
  const params = [req.user.id];

  if (status) {
    baseQuery += " AND status = ?";
    params.push(status);
  }
  if (search) {
    baseQuery += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  baseQuery += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/**
 * 새로운 할 일 추가
 * POST /todos
 * 보호된 경로: 토큰 검증 필요
 */
router.post("/", authenticateToken, (req, res) => {
  const { title, description, due_date } = req.body;
  const query =
    "INSERT INTO todos (user_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [req.user.id, title, description, due_date],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "새 할 일 추가됨", todoId: result.insertId });
    }
  );
});

/**
 * 기존 할 일 수정
 * PUT /todos/:id
 * 보호된 경로: 토큰 검증 필요
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, due_date } = req.body;

  // 사용자 소유권 확인
  const ownershipQuery = "SELECT * FROM todos WHERE id = ? AND user_id = ?";
  db.query(ownershipQuery, [id, req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(403).json({ error: "수정 권한이 없습니다." });

    const updateQuery =
      "UPDATE todos SET title = ?, description = ?, due_date = ? WHERE id = ?";
    db.query(updateQuery, [title, description, due_date, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "할 일 수정됨" });
    });
  });
});

/**
 * 할 일 상태 업데이트
 * PATCH /todos/:id/status
 * 보호된 경로: 토큰 검증 필요
 */
router.patch("/:id/status", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 사용자 소유권 확인
  const ownershipQuery = "SELECT * FROM todos WHERE id = ? AND user_id = ?";
  db.query(ownershipQuery, [id, req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(403).json({ error: "수정 권한이 없습니다." });

    const updateQuery = "UPDATE todos SET status = ? WHERE id = ?";
    db.query(updateQuery, [status, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "할 일 상태 업데이트됨" });
    });
  });
});

module.exports = { todoRoutes: router };
