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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_js_1 = require("crypto-js");
const bcrypt = __importStar(require("bcrypt"));
var Update;
(function (Update) {
    class Like {
        Run(conn, user, postId, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            let liked;
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM likes WHERE post_id = ? AND like_user_id = ?", [postId, userKey.id], (e, r, f) => {
                        if (!e) {
                            const likeData = JSON.parse(JSON.stringify(r));
                            if (likeData.length >= 1) {
                                liked = (likeData[0].liked !== "none") ? true : false;
                                conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err, result, field) => {
                                    const data = JSON.parse(JSON.stringify(result));
                                    if (data.length === 1) {
                                        conn.execute("UPDATE post SET total_likes = ? WHERE post_id = ? AND post_status = ?", [(liked) ? data[0].total_likes - 1 : data[0].total_likes + 1, data[0].post_id, "Active"], (error, results, fields) => {
                                            if (!error) {
                                                conn.execute("UPDATE likes SET liked = ? WHERE like_id = ?", [(liked) ? "none" : "liked", likeData[0].like_id], (E, R, F) => {
                                                    if (!E) {
                                                        res.json({ status: "success", likes: (liked) ? data[0].total_likes - 1 : data[0].total_likes + 1, liked: (liked) ? false : true });
                                                    }
                                                    else {
                                                        res.json({ status: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ status: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ status: "404" });
                                    }
                                });
                            }
                            else {
                                conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err, result, field) => {
                                    const postData = JSON.parse(JSON.stringify(result));
                                    if (postData.length === 1) {
                                        conn.execute("INSERT INTO likes (post_id, like_user_id, liked) VALUES (?, ?, ?)", [postId, userKey.id, "liked"], (error, results, fields) => {
                                            if (!error) {
                                                conn.execute("UPDATE post SET total_likes = ? WHERE post_id = ?", [postData[0].total_likes + 1, postData[0].post_id], (e, r, f) => {
                                                    if (!e) {
                                                        res.json({ status: "success", likes: postData[0].total_likes + 1, liked: true });
                                                    }
                                                    else {
                                                        res.json({ status: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ status: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ status: "database error" });
                                    }
                                });
                            }
                        }
                        else {
                            res.json({ status: "database error" });
                        }
                    });
                }
                else {
                    res.json({ status: "invalid" });
                }
            }
            else {
                res.json({ status: "invalid" });
            }
        }
    }
    Update.Like = Like;
    class Unfriended {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const fId = req.body.fId;
            try {
                if (user !== "" && user !== undefined && fId !== "" && fId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const queryString = mysql2_1.default.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "friended"]);
                    conn.execute(queryString, (err, result, field) => {
                        if (!err) {
                            const friendData = JSON.parse(JSON.stringify(result));
                            if (friendData.length === 2) {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unfriending", "none", userKey.id, fId], (error, results, fields) => {
                                    if (!error) {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unfriended", "none", fId, userKey.id], (e, r, f) => {
                                            if (!e) {
                                                res.json({ success: true });
                                            }
                                            else {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: false, status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ success: false, status: "invalid data" });
                            }
                        }
                        else {
                            res.json({ success: false, status: "database error" });
                        }
                    });
                }
                else {
                    res.json({ success: false, status: "invalid" });
                }
            }
            else {
                res.json({ success: false, status: "invalid" });
            }
        }
    }
    Update.Unfriended = Unfriended;
    class CancelRequest {
        Run(conn, req, res, socketClient) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const fId = req.body.userId;
            try {
                if (user !== "" && user !== undefined && fId !== "" && fId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const queryString = mysql2_1.default.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "pending"]);
                    conn.execute(queryString, (e, r, f) => {
                        if (!e) {
                            const queryResult = JSON.parse(JSON.stringify(r));
                            if (queryResult.length === 2) {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["canceling", "none", userKey.id, fId], (err, result, field) => {
                                    if (!err) {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["canceled", "none", fId, userKey.id], (error, results, fields) => {
                                            if (!error) {
                                                socketClient.IO.to([fId.toString(), userKey.id.toString()]).emit("noticeFriend", 1);
                                                res.json({ success: true });
                                            }
                                            else {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: false, status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ success: false, status: "invalid" });
                            }
                        }
                        else {
                            res.json({ success: false, status: "database error" });
                        }
                    });
                }
                else {
                    res.json({ success: false, status: "invalid" });
                }
            }
            else {
                res.json({ success: false, status: "invalid" });
            }
        }
    }
    Update.CancelRequest = CancelRequest;
    class ConfirmRequest {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const fId = req.body.userId;
            try {
                if (user !== "" && user !== undefined && fId !== "" && fId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const queryString = mysql2_1.default.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "pending"]);
                    conn.execute(queryString, (e, r, f) => {
                        if (!e) {
                            const queryResult = JSON.parse(JSON.stringify(r));
                            if (queryResult.length === 2) {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["accepted", "friended", userKey.id, fId], (err, result, field) => {
                                    if (!err) {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["requesting", "friended", fId, userKey.id], (error, results, fields) => {
                                            if (!error) {
                                                res.json({ success: true });
                                                clientSocket.IO.to(userKey.id.toString()).emit("update-friend-notice", true);
                                            }
                                            else {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: false, status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ success: false, status: "invalid" });
                            }
                        }
                        else {
                            res.json({ success: false, status: "database error" });
                        }
                    });
                }
                else {
                    res.json({ success: false, status: "invalid" });
                }
            }
            else {
                res.json({ success: false, status: "invalid" });
            }
        }
    }
    Update.ConfirmRequest = ConfirmRequest;
    class Blocked {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const fId = req.body.userId;
            try {
                if (user !== "" && user !== undefined && fId !== "" && fId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const query = mysql2_1.default.format("SELECT * FROM friends FULL JOIN user ON friend_id = user.id WHERE userId in ? AND friend_id in ?", [[[userKey.id, fId]], [[userKey.id, fId]]]);
                    conn.execute(query, (e, r, f) => {
                        if (!e) {
                            const numRows = JSON.parse(JSON.stringify(r));
                            if (numRows.length === 2) {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["blocking", "blocked", userKey.id, fId], (err, result, field) => {
                                    if (!err) {
                                        conn.execute("SELECT * FROM friends WHERE userId = ? AND friend_id = ? AND action = ?", [fId, userKey.id, "blocking"], (er, re, fi) => {
                                            const result = JSON.parse(JSON.stringify(re));
                                            if (result.length === 0) {
                                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["blocked", "blocked", fId, userKey.id], (error, results, fields) => {
                                                    if (!error) {
                                                        res.json({ success: true });
                                                        clientSocket.IO.to(userKey.id.toString()).emit("update-friend-notice", true);
                                                    }
                                                    else {
                                                        res.json({ success: false, result: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ success: true });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: false, result: "database error" });
                                    }
                                });
                            }
                            else {
                                conn.execute("INSERT INTO friends (userId, friend_id, action, f_status) VALUES (?, ?, ?, ?), (?, ?, ?, ?)", [userKey.id, fId, "blocking", "blocked", fId, userKey.id, "blocked", "blocked"], (iErr, iResult, iField) => {
                                    if (!iErr) {
                                        res.json({ success: true });
                                    }
                                    else {
                                        res.json({ success: false, result: "database error" });
                                    }
                                });
                            }
                        }
                        else {
                            res.json({ success: false, result: "database error" });
                        }
                    });
                }
                else {
                    res.json({ success: false, result: "invalid" });
                }
            }
            else {
                res.json({ success: false, result: "invalid" });
            }
        }
    }
    Update.Blocked = Blocked;
    class Unblock {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const fId = req.body.userId;
            try {
                if (user !== "" && user !== undefined && fId !== "" && fId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const query = mysql2_1.default.format("SELECT * FROM friends FULL JOIN user ON friend_id = user.id WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[fId, userKey.id]], [[fId, userKey.id]], "blocked"]);
                    conn.execute(query, (e, r, f) => {
                        if (!e) {
                            const numRows = JSON.parse(JSON.stringify(r));
                            if (numRows.length === 2) {
                                conn.execute("SELECT * FROM friends WHERE friend_id = ? AND userId = ? AND action = ?", [userKey.id, fId, "blocking"], (er, re, fi) => {
                                    if (!er) {
                                        const rows = JSON.parse(JSON.stringify(re));
                                        if (rows.length === 0) {
                                            conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unblocking", "none", userKey.id, fId], (err, result, field) => {
                                                if (!err) {
                                                    conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unblocked", "none", fId, userKey.id], (error, results, fields) => {
                                                        if (!error) {
                                                            res.json({ success: true });
                                                        }
                                                        else {
                                                            res.json({ success: false, result: "database error" });
                                                        }
                                                    });
                                                }
                                                else {
                                                    res.json({ success: false, result: "database error" });
                                                }
                                            });
                                        }
                                        else {
                                            conn.execute("UPDATE friends SET action = ? WHERE userId = ? AND friend_id = ?", ["blocked", userKey.id, fId], (err, result, field) => {
                                                if (!err) {
                                                    res.json({ success: true });
                                                }
                                                else {
                                                    res.json({ success: false, result: "database error" });
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        res.json({ success: false, result: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ success: false, result: "invalid" });
                            }
                        }
                        else {
                            res.json({ success: false, result: "database error" });
                        }
                    });
                }
                else {
                    res.json({ success: false, result: "invalid" });
                }
            }
            else {
                res.json({ success: false, result: "invalid" });
            }
        }
    }
    Update.Unblock = Unblock;
    class UpdateUnseen {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const roomId = req.body.roomId;
            try {
                if (user !== "" && user !== undefined && roomId !== "" && roomId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("UPDATE user_message_room SET unseen_msg = ? WHERE um_roomId = ? AND um_userId = ?", [0, roomId, userKey.id.toString()], (err, result, field) => {
                        if (!err) {
                            res.json({ success: true });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.UpdateUnseen = UpdateUnseen;
    class DeleteMessage {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const maxMsgId = req.body.latestMsgId.toString();
            const groupId = req.body.groupId.toString();
            try {
                if (user !== "" && user !== undefined && maxMsgId !== "" && maxMsgId !== undefined && groupId !== "" && groupId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("UPDATE user_message_room SET delete_status = ?, delete_time = ? WHERE um_userId = ? AND um_roomId = ?", ["delete", maxMsgId, userKey.id.toString(), groupId], (e, r, f) => {
                        if (!e) {
                            res.json({ success: true });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.DeleteMessage = DeleteMessage;
    class RemoveGroupMember {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const roomId = req.body.groupId.toString();
            const memberId = req.body.memberId.toString();
            const chatMaxId = req.body.maxChatId.toString();
            try {
                if (user !== "" && user !== undefined && roomId !== "" && roomId !== undefined && memberId !== "" && memberId !== undefined && chatMaxId !== "" && chatMaxId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_type = ? AND chat_status = ?", [roomId, "group", "Active"], (e, r, f) => {
                        if (!e) {
                            const checkAdmin = JSON.parse(JSON.stringify(r));
                            if (checkAdmin.length === 1) {
                                if (checkAdmin[0].chat_adminId.toString() === userKey.id.toString()) {
                                    const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                                    conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "removed", time, "Active"], (error, results, fields) => {
                                        if (!error) {
                                            const insertId = results.insertId;
                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf) => {
                                                if (!se) {
                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                    membersId = membersId.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                    conn.execute(queryMember, (sse, ssr, ssf) => {
                                                        if (!sse) {
                                                            conn.execute("UPDATE user_message_room SET um_remove_time = ?, um_status = ? WHERE um_userId = ? AND um_roomId = ?", [insertId, "removed", memberId, roomId], (err, result, field) => {
                                                                if (!err) {
                                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (ee, rr, ff) => {
                                                                        if (!ee) {
                                                                            const msg = JSON.parse(JSON.stringify(rr));
                                                                            const completedMsg = msg.map((e) => {
                                                                                return {
                                                                                    message_id: e.message_id,
                                                                                    m_room_id: e.m_room_id,
                                                                                    user_id: e.user_id,
                                                                                    message_content: e.message_content,
                                                                                    message_type: e.message_type,
                                                                                    message_time: e.message_time,
                                                                                    message_status: e.message_status,
                                                                                    username: e.username,
                                                                                    name: e.name,
                                                                                    profile: e.profile,
                                                                                    status: e.status,
                                                                                    date_join: e.date_join,
                                                                                    online_status: e.online_status,
                                                                                    me: e.id.toString(),
                                                                                };
                                                                            });
                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0], { roomId: roomId, memberId: memberId, type: "removed" });
                                                                            res.json({ success: true });
                                                                        }
                                                                        else {
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    res.json({ success: false });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.json({ success: false });
                                                        }
                                                    });
                                                }
                                                else {
                                                    res.json({ success: false });
                                                }
                                            });
                                        }
                                        else {
                                            res.json({ success: false });
                                        }
                                    });
                                }
                                else {
                                    res.json({ success: false });
                                }
                            }
                            else {
                                res.json({ success: false });
                            }
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.RemoveGroupMember = RemoveGroupMember;
    class DisbandGroup {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const roomId = req.body.roomId.toString();
            try {
                if (user !== "" && user !== undefined && roomId !== "" && roomId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_type = ? AND chat_status = ?", [roomId, "group", "Active"], (e, r, f) => {
                        if (!e) {
                            const checkAdmin = JSON.parse(JSON.stringify(r));
                            if (checkAdmin.length === 1) {
                                if (checkAdmin[0].chat_adminId.toString() === userKey.id.toString()) {
                                    const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                                    conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, userKey.id, "none", "disband", time, "Active"], (error, results, fields) => {
                                        if (!error) {
                                            const insertId = results.insertId;
                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf) => {
                                                if (!se) {
                                                    let totalMemberId = JSON.parse(JSON.stringify(sr));
                                                    totalMemberId = totalMemberId.map(e => e.um_userId.toString());
                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                    membersId = membersId.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                    conn.execute(queryMember, (sse, ssr, ssf) => {
                                                        if (!sse) {
                                                            const disbandNoticeQuery = mysql2_1.default.format("UPDATE user_message_room SET um_remove_time = ?, um_status = ? WHERE um_userId IN ? AND um_roomId = ?", [insertId, "disband", totalMemberId.length >= 1 ? [totalMemberId] : [[""]], roomId]);
                                                            conn.execute(disbandNoticeQuery, (err, result, field) => {
                                                                if (!err) {
                                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (ee, rr, ff) => {
                                                                        if (!ee) {
                                                                            const msg = JSON.parse(JSON.stringify(rr));
                                                                            const completedMsg = msg.map((e) => {
                                                                                return {
                                                                                    message_id: e.message_id,
                                                                                    m_room_id: e.m_room_id,
                                                                                    user_id: e.user_id,
                                                                                    message_content: e.message_content,
                                                                                    message_type: e.message_type,
                                                                                    message_time: e.message_time,
                                                                                    message_status: e.message_status,
                                                                                    username: e.username,
                                                                                    name: e.name,
                                                                                    profile: e.profile,
                                                                                    status: e.status,
                                                                                    date_join: e.date_join,
                                                                                    online_status: e.online_status,
                                                                                    me: e.id.toString(),
                                                                                };
                                                                            });
                                                                            conn.execute("UPDATE message_room SET chat_status = ? WHERE chat_id = ?", ["disband", roomId], (de, dr, df) => {
                                                                                if (!de) {
                                                                                    clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                                    res.json({ success: true });
                                                                                }
                                                                                else {
                                                                                    res.json({ success: false });
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    res.json({ success: false });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.json({ success: false });
                                                        }
                                                    });
                                                }
                                                else {
                                                    res.json({ success: false });
                                                }
                                            });
                                        }
                                        else {
                                            res.json({ success: false });
                                        }
                                    });
                                }
                                else {
                                    res.json({ success: false });
                                }
                            }
                            else {
                                res.json({ success: false });
                            }
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.DisbandGroup = DisbandGroup;
    class ExitGroup {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const roomId = req.body.roomId.toString();
            try {
                if (user !== "" && user !== undefined && roomId !== "" && roomId !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_status = ?", [roomId, "Active"], (eee, rrr, fff) => {
                        const checkGroupNum = JSON.parse(JSON.stringify(rrr));
                        if (checkGroupNum.length === 1) {
                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ?", [roomId, "Active"], (e, r, f) => {
                                if (!e) {
                                    let memberId = JSON.parse(JSON.stringify(r));
                                    memberId = memberId.map(e => e.um_userId.toString());
                                    if (memberId.includes(userKey.id.toString())) {
                                        const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                                        conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, userKey.id, "none", "exit group", time, "Active"], (ee, rr, ff) => {
                                            if (!ee) {
                                                const insertId = rr.insertId;
                                                conn.execute("UPDATE user_message_room SET um_status = ?, um_remove_time = ? WHERE um_userId = ? AND um_roomId = ?", ["exit group", insertId, userKey.id, roomId], (err, result, field) => {
                                                    if (!err) {
                                                        const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, memberId.length >= 1 ? [memberId] : [[""]], "Active"]);
                                                        conn.execute(queryMember, (error, results, fields) => {
                                                            if (!error) {
                                                                conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (me, mr, mf) => {
                                                                    if (!me) {
                                                                        const msg = JSON.parse(JSON.stringify(mr));
                                                                        const completedMsg = msg.map((e) => {
                                                                            return {
                                                                                message_id: e.message_id,
                                                                                m_room_id: e.m_room_id,
                                                                                user_id: e.user_id,
                                                                                message_content: e.message_content,
                                                                                message_type: e.message_type,
                                                                                message_time: e.message_time,
                                                                                message_status: e.message_status,
                                                                                username: e.username,
                                                                                name: e.name,
                                                                                profile: e.profile,
                                                                                status: e.status,
                                                                                date_join: e.date_join,
                                                                                online_status: e.online_status,
                                                                                me: e.id.toString(),
                                                                            };
                                                                        });
                                                                        clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0], { roomId: roomId, memberId: userKey.id.toString(), type: "exitGroup" });
                                                                        res.json({ success: true });
                                                                    }
                                                                    else {
                                                                        res.json({ success: false });
                                                                    }
                                                                });
                                                            }
                                                            else {
                                                                res.json({ success: false });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.json({ success: false });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ success: false });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: false });
                                    }
                                }
                                else {
                                    res.json({ success: false });
                                }
                            });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
            }
        }
    }
    Update.ExitGroup = ExitGroup;
    class UpdateUserBackground {
        Run(conn, user, file, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: true, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            let returnResult;
            if (jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined) {
                if (jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("UPDATE user SET background = ? WHERE id = ?", [file.join(","), jsonKey.id], (e, r, f) => {
                        if (!e) {
                            res.json({ success: true });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.UpdateUserBackground = UpdateUserBackground;
    class UpdateUserProfile {
        Run(conn, user, file, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: true, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            let returnResult;
            if (jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined) {
                if (jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("UPDATE user SET profile = ? WHERE id = ?", [file.join(","), jsonKey.id], (e, r, f) => {
                        if (!e) {
                            res.json({ success: true });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.UpdateUserProfile = UpdateUserProfile;
    class UpdateUserName {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const name = req.body.name.toString();
            try {
                if (user !== "" && user !== undefined && name !== "" && name !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("UPDATE user SET name = ? WHERE id = ?", [name, userKey.id], (e, r, f) => {
                        if (!e) {
                            res.json({ success: true });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.UpdateUserName = UpdateUserName;
    class UpdateUserPassword {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user;
            const password = req.body.password.toString();
            try {
                if (user !== "" && user !== undefined && password !== "" && password !== undefined) {
                    const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
                }
                else {
                    res.json({ success: false, status: "invalid" });
                    return;
                }
            }
            catch (e) {
                res.json({ success: false, status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (!err) {
                            conn.execute("UPDATE user SET password = ? WHERE id = ?", [hash, userKey.id], (e, r, f) => {
                                if (!e) {
                                    res.json({ success: true });
                                }
                                else {
                                    res.json({ success: false });
                                }
                            });
                        }
                        else {
                            res.json({ success: false });
                        }
                    });
                }
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Update.UpdateUserPassword = UpdateUserPassword;
})(Update = exports.Update || (exports.Update = {}));
