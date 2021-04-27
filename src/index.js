const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);
  if(!user) {
    return response.status(401).json({ error: "User does not exist, please create an account." });
  }

  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const usernameInUse = users.some(u => u.username === username);

  if(usernameInUse) {
    return response.status(400).json({ error: "Username already in use." });
  }

  const user = {
    id: uuidv4(),
    username,
    name,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todos } = user;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(t => t.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "Todo with the id informed does not exist." });
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(t => t.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "Todo with the id informed does not exist." });
  }

  user.todos[todoIndex].done = !user.todos[todoIndex].done;
  return response.status(200).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(t => t.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({ error: "Todo with the id informed does not exist." });
  }

  user.todos.splice(todoIndex);
  return response.status(204).json();
});

module.exports = app;
