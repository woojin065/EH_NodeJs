// index.js
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./db"); // db 연결 모듈

// 요청 본문(body)을 JSON으로 파싱
app.use(express.json());

/**
 * 회원가입
 * POST /signup
 * Body: { username, email, password }
 */
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  // 비밀번호는 실제로는 해시화를 거쳐야 함.
  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [username, email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "회원가입 성공", userId: result.insertId });
  });
});

/**
 * 로그인
 * POST /login
 * Body: { email, password }
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ error: "인증 실패" });
    // 실제 환경에서는 토큰 발급 등의 추가 작업 필요
    res.json({ message: "로그인 성공", user: results[0] });
  });
});

/**
 * 회원 수정
 * PUT /users/:id
 * Body: { username, email, password? }
 */
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const query =
    "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
  db.query(query, [username, email, password, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "회원 정보 수정 성공" });
  });
});

/**
 * 할 일 목록 가져오기
 * GET /todos
 * Query Params: page, limit, sortBy, sortOrder, status, search 등 필요에 따라
 */
app.get("/todos", (req, res) => {
  // 페이징, 정렬, 필터링을 위한 쿼리 파라미터 추출
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
    status,
    search,
  } = req.query;
  const offset = (page - 1) * limit;
  let baseQuery = "SELECT * FROM todos WHERE 1=1";
  const params = [];

  // 상태 필터링
  if (status) {
    baseQuery += " AND status = ?";
    params.push(status);
  }
  // 검색어 필터링 (예: title이나 description에 검색어 포함)
  if (search) {
    baseQuery += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  // 정렬, 페이징 추가
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
 * Body: { user_id, title, description, due_date }
 */
app.post("/todos", (req, res) => {
  const { user_id, title, description, due_date } = req.body;
  const query =
    "INSERT INTO todos (user_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  db.query(query, [user_id, title, description, due_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res
      .status(201)
      .json({ message: "새 할 일 추가됨", todoId: result.insertId });
  });
});

/**
 * 기존 할 일 수정
 * PUT /todos/:id
 * Body: { title, description, due_date }
 */
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, due_date } = req.body;
  const query =
    "UPDATE todos SET title = ?, description = ?, due_date = ? WHERE id = ?";
  db.query(query, [title, description, due_date, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "할 일 수정됨" });
  });
});

/**
 * 할 일 상태 업데이트
 * PATCH /todos/:id/status
 * Body: { status }  -- '미완료' 또는 '완료'
 */
app.patch("/todos/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // '미완료' 또는 '완료'
  const query = "UPDATE todos SET status = ? WHERE id = ?";
  db.query(query, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "할 일 상태 업데이트됨" });
  });
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
