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
exports.Read = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const crypto_js_1 = require("crypto-js");
const dotenv = __importStar(require("dotenv"));
var Read;
(function (Read) {
    class Comment {
        Run(conn, postId, commentNow, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const sortQuery = [];
                    conn.execute("SELECT * FROM comment FULL JOIN user AS b ON commentUserId = b.id WHERE post_id = ? AND comment_status = ? ORDER BY cId DESC limit ?, 5", [postId, "Active", commentNow], (err, result, fields) => {
                        if (!err) {
                            conn.execute("SELECT * FROM delete_comment WHERE dc_user_id = ?", [userKey.id], (e, r, f) => {
                                if (!e) {
                                    const deleteComments = JSON.parse(JSON.stringify(r));
                                    const deleteCommentId = deleteComments.map(e => e.dc_commentId.toString());
                                    conn.execute("SELECT * FROM report_comment WHERE rc_user_id = ?", [userKey.id], (ee, rr, ff) => {
                                        if (!ee) {
                                            const reportComments = JSON.parse(JSON.stringify(rr));
                                            const reportCommentId = reportComments.map(e => e.rc_comment_id.toString());
                                            const query = JSON.parse(JSON.stringify(result));
                                            query.forEach((e) => {
                                                sortQuery.push({ commentId: e.cid, postId: e.post_id, postUserId: e.postUserId, commentUserId: e.commentUserId, content: e.content, media: e.media.split(","), dateJoin: e.date_join,
                                                    time: e.time, name: e.name, commentUserIcon: e.profile, username: e.username, deleted: deleteCommentId.includes(e.cid.toString()), reported: reportCommentId.includes(e.cid.toString()), control: false });
                                            });
                                            res.json({ status: "success", comments: sortQuery });
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
                else {
                    res.json({ status: "invalid" });
                }
            }
            else {
                res.json({ status: "invalid" });
            }
        }
    }
    Read.Comment = Comment;
    class Friends {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (e, r, f) => {
                        if (!e) {
                            const totalFriends = JSON.parse(JSON.stringify(r));
                            conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (err, result, field) => {
                                if (!err) {
                                    const friendData = JSON.parse(JSON.stringify(result));
                                    const data = [];
                                    if (friendData.length >= 1) {
                                        friendData.forEach((friend) => {
                                            data.push({
                                                fId: friend.f_id,
                                                friendId: friend.friend_id,
                                                action: friend.action,
                                                status: friend.f_status,
                                                f_username: friend.username,
                                                f_name: friend.name,
                                                f_profile: friend.profile,
                                                f_background: friend.background,
                                                f_dataJoin: friend.date_join,
                                            });
                                        });
                                        res.json({ status: "success", friends: data, totalFriends: totalFriends.length });
                                    }
                                    else {
                                        res.json({ status: "success", friends: data, totalFriends: totalFriends.length });
                                    }
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
                    res.json({ status: "invalid" });
                }
            }
            else {
                res.json({ status: "invalid" });
            }
        }
    }
    Read.Friends = Friends;
    class SearchFriends {
        Run(conn, req, res) {
            // SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE "a%" AND user.status = "Active" AND f_status = "friended"
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ?", [`${req.query.friend}%`, "friended", userKey.id], (err, result, field) => {
                        if (!err) {
                            const friendData = JSON.parse(JSON.stringify(result));
                            const totalFriend = [];
                            if (friendData.length > 0) {
                                friendData.forEach((friend) => {
                                    totalFriend.push({
                                        fId: friend.f_id,
                                        friendId: friend.friend_id,
                                        action: friend.action,
                                        status: friend.f_status,
                                        f_username: friend.username,
                                        f_name: friend.name,
                                        f_profile: friend.profile,
                                        f_background: friend.background,
                                        f_dataJoin: friend.date_join,
                                    });
                                });
                                res.json({ status: "success", friends: totalFriend });
                            }
                            else {
                                res.json({ status: "success", friends: totalFriend });
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
    Read.SearchFriends = SearchFriends;
    class FindNewFriend {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user WHERE name LIKE ? AND NOT id = ?", [`${req.query.friend}%`, userKey.id], (err, result, field) => {
                        if (!err) {
                            const userData = JSON.parse(JSON.stringify(result));
                            if (userData.length > 0) {
                                const userId = userData.map((e) => { return e.id; });
                                const sqlQuery = mysql2_1.default.format(`SELECT friend_id FROM friends WHERE friend_id IN ? AND f_status in ? AND userId = ?`, [[userId], [["friended", "blocked", "pending"]], userKey.id]);
                                conn.execute(sqlQuery, [], (error, results, fields) => {
                                    if (!error) {
                                        const newFriendData = JSON.parse(JSON.stringify(results));
                                        const existedId = newFriendData.map((e) => { return e.friend_id; });
                                        const existedNewFriend = userData.filter((e) => { return !existedId.includes(e.id.toString()); });
                                        const result = [];
                                        existedNewFriend.forEach((friend) => {
                                            result.push({
                                                friendId: friend.id,
                                                f_username: friend.username,
                                                f_name: friend.name,
                                                f_profile: friend.profile,
                                                f_background: friend.background,
                                                f_dataJoin: friend.date_join,
                                            });
                                        });
                                        res.json({ status: "success", friends: result });
                                    }
                                    else {
                                        res.json({ status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ status: "success", friends: [] });
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
    Read.FindNewFriend = FindNewFriend;
    class BlockedUsers {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND action = ?", [userKey.id, "blocked", "blocking"], (e, r, f) => {
                        if (!e) {
                            const totalBlocked = JSON.parse(JSON.stringify(r));
                            conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND action = ?", [userKey.id, "blocked", "blocking"], (err, result, field) => {
                                if (!err) {
                                    const blockedUsers = JSON.parse(JSON.stringify(result));
                                    const data = [];
                                    if (blockedUsers.length >= 1) {
                                        blockedUsers.forEach((friend) => {
                                            data.push({
                                                fId: friend.f_id,
                                                friendId: friend.friend_id,
                                                action: friend.action,
                                                status: friend.f_status,
                                                f_username: friend.username,
                                                f_name: friend.name,
                                                f_profile: friend.profile,
                                                f_background: friend.background,
                                                f_dataJoin: friend.date_join,
                                            });
                                        });
                                        res.json({ status: "success", users: data, totalBlocked: totalBlocked.length });
                                    }
                                    else {
                                        res.json({ status: "success", users: data, totalBlocked: totalBlocked.length });
                                    }
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
                    res.json({ status: "invalid" });
                }
            }
            else {
                res.json({ status: "invalid" });
            }
        }
    }
    Read.BlockedUsers = BlockedUsers;
    class findBlockedUser {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ?", [`${req.query.user}%`, "blocked", userKey.id], (err, result, field) => {
                        if (!err) {
                            const userData = JSON.parse(JSON.stringify(result));
                            const data = [];
                            if (userData.length > 0) {
                                userData.forEach((friend) => {
                                    data.push({
                                        fId: friend.f_id,
                                        friendId: friend.friend_id,
                                        action: friend.action,
                                        status: friend.f_status,
                                        f_username: friend.username,
                                        f_name: friend.name,
                                        f_profile: friend.profile,
                                        f_background: friend.background,
                                        f_dataJoin: friend.date_join,
                                    });
                                });
                                res.json({ status: "success", users: data });
                            }
                            else {
                                res.json({ status: "success", users: data });
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
    Read.findBlockedUser = findBlockedUser;
    class FriendRequest {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "accepting", userKey.id], (e, r, f) => {
                        if (!e) {
                            const totalFriendRequest = JSON.parse(JSON.stringify(r));
                            conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "accepting", userKey.id], (error, results, fiedls) => {
                                const requestFriends = JSON.parse(JSON.stringify(results));
                                let data = [];
                                if (!error) {
                                    if (requestFriends.length > 0) {
                                        data = requestFriends.map((e) => {
                                            return {
                                                fId: e.fId,
                                                userId: e.id,
                                                action: e.action,
                                                username: e.username,
                                                name: e.name,
                                                profile: e.profile,
                                                background: e.background,
                                                dataJoin: e.data_join
                                            };
                                        });
                                        res.json({ success: true, data: data, totalFriendRequest: totalFriendRequest.length });
                                    }
                                    else {
                                        res.json({ success: true, data: [], totalFriendRequest: totalFriendRequest.length });
                                    }
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
                    res.json({ success: false, result: "invalid" });
                }
            }
            else {
                res.json({ success: false, result: "invalid" });
            }
        }
    }
    Read.FriendRequest = FriendRequest;
    class SentRequest {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "requesting", userKey.id], (e, r, f) => {
                        if (!e) {
                            const totalSentRequests = JSON.parse(JSON.stringify(r));
                            conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "requesting", userKey.id], (error, results, fiedls) => {
                                const requestFriends = JSON.parse(JSON.stringify(results));
                                let data = [];
                                if (!error) {
                                    if (requestFriends.length > 0) {
                                        data = requestFriends.map((e) => {
                                            return {
                                                fId: e.fId,
                                                userId: e.id,
                                                action: e.action,
                                                username: e.username,
                                                name: e.name,
                                                profile: e.profile,
                                                background: e.background,
                                                dataJoin: e.data_join
                                            };
                                        });
                                        res.json({ success: true, data: data, totalSentRequests: totalSentRequests.length });
                                    }
                                    else {
                                        res.json({ success: true, data: [], totalSentRequests: totalSentRequests.length });
                                    }
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
                    res.json({ success: false, result: "invalid" });
                }
            }
            else {
                res.json({ success: false, result: "invalid" });
            }
        }
    }
    Read.SentRequest = SentRequest;
    class findFriendRequest {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ? AND user.name LIKE ?", ["pending", "accepting", userKey.id, `${req.query.user}%`], (err, result, field) => {
                        if (!err) {
                            const userData = JSON.parse(JSON.stringify(result));
                            let data = [];
                            if (userData.length > 0) {
                                data = userData.map((e) => {
                                    return {
                                        fId: e.fId,
                                        userId: e.id,
                                        action: e.action,
                                        username: e.username,
                                        name: e.name,
                                        profile: e.profile,
                                        background: e.background,
                                        dataJoin: e.data_join,
                                    };
                                });
                                res.json({ success: true, users: data });
                            }
                            else {
                                res.json({ success: true, users: data });
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
    Read.findFriendRequest = findFriendRequest;
    class findSentRequest {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ success: false, result: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ? AND user.name LIKE ?", ["pending", "requesting", userKey.id, `${req.query.user}%`], (err, result, field) => {
                        if (!err) {
                            const userData = JSON.parse(JSON.stringify(result));
                            let data = [];
                            if (userData.length > 0) {
                                data = userData.map((e) => {
                                    return {
                                        fId: e.fId,
                                        userId: e.id,
                                        action: e.action,
                                        username: e.username,
                                        name: e.name,
                                        profile: e.profile,
                                        background: e.background,
                                        dataJoin: e.data_join,
                                    };
                                });
                                res.json({ success: true, users: data });
                            }
                            else {
                                res.json({ success: true, users: data });
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
    Read.findSentRequest = findSentRequest;
    class FriendNotice {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    const query = mysql2_1.default.format("SELECT * FROM notification FULL JOIN user ON request_userId = user.id WHERE type in ? AND receive_userId = ? AND n_status = ? AND seen = ? ORDER BY n_id DESC", [[["friend-request", "sent-request"]], userKey.id, "Active", "false"]);
                    conn.execute(query, (e, r, f) => {
                        if (!e) {
                            const data = JSON.parse(JSON.stringify(r));
                            data.map((notice) => {
                                return {
                                    fId: notice.id,
                                    username: notice.username,
                                    name: notice.name,
                                    profile: notice.profile,
                                    background: notice.background,
                                    dateJoin: notice.date_join,
                                    noticeTime: notice.n_time
                                };
                            });
                            res.json({ success: true, data: data });
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
    Read.FriendNotice = FriendNotice;
    class FetchPosts {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const postNum = Number(req.query.n);
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postNum !== undefined && !isNaN(postNum)) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT friend_id FROM friends WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (e, r, f) => {
                        if (!e) {
                            const friends = JSON.parse(JSON.stringify(r));
                            const sortFriend = friends.map((e) => { return e.friend_id; });
                            sortFriend.push(userKey.id);
                            const query = mysql2_1.default.format("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE user_id IN ? AND post_status = ? ORDER BY post_id DESC LIMIT ?, ?", [[sortFriend], "Active", postNum, 5]);
                            conn.execute(query, (err, result, field) => {
                                if (!err) {
                                    const searchLike = JSON.parse(JSON.stringify(result));
                                    const totalPostId = searchLike.map((e) => e.post_id);
                                    const likedQuery = mysql2_1.default.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);
                                    if (searchLike.length !== 0) {
                                        conn.execute(likedQuery, (error, results, fields) => {
                                            if (!error) {
                                                conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df) => {
                                                    if (!de) {
                                                        conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf) => {
                                                            if (!re) {
                                                                const reportPost = JSON.parse(JSON.stringify(rr));
                                                                const reportPostId = reportPost.map(e => e.r_post_id.toString());
                                                                const deletePost = JSON.parse(JSON.stringify(dr));
                                                                const deletePostId = deletePost.map(e => e.dp_postId.toString());
                                                                const likeResult = JSON.parse(JSON.stringify(results));
                                                                const sortLikeResult = likeResult.map((e) => e.post_id);
                                                                const data = JSON.parse(JSON.stringify(result));
                                                                let sortData = [];
                                                                sortData = data.map((e) => {
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
                                                                        liked: sortLikeResult.includes(e.post_id.toString()),
                                                                        deleted: deletePostId.includes(e.post_id.toString()),
                                                                        reported: reportPostId.includes(e.post_id.toString()),
                                                                        dateJoin: e.date_join
                                                                    };
                                                                });
                                                                res.json({ success: true, data: sortData });
                                                            }
                                                            else {
                                                                res.json({ success: true, result: "database error" });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.json({ success: true, result: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ success: true, result: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        const data = JSON.parse(JSON.stringify(result));
                                        let sortData = [];
                                        sortData = data.map((e) => {
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
                                                dateJoin: e.date_join
                                            };
                                        });
                                        res.json({ success: true, data: sortData });
                                    }
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
                    res.json({ success: false, result: "invalid" });
                }
            }
            else {
                res.json({ success: false, result: "invalid" });
            }
        }
    }
    Read.FetchPosts = FetchPosts;
    class FetchFriendChat {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const postNum = Number(req.query.n);
            const searchQuery = req.query.s;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && searchQuery !== "" && searchQuery !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    // conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND user.status = ? AND f_status = ? AND user.name LIKE ? LIMIT ?, ? ", [userKey.id, "Active", "friended", `${searchQuery}%`, postNum, 5], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND user.name LIKE ?", [userKey.id, "friended", `${searchQuery}%`], (e, r, f) => {
                        if (!e) {
                            const data = JSON.parse(JSON.stringify(r));
                            const sortData = data.map((e) => {
                                return {
                                    userId: e.friend_id,
                                    name: e.name,
                                    profile: e.profile,
                                };
                            });
                            res.json(sortData);
                        }
                        else {
                            res.json({ status: "database error" });
                        }
                    });
                }
            }
        }
    }
    Read.FetchFriendChat = FetchFriendChat;
    class FetchNonExistFriendChat {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const postNum = Number(req.query.n);
            const searchQuery = req.query.s;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && searchQuery !== "" && searchQuery !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    // conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND user.status = ? AND f_status = ? AND user.name LIKE ? LIMIT ?, ? ", [userKey.id, "Active", "friended", `${searchQuery}%`, postNum, 5], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND user.name LIKE ?", [userKey.id, "friended", `${searchQuery}%`], (e, r, f) => {
                        if (!e) {
                            const data = JSON.parse(JSON.stringify(r));
                            const sortData = data.map((e) => {
                                return {
                                    userId: e.friend_id,
                                    name: e.name,
                                    profile: e.profile,
                                };
                            });
                            if (data.length <= 0) {
                                res.json([]);
                                return;
                            }
                            const friendId = data.map(e => e.friend_id);
                            const query = mysql2_1.default.format("SELECT * FROM user_message_room FULL JOIN message_room ON um_roomId = message_room.chat_id WHERE message_room.chat_type = ? AND chat_status = ? AND um_status = ? AND um_userId IN ? AND um_friend_id = ?", ["friend", "Active", "Active", [friendId], userKey.id.toString()]);
                            conn.execute(query, (err, result, field) => {
                                if (!err) {
                                    let sortArray = JSON.parse(JSON.stringify(result));
                                    sortArray = sortArray.map((e) => e.um_userId);
                                    const sortResult = sortData.filter((e) => !sortArray.includes(e.userId));
                                    res.send(sortResult);
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
        }
    }
    Read.FetchNonExistFriendChat = FetchNonExistFriendChat;
    class FetchChatList {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user_message_room FULL JOIN message_room ON message_room.chat_id = um_roomId WHERE um_userId = ? AND NOT delete_status = ?", [userKey.id, "delete"], (e, r, f) => {
                        if (!e) {
                            const data = JSON.parse(JSON.stringify(r));
                            const friendChat = data.filter((e) => e.um_friend_id !== "none");
                            const groupChat = data.filter((e) => e.um_friend_id === "none");
                            let query;
                            if (data.length <= 0) {
                                res.json([]);
                                return;
                            }
                            if (friendChat.length > 0) {
                                query = mysql2_1.default.format("SELECT name, profile, online_status, id FROM user WHERE id IN ?", [[friendChat.map((e) => e.um_friend_id)]]);
                            }
                            else {
                                query = mysql2_1.default.format("SELECT name, profile, online_status, id FROM user WHERE id = ?", [0]);
                            }
                            conn.execute(query, (er, re, fi) => {
                                if (!er) {
                                    const nData = JSON.parse(JSON.stringify(re));
                                    const deleteMsgs = mysql2_1.default.format("SELECT * FROM delete_message WHERE d_room_id IN ?", [[data.map(e => e.um_roomId.toString())]]);
                                    conn.execute(deleteMsgs, (ea, ra, fa) => {
                                        if (!ea) {
                                            let messageId;
                                            const deleteNum = JSON.parse(JSON.stringify(ra));
                                            // if(deleteNum.length > 0)
                                            // {
                                            //     messageId = 
                                            //     mysql2.format("SELECT max(message_id) as maxId, m_room_id FROM message WHERE m_room_id IN ? AND NOT message_id IN ? GROUP BY m_room_id", 
                                            //                 [[data.map((e) => e.um_roomId)], [deleteNum.map(e => e.d_message_id.toString())]]);
                                            // } else 
                                            // {
                                            messageId = mysql2_1.default.format("SELECT max(message_id) as maxId, m_room_id FROM message WHERE m_room_id IN ? GROUP BY m_room_id", [[data.map((e) => e.um_roomId)]]);
                                            // }
                                            const removeQuery = mysql2_1.default.format("SELECT * FROM user_message_room WHERE um_roomId IN ? AND um_userId = ? AND um_status IN (?, ?)", [[data.map((e) => e.um_roomId)], userKey.id, "removed", "exit group"]);
                                            conn.execute(removeQuery, (removeErr, removeR, removeF) => {
                                                if (!removeErr) {
                                                    const removeMessage = JSON.parse(JSON.stringify(removeR));
                                                    const removeRoomId = removeMessage.map(e => e.um_roomId);
                                                    conn.execute(messageId, (error, result, fiedls) => {
                                                        if (!error) {
                                                            let mData = JSON.parse(JSON.stringify(result));
                                                            const tt = mData.map(e => {
                                                                if (removeRoomId.includes(e.m_room_id)) {
                                                                    e.maxId = removeMessage[removeRoomId.indexOf(e.m_room_id.toString())].um_remove_time;
                                                                    return e;
                                                                }
                                                                else {
                                                                    return e;
                                                                }
                                                            });
                                                            // console.log(tt);
                                                            const messageQuery = mysql2_1.default.format("SELECT * FROM message WHERE message_id IN ? AND message_status = ?", [[tt.map((e) => e.maxId)], "Active"]);
                                                            conn.execute(messageQuery, (errors, results, fields) => {
                                                                if (!errors) {
                                                                    const messageData = JSON.parse(JSON.stringify(results));
                                                                    // conn.execute("SELECT d_message_id as dId FROM delete_message WHERE d_message_id IN ?", [[messageData.map(e => e.message_id)]]);
                                                                    // console.log(mysql2.format("SELECT d_message_id as dId FROM delete_message WHERE d_message_id IN ?", [[messageData.map(e => e.message_id.toString())]]));
                                                                    let completedData = [];
                                                                    const sortDatas = data.map((e) => {
                                                                        const joinData = nData.filter((a) => a.id.toString() === e.um_friend_id.toString());
                                                                        if (joinData.length !== 0) {
                                                                            e.friendInfo = joinData;
                                                                            return e;
                                                                        }
                                                                        else {
                                                                            return e;
                                                                        }
                                                                    });
                                                                    const SortData = sortDatas.map((e) => {
                                                                        const maxMsgId = tt.filter((a) => a.m_room_id.toString() === e.um_roomId.toString());
                                                                        e.max = maxMsgId[0].maxId.toString();
                                                                        return e;
                                                                    });
                                                                    const Data = SortData.map((e) => {
                                                                        const msg = messageData.filter((a) => e.um_roomId.toString() === a.m_room_id.toString());
                                                                        e.msg = msg;
                                                                        return e;
                                                                    });
                                                                    const pArray = Data;
                                                                    const idArray = [];
                                                                    Data.forEach(e => {
                                                                        let maxID = "";
                                                                        let sortIndex = 0;
                                                                        const test = pArray.filter((e) => !idArray.includes(e.max.toString()));
                                                                        test.map((a, index, array) => {
                                                                            if (Number(a.max) > Number(maxID)) {
                                                                                maxID = a.max;
                                                                                sortIndex = index;
                                                                            }
                                                                        });
                                                                        idArray.push(maxID.toString());
                                                                        completedData.push(test[sortIndex]);
                                                                    });
                                                                    const recalledData = deleteNum.map(e => e.d_message_id);
                                                                    // console.log(recalledData);
                                                                    completedData = completedData.map(e => {
                                                                        if (recalledData.includes(e.max)) {
                                                                            e.msg[0].message_content = "User recalled message";
                                                                            // console.log(e.msg[0]);
                                                                            return e;
                                                                        }
                                                                        else {
                                                                            return e;
                                                                        }
                                                                    });
                                                                    const hidequery = mysql2_1.default.format("SELECT * FROM hide_message WHERE h_roomId IN ? AND h_userId = ?", [[data.map(e => e.um_roomId.toString())], userKey.id]);
                                                                    conn.execute(hidequery, (he, hr, hf) => {
                                                                        if (!he) {
                                                                            const hideMessage = JSON.parse(JSON.stringify(hr));
                                                                            const hideMsg = hideMessage.map(e => e.h_messageId.toString());
                                                                            completedData = completedData.map(e => {
                                                                                if (hideMsg.includes(e.max.toString())) {
                                                                                    e.msg[0].message_content = "You hidden this message";
                                                                                    return e;
                                                                                }
                                                                                else {
                                                                                    return e;
                                                                                }
                                                                            });
                                                                            res.json(completedData);
                                                                        }
                                                                        else {
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                    // console.log(completedRecalled);
                                                                    // if(deleteNum.length > 0)   // ignore this condition is useless
                                                                    // {
                                                                    //     const queryMaxId: string = mysql2.format("SELECT max(message_id) as maxId, m_room_id FROM message WHERE m_room_id IN ? GROUP BY m_room_id", [[data.map((e) => e.um_roomId)]]);
                                                                    //     conn.execute(queryMaxId, (ee, rr, ff): void =>
                                                                    //     {
                                                                    //         if(!ee)
                                                                    //         {
                                                                    //             let maxId: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                    //             // maxId = maxId.map(e => e.maxId.toString());
                                                                    //             const resultChatList: Array<any> = [];
                                                                    //             const completedMessageList: Array<any> = [];
                                                                    //             const pArray: Array<any> = maxId;
                                                                    //             const idArray: Array<any> = [];
                                                                    //             maxId.forEach(p => 
                                                                    //             {
                                                                    //                 let maxID: string = "";
                                                                    //                 let sortIndex: number = 0;
                                                                    //                 const test = pArray.filter((e) => !idArray.includes(e.maxId.toString()));
                                                                    //                 test.map((a, index: number, array) => 
                                                                    //                 {
                                                                    //                     if(Number(a.maxId.toString()) > Number(maxID))
                                                                    //                     {
                                                                    //                         maxID = a.maxId.toString();
                                                                    //                         sortIndex = index;
                                                                    //                     }
                                                                    //                 });
                                                                    //                 idArray.push(maxID.toString());
                                                                    //                 resultChatList.push(test[sortIndex]);
                                                                    //             });
                                                                    //             resultChatList.map((e) => 
                                                                    //             {
                                                                    //                 completedData.forEach(a => 
                                                                    //                 {
                                                                    //                     if(a.um_roomId.toString() === e.m_room_id.toString())
                                                                    //                     {
                                                                    //                         completedMessageList.push(a);
                                                                    //                     }
                                                                    //                 });
                                                                    //             });
                                                                    //             res.json(completedData);
                                                                    //         } else 
                                                                    //         {
                                                                    //             res.json({success: false});
                                                                    //         }
                                                                    //     });
                                                                    // } else 
                                                                    // {
                                                                    //     res.json(completedData);
                                                                    // }
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
                    res.json({ success: false, status: "invalid" });
                }
            }
            else {
                res.json({ success: false, status: "invalid" });
            }
        }
    }
    Read.FetchChatList = FetchChatList;
    class FetchChat {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const roomId = req.query.rid;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && roomId !== "" && roomId !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ?", [userKey.id, roomId], (cme, cmr, cmf) => {
                        if (!cme) {
                            const checkMember = JSON.parse(JSON.stringify(cmr));
                            if (checkMember.length === 1) {
                                conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status IN (?, ?)", [userKey.id, roomId, "removed", "exit group"], (rve, rvr, rvf) => {
                                    if (!rve) {
                                        const removedNum = JSON.parse(JSON.stringify(rvr));
                                        if (removedNum.length === 1) {
                                            // conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? AND message_id < ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active", Number(removedNum[0].um_remove_time)], (e, r, f): void =>
                                            // {
                                            // });
                                            conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? AND message_id <= ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active", Number(removedNum[0].um_remove_time)], (e, r, f) => {
                                                if (!e) {
                                                    const msgData = JSON.parse(JSON.stringify(r));
                                                    const deleteMsgQuery = mysql2_1.default.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);
                                                    conn.execute(deleteMsgQuery, (err, result, field) => {
                                                        if (!err) {
                                                            let deleteMsg = JSON.parse(JSON.stringify(result));
                                                            deleteMsg = deleteMsg.map(e => e.d_message_id.toString());
                                                            let completedMsgData = msgData;
                                                            completedMsgData = completedMsgData.map(e => {
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
                                                                    me: e.user_id.toString(),
                                                                };
                                                            });
                                                            conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id], (he, hr, hf) => {
                                                                if (!he) {
                                                                    const hiddenMsg = JSON.parse(JSON.stringify(hr));
                                                                    const hiddenMessage = hiddenMsg.map(e => e.h_messageId.toString());
                                                                    completedMsgData = completedMsgData.map(e => {
                                                                        if (hiddenMessage.includes(e.message_id.toString())) {
                                                                            e.hidden = true;
                                                                            return e;
                                                                        }
                                                                        else {
                                                                            e.hidden = false;
                                                                            return e;
                                                                        }
                                                                    });
                                                                    conn.execute("SELECT * FROM message_room WHERE chat_id = ?", [roomId], (error, results, fields) => {
                                                                        if (!error) {
                                                                            let roomInfo = JSON.parse(JSON.stringify(results));
                                                                            roomInfo[0].msg = completedMsgData.reverse();
                                                                            if (roomInfo[0].chat_type === "friend") {
                                                                                conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ?", [roomId], (ee, rr, ff) => {
                                                                                    if (!ee) {
                                                                                        let friendChatInfo = JSON.parse(JSON.stringify(rr));
                                                                                        let userChatInfo = JSON.parse(JSON.stringify(rr));
                                                                                        friendChatInfo = friendChatInfo.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                                                        userChatInfo = userChatInfo.filter(e => e.um_userId.toString() === userKey.id.toString());
                                                                                        roomInfo[0].room_name = friendChatInfo[0].name;
                                                                                        roomInfo[0].profile = friendChatInfo[0].profile;
                                                                                        roomInfo[0].online_status = friendChatInfo[0].online_status;
                                                                                        roomInfo[0].userRoomStatus = friendChatInfo[0].um_status;
                                                                                        if (userChatInfo[0].unseen_msg > 0) {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (eee, rrr, fff) => {
                                                                                                if (!eee) {
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                                }
                                                                                                else {
                                                                                                    res.json({ success: false });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        res.json({ success: false });
                                                                                    }
                                                                                });
                                                                            }
                                                                            else {
                                                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (me, mr, mf) => {
                                                                                    if (!me) {
                                                                                        const memberUnseen = JSON.parse(JSON.stringify(mr));
                                                                                        if (memberUnseen[0].unseen_msg > 0) {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (es, rs, fs) => {
                                                                                                if (!es) {
                                                                                                    roomInfo[0].userRoomStatus = memberUnseen[0].um_status;
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                                }
                                                                                                else {
                                                                                                    res.json({ success: false });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            roomInfo[0].userRoomStatus = memberUnseen[0].um_status;
                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg, userRoomStatus: memberUnseen[0].um_status });
                                                                                        }
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
                                        else if (removedNum.length === 0) {
                                            conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active"], (e, r, f) => {
                                                if (!e) {
                                                    const msgData = JSON.parse(JSON.stringify(r));
                                                    const deleteMsgQuery = mysql2_1.default.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);
                                                    conn.execute(deleteMsgQuery, (err, result, field) => {
                                                        if (!err) {
                                                            let deleteMsg = JSON.parse(JSON.stringify(result));
                                                            deleteMsg = deleteMsg.map(e => e.d_message_id.toString());
                                                            let completedMsgData = msgData;
                                                            completedMsgData = completedMsgData.map(e => {
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
                                                                    me: e.user_id.toString()
                                                                };
                                                            });
                                                            conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id], (he, hr, hf) => {
                                                                if (!he) {
                                                                    const hiddenMsg = JSON.parse(JSON.stringify(hr));
                                                                    const hiddenMessage = hiddenMsg.map(e => e.h_messageId.toString());
                                                                    completedMsgData = completedMsgData.map(e => {
                                                                        if (hiddenMessage.includes(e.message_id.toString())) {
                                                                            e.hidden = true;
                                                                            return e;
                                                                        }
                                                                        else {
                                                                            e.hidden = false;
                                                                            return e;
                                                                        }
                                                                    });
                                                                    conn.execute("SELECT * FROM message_room WHERE chat_id = ?", [roomId], (error, results, fields) => {
                                                                        if (!error) {
                                                                            let roomInfo = JSON.parse(JSON.stringify(results));
                                                                            roomInfo[0].msg = completedMsgData.reverse();
                                                                            if (roomInfo[0].chat_type === "friend") {
                                                                                conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ?", [roomId], (ee, rr, ff) => {
                                                                                    if (!ee) {
                                                                                        let friendChatInfo = JSON.parse(JSON.stringify(rr));
                                                                                        let userChatInfo = JSON.parse(JSON.stringify(rr));
                                                                                        friendChatInfo = friendChatInfo.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                                                        userChatInfo = userChatInfo.filter(e => e.um_userId.toString() === userKey.id.toString());
                                                                                        roomInfo[0].room_name = friendChatInfo[0].name;
                                                                                        roomInfo[0].profile = friendChatInfo[0].profile;
                                                                                        roomInfo[0].online_status = friendChatInfo[0].online_status;
                                                                                        conn.execute("SELECT * FROM friends WHERE userId = ? AND friend_id = ?", [userKey.id, friendChatInfo[0].id], (eeee, rrrr, ffff) => {
                                                                                            if (!eeee) {
                                                                                                const friendStatus = JSON.parse(JSON.stringify(rrrr));
                                                                                                roomInfo[0].friendAction = friendStatus[0].action;
                                                                                                roomInfo[0].userRoomStatus = friendStatus[0].f_status;
                                                                                                if (userChatInfo[0].unseen_msg > 0) {
                                                                                                    conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (eee, rrr, fff) => {
                                                                                                        if (!eee) {
                                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                                        }
                                                                                                        else {
                                                                                                            res.json({ success: false });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                                else {
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
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
                                                                            else {
                                                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (me, mr, mf) => {
                                                                                    if (!me) {
                                                                                        const memberUnseen = JSON.parse(JSON.stringify(mr));
                                                                                        if (memberUnseen[0].unseen_msg > 0) {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (es, rs, fs) => {
                                                                                                if (!es) {
                                                                                                    roomInfo[0].userRoomStatus = memberUnseen[0].um_status;
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                                }
                                                                                                else {
                                                                                                    res.json({ success: false });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            roomInfo[0].userRoomStatus = memberUnseen[0].um_status;
                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg, userRoomStatus: memberUnseen[0].um_status });
                                                                                        }
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
                else {
                    res.json({ success: false, status: "invalid" });
                }
            }
            else {
                res.json({ success: false, status: "invalid" });
            }
        }
    }
    Read.FetchChat = FetchChat;
    class FetchOldChat {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const num = req.query.n;
            const roomId = req.query.r;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && num !== "" && num !== undefined && roomId !== "" && roomId !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ?", [userKey.id, roomId], (err, result, field) => {
                        if (!err) {
                            const roomStatus = JSON.parse(JSON.stringify(result));
                            if (roomStatus.length === 1) {
                                if (roomStatus[0].um_status !== "removed" && roomStatus[0].um_status !== "exit group") {
                                    conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? ORDER BY message_id DESC LIMIT ?, 10", [roomId, num], (e, r, f) => {
                                        if (!e) {
                                            const msg = JSON.parse(JSON.stringify(r));
                                            let completedMsg = msg.map((e) => {
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
                                                    me: e.user_id.toString(),
                                                };
                                            });
                                            if (msg.length > 0) {
                                                const deleteMsgQuery = mysql2_1.default.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);
                                                conn.execute(deleteMsgQuery, (error, results, fields) => {
                                                    if (!error) {
                                                        conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id.toString()], (he, hr, hf) => {
                                                            if (!he) {
                                                                const hideMsg = JSON.parse(JSON.stringify(hr));
                                                                const hideMessage = hideMsg.map(e => e.h_messageId.toString());
                                                                completedMsg = completedMsg.map(e => {
                                                                    if (hideMessage.includes(e.message_id.toString())) {
                                                                        e.hidden = true;
                                                                        return e;
                                                                    }
                                                                    else {
                                                                        e.hidden = false;
                                                                        return e;
                                                                    }
                                                                });
                                                                let deleteMsg = JSON.parse(JSON.stringify(results));
                                                                deleteMsg = deleteMsg.map(e => e.d_message_id.toString());
                                                                res.json({ success: true, data: completedMsg, deleteMsg: deleteMsg });
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
                                                res.json({ success: true, data: [], deleteMsg: [] });
                                            }
                                        }
                                        else {
                                            res.json({ success: false });
                                        }
                                    });
                                }
                                else {
                                    conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_id <= ? ORDER BY message_id DESC LIMIT ?, 10", [roomId, roomStatus[0].um_remove_time, num], (e, r, f) => {
                                        if (!e) {
                                            const msg = JSON.parse(JSON.stringify(r));
                                            let completedMsg = msg.map((e) => {
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
                                                    me: e.user_id.toString(),
                                                };
                                            });
                                            if (msg.length > 0) {
                                                const deleteMsgQuery = mysql2_1.default.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);
                                                conn.execute(deleteMsgQuery, (error, results, fields) => {
                                                    if (!error) {
                                                        conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id.toString()], (he, hr, hf) => {
                                                            if (!he) {
                                                                const hideMsg = JSON.parse(JSON.stringify(hr));
                                                                const hideMessage = hideMsg.map(e => e.h_messageId.toString());
                                                                completedMsg = completedMsg.map(e => {
                                                                    if (hideMessage.includes(e.message_id.toString())) {
                                                                        e.hidden = true;
                                                                        return e;
                                                                    }
                                                                    else {
                                                                        e.hidden = false;
                                                                        return e;
                                                                    }
                                                                });
                                                                let deleteMsg = JSON.parse(JSON.stringify(results));
                                                                deleteMsg = deleteMsg.map(e => e.d_message_id.toString());
                                                                res.json({ success: true, data: completedMsg, deleteMsg: deleteMsg });
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
                                                res.json({ success: true, data: [], deleteMsg: [] });
                                            }
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
                else {
                    res.json({ success: false });
                }
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Read.FetchOldChat = FetchOldChat;
    class GroupMembers {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const roomId = req.query.r;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && roomId !== "" && roomId !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ? AND um_status = ?", [roomId, "Active"], (e, r, f) => {
                        if (!e) {
                            const members = JSON.parse(JSON.stringify(r));
                            if (members.length > 0) {
                                const sortMembers = members.map((e) => {
                                    return {
                                        userId: e.id,
                                        name: e.name,
                                        username: e.username,
                                        profile: e.profile
                                    };
                                });
                                res.json({ success: true, data: sortMembers });
                            }
                            else {
                                res.json({ success: true, data: [] });
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
    Read.GroupMembers = GroupMembers;
    class GroupFriends {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const num = req.query.num;
            const roomId = req.query.roomId;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? LIMIT ?, 15", [userKey.id, "friended", num], (err, result, field) => {
                        if (!err) {
                            const friendData = JSON.parse(JSON.stringify(result));
                            const data = [];
                            if (friendData.length >= 1) {
                                friendData.forEach((friend) => {
                                    data.push({
                                        fId: friend.f_id,
                                        friendId: friend.friend_id,
                                        action: friend.action,
                                        status: friend.f_status,
                                        f_username: friend.username,
                                        f_name: friend.name,
                                        f_profile: friend.profile,
                                        f_background: friend.background,
                                        f_dataJoin: friend.date_join,
                                    });
                                });
                                const queryGroup = mysql2_1.default.format("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ? AND um_userId IN ?", [roomId, "Active", [data.map(e => e.friendId)]]);
                                conn.execute(queryGroup, (e, r, f) => {
                                    if (!e) {
                                        let groupData = JSON.parse(JSON.stringify(r));
                                        groupData = groupData.map(e => e.um_userId);
                                        const sortGroupMembers = data.filter(e => !groupData.includes(e.friendId));
                                        res.json({ status: "success", friends: sortGroupMembers, num: friendData.length });
                                    }
                                    else {
                                        res.json({ status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ status: "success", friends: data, num: friendData.length });
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
    Read.GroupFriends = GroupFriends;
    class SearchFriendsGroup {
        Run(conn, req, res) {
            // SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE "a%" AND user.status = "Active" AND f_status = "friended"
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const roomId = req.query.roomId;
            const num = req.query.num;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ? LIMIT ? ,15", [`${req.query.friend}%`, "friended", userKey.id, Number(num)], (err, result, field) => {
                        if (!err) {
                            const friendData = JSON.parse(JSON.stringify(result));
                            const totalFriend = [];
                            if (friendData.length > 0) {
                                friendData.forEach((friend) => {
                                    totalFriend.push({
                                        fId: friend.f_id,
                                        friendId: friend.friend_id,
                                        action: friend.action,
                                        status: friend.f_status,
                                        f_username: friend.username,
                                        f_name: friend.name,
                                        f_profile: friend.profile,
                                        f_background: friend.background,
                                        f_dataJoin: friend.date_join,
                                    });
                                });
                                const queryGroup = mysql2_1.default.format("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ? AND um_userId IN ?", [roomId, "Active", [totalFriend.map(e => e.friendId)]]);
                                conn.execute(queryGroup, (e, r, f) => {
                                    if (!e) {
                                        let groupData = JSON.parse(JSON.stringify(r));
                                        groupData = groupData.map(e => e.um_userId);
                                        const sortGroupMembers = totalFriend.filter(e => !groupData.includes(e.friendId));
                                        res.json({ status: "success", friends: sortGroupMembers, num: friendData.length });
                                    }
                                    else {
                                        res.json({ status: "database error" });
                                    }
                                });
                            }
                            else {
                                res.json({ status: "success", friends: totalFriend });
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
    Read.SearchFriendsGroup = SearchFriendsGroup;
    class SearchPosts {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const postQuery = req.query.q;
            const num = req.query.n;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postQuery !== "" && postQuery !== undefined && num !== "" && num !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE content LIKE ? AND post_status = ?  ORDER BY post_id DESC LIMIT ?, 20 ", [`%${postQuery}%`, "Active", num], (e, r, f) => {
                        if (!e) {
                            const posts = JSON.parse(JSON.stringify(r));
                            const sortPosts = posts.map(e => {
                                return {
                                    post_id: e.post_id,
                                    content: e.content,
                                    user_id: e.user_id,
                                    name: e.name,
                                    profile: e.profile,
                                };
                            });
                            res.json({ success: true, posts: sortPosts });
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
    Read.SearchPosts = SearchPosts;
    class Post {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const postId = req.query.p;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postId !== undefined && postId !== "") {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err, result, field) => {
                        if (!err) {
                            const searchLike = JSON.parse(JSON.stringify(result));
                            const totalPostId = searchLike.map((e) => e.post_id);
                            const likedQuery = mysql2_1.default.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);
                            if (searchLike.length !== 0) {
                                conn.execute(likedQuery, (error, results, fields) => {
                                    if (!error) {
                                        conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df) => {
                                            if (!de) {
                                                conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf) => {
                                                    if (!re) {
                                                        const reportPost = JSON.parse(JSON.stringify(rr));
                                                        const reportPostId = reportPost.map(e => e.r_post_id.toString());
                                                        const deletePost = JSON.parse(JSON.stringify(dr));
                                                        const deletePostId = deletePost.map(e => e.dp_postId.toString());
                                                        const likeResult = JSON.parse(JSON.stringify(results));
                                                        const sortLikeResult = likeResult.map((e) => e.post_id);
                                                        const data = JSON.parse(JSON.stringify(result));
                                                        let sortData = [];
                                                        sortData = data.map((e) => {
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
                                                                liked: sortLikeResult.includes(e.post_id.toString()),
                                                                deleted: deletePostId.includes(e.post_id.toString()),
                                                                reported: reportPostId.includes(e.post_id.toString()),
                                                                dateJoin: e.date_join
                                                            };
                                                        });
                                                        conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id, searchLike[0].id], (eee, rrr, fff) => {
                                                            if (!eee) {
                                                                const friendStatus = JSON.parse(JSON.stringify(rrr));
                                                                const sortFriend = friendStatus.map(e => {
                                                                    return {
                                                                        friendStatus: e.f_status,
                                                                        action: e.action
                                                                    };
                                                                });
                                                                res.json({ success: true, data: sortData, friendStatus: sortFriend });
                                                            }
                                                            else {
                                                                res.json({ success: true, result: "database error" });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.json({ success: true, result: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ success: true, result: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: true, result: "database error" });
                                    }
                                });
                            }
                            else {
                                const data = JSON.parse(JSON.stringify(result));
                                let sortData = [];
                                sortData = data.map((e) => {
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
                                        dateJoin: e.date_join
                                    };
                                });
                                res.json({ success: true, data: sortData });
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
    Read.Post = Post;
    class User {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const uId = req.query.uid;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && uId !== "" && uId !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user WHERE id = ?", [uId.trim()], (e, r, f) => {
                        if (!e) {
                            const user = JSON.parse(JSON.stringify(r));
                            if (user.length === 1) {
                                if (userKey.id.toString() !== user[0].id.toString()) {
                                    conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id.toString(), user[0].id.toString()], (ee, rr, ff) => {
                                        if (!ee) {
                                            const userInfo = JSON.parse(JSON.stringify(rr));
                                            if (userInfo.length === 0) {
                                                const sortUserData = user.map(e => {
                                                    return {
                                                        userId: e.id,
                                                        username: e.username,
                                                        name: e.name,
                                                        profile: e.profile,
                                                        background: e.background,
                                                        date_join: e.date_join,
                                                    };
                                                });
                                                res.json({ success: true, user: true, userInfo: sortUserData, friendStatus: false, me: false });
                                            }
                                            else {
                                                const sortUserData = user.map(e => {
                                                    return {
                                                        userId: e.id,
                                                        username: e.username,
                                                        name: e.name,
                                                        profile: e.profile,
                                                        background: e.background,
                                                        date_join: e.date_join,
                                                    };
                                                });
                                                const friendState = userInfo.map(e => {
                                                    return {
                                                        action: e.action,
                                                        f_status: e.f_status
                                                    };
                                                });
                                                res.json({ success: true, user: true, userInfo: sortUserData, friendStatus: true, friendInfo: friendState, me: false });
                                            }
                                        }
                                        else {
                                            res.json({ success: false });
                                        }
                                    });
                                }
                                else {
                                    const sortUserData = user.map(e => {
                                        return {
                                            userId: e.id,
                                            username: e.username,
                                            name: e.name,
                                            profile: e.profile,
                                            background: e.background,
                                            date_join: e.date_join,
                                        };
                                    });
                                    res.json({ success: true, user: true, userInfo: sortUserData, me: true });
                                }
                            }
                            else {
                                res.json({ success: true, user: false, me: false });
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
    Read.User = User;
    class UserPost {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            const uId = req.query.uid;
            const num = req.query.n;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && uId !== undefined && uId !== "" && num !== undefined && num !== "") {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE user_id = ? AND post_status = ? ORDER BY post_id DESC LIMIT ?, 10", [uId.toString(), "Active", num], (err, result, field) => {
                        if (!err) {
                            const searchLike = JSON.parse(JSON.stringify(result));
                            const totalPostId = searchLike.map((e) => e.post_id);
                            const likedQuery = mysql2_1.default.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);
                            if (searchLike.length !== 0) {
                                conn.execute(likedQuery, (error, results, fields) => {
                                    if (!error) {
                                        conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df) => {
                                            if (!de) {
                                                conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf) => {
                                                    if (!re) {
                                                        const reportPost = JSON.parse(JSON.stringify(rr));
                                                        const reportPostId = reportPost.map(e => e.r_post_id.toString());
                                                        const deletePost = JSON.parse(JSON.stringify(dr));
                                                        const deletePostId = deletePost.map(e => e.dp_postId.toString());
                                                        const likeResult = JSON.parse(JSON.stringify(results));
                                                        const sortLikeResult = likeResult.map((e) => e.post_id);
                                                        const data = JSON.parse(JSON.stringify(result));
                                                        let sortData = [];
                                                        sortData = data.map((e) => {
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
                                                                liked: sortLikeResult.includes(e.post_id.toString()),
                                                                deleted: deletePostId.includes(e.post_id.toString()),
                                                                reported: reportPostId.includes(e.post_id.toString()),
                                                                dateJoin: e.date_join
                                                            };
                                                        });
                                                        conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id, searchLike[0].id], (eee, rrr, fff) => {
                                                            if (!eee) {
                                                                const friendStatus = JSON.parse(JSON.stringify(rrr));
                                                                const sortFriend = friendStatus.map(e => {
                                                                    return {
                                                                        friendStatus: e.f_status,
                                                                        action: e.action
                                                                    };
                                                                });
                                                                res.json({ success: true, data: sortData, friendStatus: sortFriend });
                                                            }
                                                            else {
                                                                res.json({ success: true, result: "database error" });
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.json({ success: true, result: "database error" });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({ success: true, result: "database error" });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({ success: true, result: "database error" });
                                    }
                                });
                            }
                            else {
                                const data = JSON.parse(JSON.stringify(result));
                                let sortData = [];
                                sortData = data.map((e) => {
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
                                        dateJoin: e.date_join
                                    };
                                });
                                res.json({ success: true, data: sortData });
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
    Read.UserPost = UserPost;
    class UserInfo {
        Run(conn, req, res) {
            dotenv.config();
            const key = process.env;
            const reqIdKey = req.query.u;
            try {
                const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            }
            catch (e) {
                res.json({ status: "invalid" });
                return;
            }
            const userId = crypto_js_1.AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey = JSON.parse(userId.toString(crypto_js_1.enc.Utf8));
            if (userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined) {
                if (userKey.clientKey.trim() === key.SECRET_KEY_CLIENT) {
                    conn.execute("SELECT * FROM user WHERE id = ? AND status = ?", [userKey.id, "Active"], (e, r, f) => {
                        if (!e) {
                            const userInfo = JSON.parse(JSON.stringify(r));
                            if (userInfo.length === 1) {
                                const sortUserData = userInfo.map((e) => {
                                    return {
                                        username: e.username,
                                        name: e.name,
                                        profile: e.profile,
                                        background: e.background,
                                        email: e.email,
                                        dateJoin: e.date_join,
                                    };
                                });
                                conn.execute("SELECT COUNT(f_id) as totalfriend FROM friends WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (err, result, field) => {
                                    if (!err) {
                                        const totalFriends = JSON.parse(JSON.stringify(result));
                                        sortUserData[0].totalFriend = totalFriends[0].totalfriend;
                                        res.json({ success: true, data: sortUserData });
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
            }
            else {
                res.json({ success: false });
            }
        }
    }
    Read.UserInfo = UserInfo;
})(Read = exports.Read || (exports.Read = {}));
