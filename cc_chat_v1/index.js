// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const mongoInit = require('./mongoInit');
//const user;




server.listen(port, () => {

  console.log('Tach! Server listening at port %d', port);
  //mongoInit.mConnect();
  //mongoInit.write2db(res, "test");
  //mongoInit.writeTest();

});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

 
  // when the client emits 'add user', this listens and executes
  socket.on('username entered', (username) => {
    if (addedUser) return;
    mongoInit.callUserPromise(username)
      .then(user => {
        console.log("user in socke.on add user: "+ user);
        if (user == null){ 
          socket.username = username;
          ++numUsers;
          addedUser = true;
          console.log(socket.username);
          console.log("User added");
          mongoInit.writeLogin2db(socket.username);
          console.log("writeLogin2db endend");

          socket.emit('login', {
            numUsers: numUsers
          });
          // echo globally (all clients) that a person has connected
          socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
          });
        } else {
          console.log("username taken: "+ username);
          socket.emit('username taken', username);
        }
      });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      console.log("remove User: "+ socket.username);
      mongoInit.removeLoginFromdb(socket.username);
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
