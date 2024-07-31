import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

app.use(express.static('public'));

// Object to store users by room
const roomUsers = {};

io.on("connection", (socket) => {
    console.log(`A user is connected with id: ${socket.id}`);


    // Handle joining a room
    socket.on('join-room', (room, user) => {
        socket.join(room);
        console.log(`${user} joined room: ${room}`);
        

        // Initialize room in roomUsers if not exists
        if (!roomUsers[room]) {
            roomUsers[room] = {};
        }
        roomUsers[room][socket.id] = user;

        io.to(room).emit("userList", Object.values(roomUsers[room]));
        io.to(room).emit("userJoin",`${user} joined room`);
    });

    // Handle sending a message
    socket.on("send-msg", (message, room, user) => {
        // For your eyes only! Uncomment for secret message spy mode 😅
        // console.log(`Message received from ${user} in room ${room}: ${message}`);
        
        // Ninja mode: sending the message to everyone in the room except the sneaky sender
        socket.to(room).emit("received", message, user);
    });
    

    // Handle typing notification
    socket.on("typing", (room, userName) => {
        socket.to(room).emit("typing", `${userName} is typing...`);
    });

    socket.on("stop-typing", (room) => {
        socket.to(room).emit("stop-typing");
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected with id: ${socket.id}`);

        for (const [room, users] of Object.entries(roomUsers)) {
            if (users[socket.id]) {
                const userName = users[socket.id];
                delete users[socket.id];

                // Notify the room that the user has left
                io.to(room).emit("receive", `${userName} has left the room`, 'Admin');

                // Send the updated user list
                io.to(room).emit("userList", Object.values(users));
            }
        }

    });

});

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
