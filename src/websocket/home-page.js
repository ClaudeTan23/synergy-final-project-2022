"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSocket = void 0;
const socket_io_1 = require("socket.io");
const env = __importStar(require("dotenv"));
var HomeSocket;
(function (HomeSocket) {
    class Main {
        constructor(http, conn) {
            var _a;
            env.config();
            this.IO = new socket_io_1.Server(http, {
                cors: {
                    origin: (_a = process.env.CORS_URL) === null || _a === void 0 ? void 0 : _a.split(","),
                    credentials: true,
                    allowedHeaders: ["cors-socket-headers"],
                },
            });
            this.IO.on("connection", (socket) => this.RunSocket(socket));
            this.conn = conn;
        }
        RunSocket(socket) {
            this.socket = socket;
            socket.on("userId", (id) => {
                // join own id room
                // socket.join(id);
                // console.log(socket.rooms);
                setTimeout(() => {
                    this.IO.to(id).emit("auth", "success");
                }, 2000);
            });
            socket.on("userIdMessage", (userId) => {
                this.conn.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?", [userId, "Active"], (e, re, f) => {
                    if (!e) {
                        // clientSocket.IO.in(clientSocket.socket.id).socketsLeave("room41");
                        let roomId = JSON.parse(JSON.stringify(re));
                        const rId = roomId;
                        roomId = roomId.map(e => `room${e.um_roomId}`);
                        socket.join(roomId);
                        socket.join(userId);
                        console.log(socket.id + "/");
                    }
                    else {
                        console.log("error");
                    }
                });
            });
            socket.on("msg", (e) => console.log(e));
            socket.on("disconnecting", (e) => {
                this.Disconnected(socket.clientUserId);
                // console.log(socket.clientUserId + " + " + socket.id);
            });
            socket.on("a", (clientSideUserId) => {
                console.log("asd");
                // console.log(clientSideUserId + " + " + socket.id);
            });
            socket.on("t", (clientSideUserId) => {
                this.Disconnected(clientSideUserId);
                // console.log(clientSideUserId + " + " + socket.id);
            });
            socket.on("join-new-group", (newGroup) => {
                socket.join(newGroup.roomId);
            });
            socket.on("join-new-friend-chat", (newFriendChat) => {
                socket.join(newFriendChat.roomId);
            });
            socket.on("join-group-room", (joinGroupRoom) => {
                socket.join(`room${joinGroupRoom.roomId}`);
                console.log(`room${joinGroupRoom.roomId}`);
            });
            socket.on("leave-room", (roomId) => {
                socket.leave(`room${roomId}`);
                console.log("leave");
            });
            socket.on("exit-room", (roomId) => {
                socket.leave(`room${roomId}`);
                console.log("leave");
            });
            socket.on("fetchMsgNum", (bool) => {
                socket.emit("refreshMsgNum", true);
            });
        }
        Disconnected(userId) {
            if (userId === "" || userId === undefined || userId === null) {
                return;
            }
            this.conn.execute("UPDATE user SET socket_exist = socket_exist- ? WHERE id = ?", [1, userId], (err, result, field) => {
                if (!err) {
                    console.log(userId);
                    this.conn.execute("SELECT * FROM user WHERE id = ?", [userId], (e, r, f) => {
                        const socketExist = JSON.parse(JSON.stringify(r));
                        if (socketExist[0].socket_exist <= 0) {
                            this.conn.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?", [userId, "Active"], (error, results, fields) => {
                                if (!error) {
                                    const roomOff = JSON.parse(JSON.stringify(results));
                                    if (socketExist[0].socket_exist <= 0) {
                                        this.conn.execute("UPDATE user SET socket_exist = ?, online_status = ? WHERE id = ?", [0, "off", userId], (ee, rr, ff) => {
                                            if (!ee) {
                                                this.IO.to(roomOff.map(e => `room${e.um_roomId}`)).emit("group-off", roomOff.map(e => e.um_roomId.toString()));
                                            }
                                            else {
                                                console.log("disconnect socket update offline database error");
                                            }
                                        });
                                    }
                                }
                                else {
                                    console.log("disconnect socket offline database error");
                                }
                            });
                        }
                    });
                }
                else {
                    console.log("disconnect socket update database error");
                }
            });
        }
    }
    HomeSocket.Main = Main;
})(HomeSocket = exports.HomeSocket || (exports.HomeSocket = {}));
