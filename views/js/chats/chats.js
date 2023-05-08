import chatsController from "./modules/chatsController.js";
const socket = new WebSocket("ws://localhost:8080");

const queryParams = new URLSearchParams(window.location.search);
const chat_id = queryParams.get("chat_id");

const chatController = new chatsController(socket);
chatController.generatePage(chat_id);
