const apps = require("express")();
require("dotenv").config();
const passport = require("passport");
const bodyParser = require("body-parser");
const noc = require("no-console");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(apps);
const io = socketIo(server);
const mongoose = require("mongoose");


// Bootstrap schemas, models
require("./bootstrap");

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.emit('updatedId', socket.id)
    socket.on('join', async (data) => {
        socket.join(data)
        io.to(data).emit('joined-user', socket.id)
    })


    //// video call code start ////
    socket.on("room:join", (data) => {
        const { email, room } = data;
        console.log('data----->', data)
        // emailToSocketIdMap.set(email, socket.id);
        // socketidToEmailMap.set(socket.id, email);
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(socket.id).emit("room:join", data);

    });

    socket.on("user:call", ({ to, offer }) => {
        console.log(to, offer)
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    //// video call code end ////
});
// App configuration
noc(apps);
apps.use(bodyParser.json());
apps.use(passport.initialize());
apps.use(cors());

//Database connection
require("./db");
//Passport configuration
require("./passport")(passport);
//Routes configuration
require("./../src/routes")(apps);
const app = server;
app.app = apps;
module.exports = app;
