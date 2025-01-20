// db.js
require("dotenv").config();
const mysql = require("mysql2");

// 환경 변수에서 데이터베이스 연결 정보 가져오기
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  // GSSAPI 플러그인 요청을 처리하는 더미 핸들러 추가
  authPlugins: {
    auth_gssapi_client: () => () => Buffer.from(""),
  },
});

connection.connect((err) => {
  if (err) {
    console.error("데이터베이스 연결 실패:", err);
    return;
  }
  console.log("데이터베이스에 연결되었습니다.");
});

module.exports = connection;
