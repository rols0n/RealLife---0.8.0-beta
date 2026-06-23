// imPORT { app } from "./app";
const app = require("./app");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http").Server(app);
const WebSocket = require("ws");
const User = require("./models/userModel");
const decodingToken = require("./utils/decodingToken");
const server = new WebSocket.Server({ port: 8080 });


const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);



dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 3000;
const dbConnectionString = process.env.DATABASE_CONNECTION_STRING




mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("DB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:");
    console.error(err.message);
    process.exit(1);
  });



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

  
  next();
});


const clients = [];

server.on("connection", async function connection(ws, req) {
  console.log("client connected");
  clients.push(ws);

  let receivedData = null;
  ws.on("message", async function (event) {
    const data = JSON.parse(event.toString());
    
    if (data.eventCategory) {
      for (let i = 0; i < clients.length; i++) {
        clients[i].send(JSON.stringify(data));
      }
    }
  });
});

