const path = require("path");

const express = require("express");
const usersRouter = require("./routers/usersRouter");
const commentsRouter = require("./routers/commentsRouter");
const postRouter = require("./routers/postsRouter");
const viewRouter = require("./routers/viewsRouter");
const groupsRouter = require("./routers/groupsRouter");
const searchRouter = require("./routers/searchRouter");
const notifications = require("./routers/notificationsRouter");
const chats = require("./routers/chatRouter");

const app = express();

app.engine("pug", require("pug").__express);
app.use(express.static(__dirname + "/views"));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.use("/", viewRouter);

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/searchEngine", searchRouter);

app.use("/api/v1/notifications", notifications);
app.use("/api/v1/chats", chats);
module.exports = app;
