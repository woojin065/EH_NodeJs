require("dotenv").config();
const express = require("express");
const { authenticateToken } = require("./src/middleware/auth");
const { userRoutes } = require("./src/routes/users");
const { todoRoutes } = require("./src/routes/todos");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", userRoutes);
app.use("/todos", authenticateToken, todoRoutes);

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
