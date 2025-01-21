const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "토큰이 필요합니다." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
    req.user = user; // 토큰의 payload를 req.user에 저장
    next();
  });
}

module.exports = { authenticateToken };
