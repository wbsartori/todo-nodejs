const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  
  if(!user){
    return response.status(400).json({error: "There is no user with this username!"});
  }

  request.user = user;
  
  return next();
}

app.get("/", (resquest, response) => {
  return response.json({message: "Todos Nodejs"})
});

app.get("/users", (request, response) => {    
  return response.json(users);
})

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  users.push({
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  });

  return response.status(200).json(users).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  return response.json(userAlreadyExists);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;  
  const { user } = request;

  const dateFormat = new Date(deadline + " 00:00");

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(dateFormat),
    create_at: new Date()
  }

  user.todos.push(newTodo);

  return response.json(user.todos);
});

app.put("/todo/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  for(let user of users){
    for(let todo of user.todos){
      if(todo.id === id){
        todo.title = title;
        todo.deadline = deadline;
      } 
    }    
  }

  return response.status(200).json(users).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  

  for(let user of users){
    for(let todo of user.todos){
      if(todo.id === id){
        todo.done = true;        
      }
    }    
  }

  return response.status(200).json(users).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;  
    
  for(let user of users){
    for(let todo of user.todos){
      if(todo.id === id){
        user.todos.splice(user, 1);     
      }
    }    
  }
  
  return response.status(200).json(users).send();    
});

module.exports = app;