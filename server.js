// import { app } from "./app";
const app = require("./app");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http").Server(app);
const WebSocket = require("ws");
const User = require("./models/userModel");
const decodingToken = require("./utils/decodingToken");
const server = new WebSocket.Server({ port: 8080 });

dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT;
const dbConnectionString = process.env.DATABASE_CONNECTION_STRING.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

app.use(function (req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8888");


  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

 
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  
  res.setHeader("Access-Control-Allow-Credentials", true);

  /
  next();
});
mongoose.connect(
  dbConnectionString,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  () => console.log("DB connected")
);

const clients = [];

server.on("connection", async function connection(ws, req) {
  console.log("client connected");
  clients.push(ws);

  let receivedData = null;
  ws.on("message", async function (event) {
    const data = JSON.parse(event.toString());
    // console.log("received from client:", data);

    if (data.eventCategory) {
      for (let i = 0; i < clients.length; i++) {
        clients[i].send(JSON.stringify(data));
      }
    }
  });
});

http.listen(PORT, () => {
  console.log("server is running");
});
