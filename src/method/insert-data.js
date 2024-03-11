"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const crypto_js_1 = require("crypto-js");
const dotenv_1 = __importDefault(require("dotenv"));
var Insert;
(function (Insert) {
    class Post {
        Run(conn, content, media, user, time, req, res) {
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
                    conn.execute("INSERT INTO post (user_id, content, media, total_likes, total_comments, date_posted, post_status) VALUES (?, ?, ?, ? ,? ,? ,?)", [jsonKey.id, (content === undefined) ? "" : content, (media.join(',').length > 0) ? media.join(',') : "none", 0, 0, time, "Active"], (err, result, field) => {
                        if (!err) {
                            const insertId = result.insertId;
                            conn.execute("SELECT * FROM post FULL JOIN user on user_id = user.id WHERE post_id = ?", [insertId], (e, r, f) => {
                                if (!e) {
                                    const postData = JSON.parse(JSON.stringify(r));
                                    const sortPost = postData.map(e => {
                                        return {
                                            postId: e.post_id,
                                            userId: e.user_id,
                                            userIcon: e.profile,
                                            name: e.name,
                                            time: e.date_posted,
                                            content: e.content,
                                            username: e.username,
                                            media: (e.media !== "none") ? e.media.split(",") : [],
                                            likes: e.total_likes,
                                            commentNum: e.total_comments,
                                            liked: false,
                                            deleted: false,
                                            reported: false,
                                            dateJoin: e.date_join
                                        };
                                    });
                                    res.json({ status: true, result: "ok", data: sortPost[0] });
                                }
                                else {
                                    res.json({ status: true, result: "database error" });
                                }
                            });
                        }
                        else {
                            res.json({ status: true, result: "database error" });
                        }
                    });
                }
                else {
                    res.json({ status: true, result: "invalid" });
                }
            }
            else {
                res.json({ status: true, result: "invalid" });
            }
        }
    }
    Insert.Post = Post;
    class Comment {
        Run(conn, user, postId, postUserId, content, time, media, req, res) {
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
            if (jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined) {
                if (jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (e, r, f) => {
                        if (!e) {
                            const postData = JSON.parse(JSON.stringify(r));
                            if (postData.length >= 1) {
                                conn.execute("INSERT INTO comment (post_id, postUserId, commentUserId, content, media, time, comment_status) VALUES (?, ?, ?, ?, ?, ?, ?)", [postId, postUserId, jsonKey.id, (content === undefined || content === "") ? "" : content, (media.length > 0 ? media.join(",") : "none"), time, "Active"], (err, result, field) => {
                                    if (!err) {
                                        conn.execute("UPDATE post SET total_comments = total_comments + 1 WHERE post_id = ?", [postId], (error, results, fiedls) => {
                                            if (!error) {
                                                const insertId = result.insertId;
                                                conn.execute("SELECT * FROM comment FULL JOIN user ON commentUserId = user.id WHERE cid = ?", [insertId], (ee, rr, ff) => {
                                                    if (!ee) {
                                                        const comment = JSON.parse(JSON.stringify(rr));
                                                        const sortComment = {
                                                            commentId: comment[0].cid,
                                                            postId: comment[0].post_id,
                                                            postUserId: comment[0].postUserId,
                                                            commentUserId: comment[0].commentUserId,
                                                            content: comment[0].content,
                                                            media: comment[0].media.split(","),
                                                            time: comment[0].time,
                                                            commentUserIcon: comment[0].profile,
                                                            username: comment[0].username,
                                                            name: comment[0].name,
                                                            deleted: false,
                                                            reported: false,
                                                            control: false,
                                                            dateJoin: comment[0].date_join
                                                        };
                                                        res.json({ status: true, result: "ok", comment: sortComment, totalComments: postData[0].total_comments + 1 });
                                                    }
                                                    else {
                                                        res.json({ status: true, result: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ status: true, result: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ status: true, result: "database error" });
                                    }
                                });
                            }
                        }
                        else {
                            res.json({ status: true, result: "database error" });
                        }
                    });
                }
                else {
                    res.json({ status: true, result: "invalid" });
                }
            }
            else {
                res.json({ status: true, result: "invalid" });
            }
        }
    }
    Insert.Comment = Comment;
    class AddFriend {
        Run(conn, req, res, socket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const fId = req.body.fId;
            if (user === "" || user === undefined || fId === "" || fId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            const query = mysql2_1.default.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND NOT f_status IN ?", [[[jsonKey.id, fId]], [[jsonKey.id, fId]], [["friended", "blocked"]]]);
            conn.execute(query, (err, result, field) => {
                const queryResult = JSON.parse(JSON.stringify(result));
                if (queryResult.length === 2) {
                    conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId =? AND friend_id = ?", ["requesting", "pending", jsonKey.id, fId], (e, r, f) => {
                        if (!e) {
                            conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId =? AND friend_id = ?", ["accepting", "pending", fId, jsonKey.id], (error, results, fields) => {
                                if (!error) {
                                    const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                                    // conn.execute("INSERT INTO notification (request_userId, receive_userId, type, n_time, n_status, seen) VALUES (?, ? ,? ,? ,? ,?)", [jsonKey.id, fId, "friend-request", time, "Active", "false"],
                                    // (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                    // {
                                    // if(!err)
                                    // {
                                    socket.IO.to(fId.toString()).emit("noticeFriend", 1);
                                    res.json({ success: true });
                                    // } else 
                                    // {
                                    //     res.json({ success: false, result: "database error" });
                                    // }
                                    // });
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
                else if (queryResult.length === 0) {
                    conn.execute("INSERT INTO friends (userId, friend_id, action, f_status) VALUES (?, ?, ?, ?), (?, ?, ?, ?)", [jsonKey.id, fId, "requesting", "pending", fId, jsonKey.id, "accepting", "pending"], (e, r, f) => {
                        if (!e) {
                            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                            // conn.execute("INSERT INTO notification (request_userId, receive_userId, type, n_time, n_status, seen) VALUES (?, ? ,? ,? ,? ,? ,?)", [jsonKey.id, fId, "friend-request", time, "Active", "false"],
                            // (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                            // {
                            //     if(!err)
                            //     {
                            socket.IO.to(fId.toString()).emit("noticeFriend", 1);
                            res.json({ success: true });
                            //     } else 
                            //     {
                            //         res.json({ success: false, result: "database error" });
                            //     }
                            // });
                        }
                        else {
                            res.json({ success: false, result: "database error" });
                        }
                    });
                }
            });
        }
    }
    Insert.AddFriend = AddFriend;
    class CreateGroupChat {
        Run(conn, req, res, socket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const groupName = req.body.groupName;
            const members = req.body.members;
            if (user === "" || user === undefined || groupName === "" || groupName === undefined || members === undefined || members.length <= 0) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            let roomId;
            members.unshift(jsonKey.id.toString());
            const query = mysql2_1.default.format("INSERT INTO message_room (room_name, chat_adminId, chat_type, chat_status) VALUES (?, ?, ?, ?)", [groupName, jsonKey.id, "group", "Active"]);
            conn.execute(query, (err, result, field) => {
                if (!err) {
                    const memberIds = members.map((e) => ["none", e, result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    roomId = result.insertId;
                    const queryMember = mysql2_1.default.format("INSERT INTO user_message_room (um_friend_id, um_userId, um_roomId, um_status, delete_time, delete_status, um_remove_time, unseen_msg) VALUES ?", [memberIds]);
                    conn.execute(queryMember, (error, results, fields) => {
                        if (!error) {
                            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, jsonKey.id, "none", "group created", time, "Active"], (er, re, fi) => {
                                if (!er) {
                                    const memberId = memberIds.map((e) => e[1]);
                                    socket.IO.to(memberId).emit("new-group-chat", { type: "group", groupName: groupName, chatId: roomId.toString(), content: "Group created", time: time, roomId: `room${roomId}`, userId: jsonKey.id.toString() });
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
    }
    Insert.CreateGroupChat = CreateGroupChat;
    class CreateFriendChat {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const friendId = req.body.friendId.trim();
            if (user === "" || user === undefined || friendId === "" || friendId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            let roomId;
            const userAndFriendId = [jsonKey.id.toString(), friendId];
            const query = mysql2_1.default.format("INSERT INTO message_room (room_name, chat_adminId, chat_type, chat_status) VALUES (?, ?, ?, ?)", ["none", "none", "friend", "Active"]);
            conn.execute(query, (err, result, field) => {
                if (!err) {
                    const memberIds = [];
                    memberIds.push([jsonKey.id.toString(), friendId, result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    memberIds.push([friendId, jsonKey.id.toString(), result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    roomId = result.insertId;
                    const queryMember = mysql2_1.default.format("INSERT INTO user_message_room (um_userId, um_friend_id, um_roomId, um_status, delete_time, delete_status, um_remove_time, unseen_msg) VALUES ?", [memberIds]);
                    conn.execute(queryMember, (error, results, fields) => {
                        if (!error) {
                            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                            const insertCreateFriend = mysql2_1.default.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, jsonKey.id, "none", "conversation created", time, "Active"]);
                            conn.execute(insertCreateFriend, (er, re, fi) => {
                                if (!er) {
                                    const q = mysql2_1.default.format("SELECT * FROM user WHERE id IN ?", [[userAndFriendId]]);
                                    conn.execute(q, (e, r, f) => {
                                        if (!e) {
                                            const users = JSON.parse(JSON.stringify(r));
                                            const sortUsers = users.map((e) => {
                                                return {
                                                    userId: e.id,
                                                    name: e.name,
                                                    profile: e.profile,
                                                    online: (e.online_status === "on") ? true : false
                                                };
                                            });
                                            clientSocket.IO.to(userAndFriendId).emit("new-friend-chat", { type: "friend", chatId: roomId.toString(), user: sortUsers, createdUserId: jsonKey.id.toString(), time: time, content: "Conversation created", roomId: `room${roomId}` });
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
    }
    Insert.CreateFriendChat = CreateFriendChat;
    class InsertMessage {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const roomId = req.body.rId.toString().trim();
            const msg = req.body.msg.trim();
            if (user === "" || user === undefined || roomId === "" || roomId === undefined || msg === "" || msg === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            const query = mysql2_1.default.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?)", [[roomId, jsonKey.id, msg, "message", time, "Active"]]);
            conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status = ?", [jsonKey.id.toString(), roomId, "Active"], (ce, cr, cf) => {
                if (!ce) {
                    const verifyUser = JSON.parse(JSON.stringify(cr));
                    if (verifyUser.length === 1) {
                        if (verifyUser[0].um_friend_id !== "none") {
                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ?", [roomId], (ee, rr, ff) => {
                                if (!ee) {
                                    const userFriend = JSON.parse(JSON.stringify(rr));
                                    let userFriendId = userFriend.map(e => e.um_userId.toString());
                                    conn.execute("SELECT * FROM friends WHERE friend_id = ? AND userId = ? AND f_status = ?", [userFriendId[0], userFriendId[1], "friended"], (eee, rrr, fff) => {
                                        const friendedNum = JSON.parse(JSON.stringify(rrr));
                                        if (friendedNum.length === 1) {
                                            conn.execute(query, (e, r, f) => {
                                                if (!e) {
                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ?", [r.insertId], (err, re, fi) => {
                                                        if (!err) {
                                                            const members = JSON.parse(JSON.stringify(re));
                                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status IN (?, ?)", [roomId, "removed", "disband"], (se, sr, sf) => {
                                                                if (!se) {
                                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                                    conn.execute(queryMember, (error, result, field) => {
                                                                        if (!error) {
                                                                            const completedMsg = members.map((e) => {
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
                                                                                    me: e.id.toString()
                                                                                };
                                                                            });
                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                            res.json({ success: true });
                                                                        }
                                                                        else {
                                                                            console.log("socket msg database error");
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
                                            res.json({ success: "blocked" });
                                        }
                                    });
                                }
                                else {
                                    res.json({ success: false });
                                }
                            });
                        }
                        else {
                            conn.execute(query, (e, r, f) => {
                                if (!e) {
                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ?", [r.insertId], (err, re, fi) => {
                                        if (!err) {
                                            const members = JSON.parse(JSON.stringify(re));
                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status IN (?, ?)", [roomId, "removed", "disband"], (se, sr, sf) => {
                                                if (!se) {
                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                    conn.execute(queryMember, (error, result, field) => {
                                                        if (!error) {
                                                            const completedMsg = members.map((e) => {
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
                                                                    me: e.id.toString()
                                                                };
                                                            });
                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                            res.json({ success: true });
                                                        }
                                                        else {
                                                            console.log("socket msg database error");
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
    }
    Insert.InsertMessage = InsertMessage;
    class DeleteMsg {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const msgId = req.body.msgId.toString().trim();
            const roomId = req.body.roomId.toString().trim();
            if (user === "" || user === undefined || msgId === "" || msgId === undefined || roomId === "" || roomId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            conn.execute("INSERT INTO delete_message (d_user_id, d_message_id, d_room_id) VALUES (?, ?, ?)", [jsonKey.id.toString(), msgId.toString(), roomId], (e, r, f) => {
                if (!e) {
                    clientSocket.IO.to(`room${roomId}`).emit("recall-message", { roomId: roomId, messageId: msgId });
                    res.json({ success: true });
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.DeleteMsg = DeleteMsg;
    class InsertGroupMedia {
        Run(conn, user, roomId, file, req, res, clientSocket) {
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
                    const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                    const mediaQuery = mysql2_1.default.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId.toString(), jsonKey.id.toString(), (file.length > 0 ? file.join(",") : "none"), "media", time, "Active"]);
                    conn.execute(mediaQuery, (e, r, f) => {
                        if (!e) {
                            const insertId = r.insertId;
                            conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field) => {
                                if (!err) {
                                    const msg = JSON.parse(JSON.stringify(result));
                                    conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ?", [roomId.toString(), "Active"], (ee, rr, ff) => {
                                        if (!ee) {
                                            let members = JSON.parse(JSON.stringify(rr));
                                            members = members.map(e => e.um_userId.toString());
                                            const queryMembers = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, members.length >= 1 ? [members] : [[""]], "Active"]);
                                            conn.execute(queryMembers, (eee, rrr, fff) => {
                                                if (!eee) {
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
                                    console.log("database error select socket media");
                                }
                            });
                        }
                        else {
                            res.json({ success: false });
                            console.log("database error insert socket media");
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
    Insert.InsertGroupMedia = InsertGroupMedia;
    class AddGroupMember {
        Run(conn, req, res, clientSocket) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const memberId = req.body.memberId.toString().trim();
            const roomId = req.body.roomId.toString().trim();
            if (user === "" || user === undefined || memberId === "" || memberId === undefined || roomId === "" || roomId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_adminId = ? AND chat_status = ?", [roomId, jsonKey.id.toString(), "Active"], (err, re, fi) => {
                if (!err) {
                    const adminNum = JSON.parse(JSON.stringify(re));
                    if (adminNum.length === 1) {
                        conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status IN (?, ?)", [memberId, roomId, "removed", "exit group"], (e, r, f) => {
                            if (!e) {
                                const memberStatus = JSON.parse(JSON.stringify(r));
                                if (memberStatus.length === 1) {
                                    conn.execute("UPDATE user_message_room SET um_status = ? WHERE um_roomId = ? AND um_userId = ?", ["Active", roomId, memberId], (ee, rr, ff) => {
                                        if (!ee) {
                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "member join", time, "Active"], (eee, rrr, fff) => {
                                                if (!eee) {
                                                    const insertId = rrr.insertId;
                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field) => {
                                                        if (!err) {
                                                            const msg = JSON.parse(JSON.stringify(result));
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
                                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf) => {
                                                                if (!se) {
                                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                                    conn.execute(queryMember, (error, result, field) => {
                                                                        if (!error) {
                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                            clientSocket.IO.to(memberId).emit("add-group-new-member", { roomId: roomId });
                                                                            res.json({ success: true });
                                                                        }
                                                                        else {
                                                                            console.log("socket msg database error");
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.json({ success: false });
                                                            console.log("database error select socket media");
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
                                    conn.execute("INSERT INTO user_message_room (um_friend_id, um_userId, um_roomId, um_status, delete_time, delete_status, um_remove_time) VALUES (?, ?, ?, ?, ?, ?, ?)", ["none", memberId, roomId, "Active", "none", "none", "none"], (ee, rr, ff) => {
                                        if (!ee) {
                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "member join", time, "Active"], (eee, rrr, fff) => {
                                                if (!eee) {
                                                    const insertId = rrr.insertId;
                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field) => {
                                                        if (!err) {
                                                            const msg = JSON.parse(JSON.stringify(result));
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
                                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf) => {
                                                                if (!se) {
                                                                    let membersId = JSON.parse(JSON.stringify(sr));
                                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                    membersId = membersId.map(e => e.um_userId.toString());
                                                                    const queryMember = mysql2_1.default.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                                                    conn.execute(queryMember, (error, result, field) => {
                                                                        if (!error) {
                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                            clientSocket.IO.to(memberId).emit("add-group-new-member", { roomId: roomId });
                                                                            res.json({ success: true });
                                                                        }
                                                                        else {
                                                                            console.log("socket msg database error");
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.json({ success: false });
                                                            console.log("database error select socket media");
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
    }
    Insert.AddGroupMember = AddGroupMember;
    class DeletePost {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const postId = req.body.postId.toString().trim();
            if (user === "" || user === undefined || postId === "" || postId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (e, r, f) => {
                if (!e) {
                    const postInfo = JSON.parse(JSON.stringify(r));
                    if (postInfo[0].user_id.toString() === jsonKey.id.toString()) {
                        conn.execute("UPDATE post SET post_status = ? WHERE post_id = ?", ["deleted", postId], (ee, rr, ff) => {
                            if (!ee) {
                                res.json({ success: true, result: "post deleted" });
                            }
                            else {
                                res.json({ success: false });
                            }
                        });
                    }
                    else {
                        conn.execute("INSERT INTO delete_post (userId, dp_postId) VALUES (?, ?)", [jsonKey.id, postId], (err, result, field) => {
                            if (!err) {
                                res.json({ success: true, result: "user post deleted" });
                            }
                            else {
                                res.json({ success: false });
                            }
                        });
                    }
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.DeletePost = DeletePost;
    class ReportPost {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const postId = req.body.postId.toString().trim();
            if (user === "" || user === undefined || postId === "" || postId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            conn.execute("INSERT INTO report_post (r_post_id, r_user_id) VALUES (?, ?)", [postId, jsonKey.id], (e, r, f) => {
                if (!e) {
                    res.json({ success: true });
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.ReportPost = ReportPost;
    class DeleteComment {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const commentId = req.body.commentId.toString().trim();
            const postId = req.body.postId.toString().trim();
            if (user === "" || user === undefined || commentId === "" || commentId === undefined || postId === "" || postId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            conn.execute("SELECT * FROM comment WHERE cid = ? AND comment_status = ?", [commentId, "Active"], (e, r, f) => {
                if (!e) {
                    const commentInfo = JSON.parse(JSON.stringify(r));
                    if (commentInfo[0].commentUserId.toString() === jsonKey.id.toString()) {
                        conn.execute("UPDATE comment SET comment_status = ? WHERE cid = ?", ["deleted", commentId], (ee, rr, ff) => {
                            if (!ee) {
                                conn.execute("UPDATE post SET total_comments = total_comments - 1 WHERE post_id = ? AND post_status = ?", [postId, "Active"], (error, results, fields) => {
                                    if (!error) {
                                        res.json({ success: true, result: "comment deleted" });
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
                        conn.execute("INSERT INTO delete_comment (dc_user_id, dc_commentId) VALUES (?, ?)", [jsonKey.id, commentId], (err, result, field) => {
                            if (!err) {
                                res.json({ success: true, result: "user comment deleted" });
                            }
                            else {
                                res.json({ success: false });
                            }
                        });
                    }
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.DeleteComment = DeleteComment;
    class ReportComment {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const commentId = req.body.commentId.toString().trim();
            if (user === "" || user === undefined || commentId === "" || commentId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            conn.execute("INSERT INTO report_comment (rc_comment_id, rc_user_id) VALUES (?, ?)", [commentId, jsonKey.id], (e, r, f) => {
                if (!e) {
                    res.json({ success: true });
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.ReportComment = ReportComment;
    class HideMessage {
        Run(conn, req, res) {
            dotenv_1.default.config();
            const key = process.env;
            const user = req.body.user.trim();
            const msgId = req.body.msgId.toString().trim();
            const roomId = req.body.roomId.toString().trim();
            if (user === "" || user === undefined || msgId === "" || msgId === undefined || roomId === "" || roomId === undefined) {
                return;
            }
            try {
                const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            conn.execute("INSERT INTO hide_message (h_userId, h_messageId, h_roomId) VALUES (?, ?, ?)", [jsonKey.id.toString(), msgId.toString(), roomId], (e, r, f) => {
                if (!e) {
                    res.json({ success: true });
                }
                else {
                    res.json({ success: false });
                }
            });
        }
    }
    Insert.HideMessage = HideMessage;
})(Insert = exports.Insert || (exports.Insert = {}));
