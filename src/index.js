const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  //
  const { username } = request.headers;
  const user = users.find( user => user.username === username);
  
  if (!user)
    return response.status(404).json({ error: 'User not found.'});
  
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;

  const user = users.find( user => user.username === username);
  if (user)
    return response.status(400).json({error: 'User not found.'});

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find( todo => todo.id === id);
  
  if (!todo)
    return response.status(404).json({error: 'ToDo not found.'});

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find( todo => todo.id === id);

  if (!todo)
    return response.status(404).json({error: 'ToDo not found.'});
  
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const indexToDo = user.todos.findIndex( todo => todo.id === id);
  
  if (indexToDo === -1)
    return response.status(404).json({error: 'ToDo not found.'});

  user.todos.splice(indexToDo), 1;

  return response.status(204).json();
});

module.exports = app;