const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const { v4:uuid } = require("uuid")
const io = require("socket.io")(server, {cors: {origin:"*"}});

const PORT = process.env.PORT || 5000

app.get("/", (req,res) => {
    res.status(200).sendFile(path.join(__dirname,"public","index.html"))
})
let users = [
    {
        id: 1,
        username: "Wandera Rogers",
        messages: []
    },
    {
        id: 2,
        username: "Ngabwa Catherine",
        messages: []
    },
    {
        id: 3,
        username: "Ronald Wandera",
        messages: []
    },
    {
        id: 4,
        username: "Akampa Hillary",
        messages: []
    }
]
const messages = [];
io.on("connection", (socket) => {
    socket.on("loginUser", (data) => {
        const {username} = data;
        const userExists = users.find((user) => user.username === username);
        const otherUsers = users.filter((user) => user.username !== username);
        if(userExists){
            console.log(`logged in as ${username}`)
            socket.emit("userloggedin", {username: userExists.username, userId: userExists.id});
            socket.emit("otherUsers", [...otherUsers])
            socket.on("chatRoom", (room) => {
                const user = otherUsers.find(user => user.id === parseInt(room.id));
                const roomid = user.id + userExists.id
                if(user) {
                    socket.join(roomid)
                    socket.emit("chatPartner", {username: user.username, userId: user.id,roomid})
                    socket.on("chatMessage", (data) => {
                        messages.push(data)
                        io.sockets.in(roomid).emit("messages", messages)
                    })
                }else {
                    console.log("no")
                }
            })
        } else {
            console.log("no user in")
            socket.emit("nouserfound", `No user with ${username} found`)
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})