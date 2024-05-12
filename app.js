const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`The server is running at http://localhost/3000/`);
    });
  } catch (e) {
    console.log(`Db error is ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery = `
  SELECT * 
  FROM todo
  WHERE todo LIKE '%${search_q}%'
  `;

  if (priority !== undefined) {
    getTodosQuery += `AND priority = '${priority}'`;
  }

  if (status !== undefined) {
    getTodosQuery += `AND status='${status}'`;
  }

  let dbResponse = await db.all(getTodosQuery);
  response.send(dbResponse);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT * 
  FROM todo
  WHERE id=${todoId}
  `;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
  INSERT INTO todo(id,todo, priority,status)
  VALUES (
      ${id},
      '${todo}',
      '${priority}',
      '${status}'
  )
  `;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, status, priority } = request.body;
  let upd_response = "";

  let updateTodoQuery = `
  UPDATE todo SET
  `;
  if (todo !== undefined) {
    updateTodoQuery += `todo='${todo}' `;
    upd_response = "Todo Updated";
  }

  if (status !== undefined) {
    updateTodoQuery += `status='${status}' `;
    upd_response = "Status Updated";
  }

  if (priority !== undefined) {
    updateTodoQuery += `priority='${priority}' `;
    upd_response = "Priority Updated";
  }

  updateTodoQuery += `WHERE id=${todoId};`;
  const dbResponse = await db.run(updateTodoQuery);
  response.send(upd_response);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const addTodoQuery = `
  DELETE FROM todo
  WHERE id=${todoId};
  `;
  const dbResponse = await db.run(addTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
