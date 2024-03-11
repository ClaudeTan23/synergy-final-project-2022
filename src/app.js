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
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const mysql_1 = require("./database/mysql");
const register_1 = __importDefault(require("./route/register"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const crypto_js_1 = require("crypto-js");
const auth_1 = require("./method/auth");
const login_1 = __importDefault(require("./route/login"));
const multer_1 = __importStar(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const insert_data_1 = require("./method/insert-data");
const update_data_1 = require("./method/update-data");
const read_data_1 = require("./method/read-data");
const home_page_1 = require("./websocket/home-page");
const http_1 = require("http");
const register_mailer_1 = require("./mailer/register-mailer");
var App;
(function (App) {
    var _a;
    try {
        dotenv.config();
        const env = process.env;
        const app = (0, express_1.default)();
        const httpServer = (0, http_1.createServer)(app);
        const database = new mysql_1.Mysql2.Initialize();
        const socketIo = new home_page_1.HomeSocket.Main(httpServer, database.connection);
        // const uploadOptions: StorageEngine = diskStorage({
        //     destination: (req, file, cb) => {
        //         cb(null, path.resolve(__dirname, "../media"));
        //     },
        //     filename: (req, file, cb) => {
        //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        //         cb(null, uniqueSuffix + ".jpg")
        //     },
        // });
        // socketIo.RunSocket(httpServer);
        const corsOptions = {
            origin: (_a = env.CORS_URL) === null || _a === void 0 ? void 0 : _a.split(","),
            optionsSuccessStatus: 200,
            credentials: true,
        };
        // const sessionOptions: SessionOptions = {
        //     secret: "uwu",
        //     resave: false,
        //     saveUninitialized: false, 
        //     cookie: { secure: false, maxAge: 1000 * 60 * 24, domain: "http://172.20.10.2:3000" },
        // }
        // app.set("trust proxy", 1);
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use("/media", express_1.default.static(path.resolve(__dirname, "../media")));
        // app.use(session(sessionOptions));
        app.use((0, cookie_parser_1.default)());
        app.options([
            "/",
            "/post",
            "/comment",
            "/like",
            "/unfriended",
            "/addfriend",
            "/crequest",
            "/confrimrequest",
            "/blocked",
            "/unblock",
            "/create/chat/group",
            "/create/chat/friend",
            "/post/msg",
            "/delete/msg",
            "/update/unseen",
            "/delete/chat",
            "/group/file",
            "/remove/group/member",
            "/disband/group",
            "/group/add/member",
            "/exit/group",
            "/delete/post",
            "/report/post",
            "/delete/comment",
            "/report/comment",
            "/user/setting/bg",
            "/user/setting/pf",
            "/update/user/name",
            "/update/user/password",
            "/hide/msg",
        ], (0, cors_1.default)(corsOptions));
        app.use("/", register_1.default);
        app.use("/", login_1.default);
        // app.use(function(req, res, next) {
        //     res.header("Access-Control-Allow-Origin", "http://172.20.10.2:3000/");
        //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
        //     res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
        //     next();
        // });
        app.get("/u", (0, cors_1.default)(corsOptions), (req, res) => {
            const auth = new auth_1.Auth.Main(req, res);
            auth.Session(database.connection, socketIo);
        });
        app.get("/adminu", (0, cors_1.default)(corsOptions), (req, res) => {
            const auth = new auth_1.AdminAuth.Main(req, res);
            auth.Session(database.connection, socketIo);
        });
        app.get("/s", (0, cors_1.default)(corsOptions), (req, res) => {
            res.send("asd");
        });
        app.get("/verify", (0, cors_1.default)(corsOptions), (req, res) => {
            const verifyData = req.query;
            console.log(verifyData);
            if (verifyData.u !== undefined && verifyData.c !== undefined && verifyData.u !== "" && verifyData.c !== "") {
                database.connection.execute("SELECT * FROM user WHERE username = ? AND confirmationCode = ?", [verifyData.u.trim(), verifyData.c.trim()], (err, result, field) => {
                    const data = JSON.parse(JSON.stringify(result));
                    const date = new Date();
                    const totalDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;
                    if (data.length >= 1) {
                        if (verifyData.action.trim() === "active") {
                            database.connection.execute(`UPDATE user SET status = 'Active' WHERE username = ?`, [verifyData.u.trim()], (error, results, fields) => {
                                if (!error) {
                                    const id = data[0].id;
                                    const authClient = process.env.SECRET_KEY_CLIENT.toString();
                                    const position = (data[0].position === "admin") ? true : false;
                                    const authKey = crypto_js_1.AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY.toString()).toString();
                                    const mailer = new register_mailer_1.NodeMailer.Mailer();
                                    mailer.SendMail(data[0].email, "Social Connect Account Approved", undefined, "Your account from social connect have approved.", res);
                                    // res.json({ auth: true, p: position, i: "active" });   
                                }
                                else {
                                    res.json({ auth: false });
                                }
                            });
                        }
                        else if (verifyData.action.trim() === "deactivate") {
                            database.connection.execute(`UPDATE user SET status = 'Deactivate' WHERE username = ?`, [verifyData.u.trim()], (error, results, fields) => {
                                if (!error) {
                                    const id = data[0].id;
                                    const authClient = process.env.SECRET_KEY_CLIENT.toString();
                                    const position = (data[0].position === "admin") ? true : false;
                                    socketIo.IO.to(id.toString()).emit("deactivate-account", true);
                                    const authKey = crypto_js_1.AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY.toString()).toString();
                                    res.json({ auth: true, p: position, i: "deactivate" });
                                }
                                else {
                                    res.json({ auth: false });
                                }
                            });
                        }
                    }
                    else {
                        res.json({ auth: false });
                    }
                });
            }
            else {
                res.json({ auth: false });
            }
        });
        app.post("/post", (0, cors_1.default)(corsOptions), (req, res) => {
            let checkFile = true;
            let filesDelete = [];
            const insertPost = new insert_data_1.Insert.Post();
            (0, multer_1.default)({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, path.resolve(__dirname, "../media"));
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                        filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);
                        cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
                    },
                }),
                limits: { fileSize: 50000000 },
                fileFilter(req, file, callback) {
                    if (file.mimetype.split("/")[0] !== "image" && file.mimetype.split("/")[0] !== "video" || !checkFile) {
                        checkFile = false;
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                },
            }).fields([{ name: "files" }])(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        res.json({ status: true, result: "oversize" });
                    }
                }
                else {
                    if (checkFile) {
                        insertPost.Run(database.connection, req.body.content, filesDelete, req.body.user, req.body.time, req, res);
                    }
                    else {
                        if (filesDelete.length > 0) {
                            filesDelete.forEach((e) => {
                                fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => { });
                            });
                        }
                        res.json({ status: true, result: "invalid" });
                    }
                }
            });
            checkFile = true;
            filesDelete = [];
        });
        app.post("/comment", (0, cors_1.default)(corsOptions), (req, res) => {
            let checkFile = true;
            let filesDelete = [];
            const insertPost = new insert_data_1.Insert.Comment();
            (0, multer_1.default)({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, path.resolve(__dirname, "../media"));
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                        filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);
                        cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
                    },
                }),
                limits: { fileSize: 50000000 },
                fileFilter(req, file, callback) {
                    if ((file.mimetype.split("/")[0] !== "image" &&
                        file.mimetype.split("/")[0] !== "video") ||
                        !checkFile) {
                        checkFile = false;
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                },
            }).single("file")(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        res.json({ status: true, result: "oversize" });
                    }
                }
                else {
                    if (checkFile) {
                        insertPost.Run(database.connection, req.body.user, req.body.postId, req.body.postUserId, req.body.content, req.body.time, filesDelete, req, res);
                    }
                    else {
                        if (filesDelete.length > 0) {
                            filesDelete.forEach((e) => {
                                fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => { });
                            });
                        }
                        res.json({ status: true, result: "invalid" });
                    }
                }
            });
            checkFile = true;
            filesDelete = [];
        });
        app.post("/like", (0, cors_1.default)(corsOptions), (req, res) => {
            const updateLike = new update_data_1.Update.Like();
            const properties = req.body;
            updateLike.Run(database.connection, properties.user, properties.postId, req, res);
        });
        app.get("/comment", (0, cors_1.default)(corsOptions), (req, res) => {
            const readComment = new read_data_1.Read.Comment();
            readComment.Run(database.connection, req.query.p, req.query.comment, req, res);
        });
        app.get("/friends", (0, cors_1.default)(corsOptions), (req, res) => {
            const friends = new read_data_1.Read.Friends();
            friends.Run(database.connection, req, res);
        });
        app.get("/smf", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchFriend = new read_data_1.Read.SearchFriends();
            searchFriend.Run(database.connection, req, res);
        });
        app.get("/fnf", (0, cors_1.default)(corsOptions), (req, res) => {
            const findNewFriends = new read_data_1.Read.FindNewFriend();
            findNewFriends.Run(database.connection, req, res);
        });
        app.get("/blocked", (0, cors_1.default)(corsOptions), (req, res) => {
            const blockedUser = new read_data_1.Read.BlockedUsers();
            blockedUser.Run(database.connection, req, res);
        });
        app.get("/fbu", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchBlockedUser = new read_data_1.Read.findBlockedUser();
            searchBlockedUser.Run(database.connection, req, res);
        });
        app.post("/unfriended", (0, cors_1.default)(corsOptions), (req, res) => {
            const unFriended = new update_data_1.Update.Unfriended();
            unFriended.Run(database.connection, req, res);
        });
        app.get("/frequest", (0, cors_1.default)(corsOptions), (req, res) => {
            const fetchFriendRequest = new read_data_1.Read.FriendRequest();
            fetchFriendRequest.Run(database.connection, req, res);
        });
        app.post("/addfriend", (0, cors_1.default)(corsOptions), (req, res) => {
            const addFriend = new insert_data_1.Insert.AddFriend();
            addFriend.Run(database.connection, req, res, socketIo);
        });
        app.get("/srequest", (0, cors_1.default)(corsOptions), (req, res) => {
            const sentRequest = new read_data_1.Read.SentRequest();
            sentRequest.Run(database.connection, req, res);
        });
        app.get("/sfr", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchFriendRequest = new read_data_1.Read.findFriendRequest();
            searchFriendRequest.Run(database.connection, req, res);
        });
        app.get("/ssr", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchSentRequest = new read_data_1.Read.findSentRequest();
            searchSentRequest.Run(database.connection, req, res);
        });
        app.post("/crequest", (0, cors_1.default)(corsOptions), (req, res) => {
            const cancelRequest = new update_data_1.Update.CancelRequest();
            cancelRequest.Run(database.connection, req, res, socketIo);
        });
        app.post("/confrimrequest", (0, cors_1.default)(corsOptions), (req, res) => {
            const confrimRequest = new update_data_1.Update.ConfirmRequest();
            confrimRequest.Run(database.connection, req, res, socketIo);
        });
        app.post("/blocked", (0, cors_1.default)(corsOptions), (req, res) => {
            const block = new update_data_1.Update.Blocked();
            block.Run(database.connection, req, res, socketIo);
        });
        app.post("/unblock", (0, cors_1.default)(corsOptions), (req, res) => {
            const unBlocked = new update_data_1.Update.Unblock();
            unBlocked.Run(database.connection, req, res);
        });
        app.get("/nfriend", (0, cors_1.default)(corsOptions), (req, res) => {
            const friendNotification = new read_data_1.Read.FriendNotice();
            friendNotification.Run(database.connection, req, res);
        });
        app.get("/posts", (0, cors_1.default)(corsOptions), (req, res) => {
            const fetchPost = new read_data_1.Read.FetchPosts();
            fetchPost.Run(database.connection, req, res);
        });
        app.get("/chatfriend", (0, cors_1.default)(corsOptions), (req, res) => {
            const friendChat = new read_data_1.Read.FetchFriendChat();
            friendChat.Run(database.connection, req, res);
        });
        app.post("/create/chat/group", (0, cors_1.default)(corsOptions), (req, res) => {
            const CreateGroupChat = new insert_data_1.Insert.CreateGroupChat();
            CreateGroupChat.Run(database.connection, req, res, socketIo);
        });
        app.get("/chatfriendnonexist", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchNonExistFriendChat = new read_data_1.Read.FetchNonExistFriendChat();
            searchNonExistFriendChat.Run(database.connection, req, res);
        });
        app.post("/create/chat/friend", (0, cors_1.default)(corsOptions), (req, res) => {
            const createFriendChat = new insert_data_1.Insert.CreateFriendChat();
            createFriendChat.Run(database.connection, req, res, socketIo);
        });
        app.get("/messagelist", (0, cors_1.default)(corsOptions), (req, res) => {
            const fetchChatList = new read_data_1.Read.FetchChatList();
            fetchChatList.Run(database.connection, req, res);
        });
        app.get("/fetch/chat", (0, cors_1.default)(corsOptions), (req, res) => {
            const fetchChat = new read_data_1.Read.FetchChat();
            fetchChat.Run(database.connection, req, res);
        });
        app.post("/post/msg", (0, cors_1.default)(corsOptions), (req, res) => {
            const insertMsg = new insert_data_1.Insert.InsertMessage();
            insertMsg.Run(database.connection, req, res, socketIo);
        });
        app.get("/fetcholdchat", (0, cors_1.default)(corsOptions), (req, res) => {
            const oldChat = new read_data_1.Read.FetchOldChat();
            oldChat.Run(database.connection, req, res);
        });
        app.post("/delete/msg", (0, cors_1.default)(corsOptions), (req, res) => {
            const deleteMessage = new insert_data_1.Insert.DeleteMsg();
            deleteMessage.Run(database.connection, req, res, socketIo);
        });
        app.post("/update/unseen", (0, cors_1.default)(corsOptions), (req, res) => {
            const updateUnseen = new update_data_1.Update.UpdateUnseen();
            updateUnseen.Run(database.connection, req, res);
        });
        app.post("/delete/chat", (0, cors_1.default)(corsOptions), (req, res) => {
            const deleteMsg = new update_data_1.Update.DeleteMessage();
            deleteMsg.Run(database.connection, req, res);
        });
        app.get("/fetch/group/members", (0, cors_1.default)(corsOptions), (req, res) => {
            const getMembers = new read_data_1.Read.GroupMembers();
            getMembers.Run(database.connection, req, res);
        });
        app.post("/group/file", (0, cors_1.default)(corsOptions), (req, res) => {
            const insertGroupMedia = new insert_data_1.Insert.InsertGroupMedia();
            let checkFile = true;
            let filesDelete = [];
            (0, multer_1.default)({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, path.resolve(__dirname, "../media"));
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                        filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);
                        cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
                    },
                }),
                limits: { fileSize: 50000000 },
                fileFilter(req, file, callback) {
                    if ((file.mimetype.split("/")[0] !== "image" &&
                        file.mimetype.split("/")[0] !== "video") ||
                        !checkFile) {
                        checkFile = false;
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                },
            }).single("file")(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        res.json({ status: true, result: "oversize" });
                    }
                }
                else {
                    if (checkFile) {
                        insertGroupMedia.Run(database.connection, req.body.user, req.body.roomId, filesDelete, req, res, socketIo);
                    }
                    else {
                        if (filesDelete.length > 0) {
                            filesDelete.forEach((e) => {
                                fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => { });
                            });
                        }
                        res.json({ status: true, result: "invalid" });
                    }
                }
            });
        });
        app.get("/group/friend", (0, cors_1.default)(corsOptions), (req, res) => {
            const getGroupFriends = new read_data_1.Read.GroupFriends();
            getGroupFriends.Run(database.connection, req, res);
        });
        app.get("/group/search/friend", (0, cors_1.default)(corsOptions), (req, res) => {
            const fethcGroupFriend = new read_data_1.Read.SearchFriendsGroup();
            fethcGroupFriend.Run(database.connection, req, res);
        });
        app.post("/remove/group/member", (0, cors_1.default)(corsOptions), (req, res) => {
            const removeGroupMember = new update_data_1.Update.RemoveGroupMember();
            removeGroupMember.Run(database.connection, req, res, socketIo);
        });
        app.post("/disband/group", (0, cors_1.default)(corsOptions), (req, res) => {
            const disbandGroup = new update_data_1.Update.DisbandGroup();
            disbandGroup.Run(database.connection, req, res, socketIo);
        });
        app.post("/group/add/member", (0, cors_1.default)(corsOptions), (req, res) => {
            const addMember = new insert_data_1.Insert.AddGroupMember();
            addMember.Run(database.connection, req, res, socketIo);
        });
        app.post("/exit/group", (0, cors_1.default)(corsOptions), (req, res) => {
            const exitGroup = new update_data_1.Update.ExitGroup();
            exitGroup.Run(database.connection, req, res, socketIo);
        });
        app.post("/delete/post", (0, cors_1.default)(corsOptions), (req, res) => {
            const deletePost = new insert_data_1.Insert.DeletePost();
            deletePost.Run(database.connection, req, res);
        });
        app.post("/report/post", (0, cors_1.default)(corsOptions), (req, res) => {
            const reportPost = new insert_data_1.Insert.ReportPost();
            reportPost.Run(database.connection, req, res);
        });
        app.post("/delete/comment", (0, cors_1.default)(corsOptions), (req, res) => {
            const deleteComment = new insert_data_1.Insert.DeleteComment();
            deleteComment.Run(database.connection, req, res);
        });
        app.post("/report/comment", (0, cors_1.default)(corsOptions), (req, res) => {
            const reportComment = new insert_data_1.Insert.ReportComment();
            reportComment.Run(database.connection, req, res);
        });
        app.get("/search/post", (0, cors_1.default)(corsOptions), (req, res) => {
            const searchPosts = new read_data_1.Read.SearchPosts();
            searchPosts.Run(database.connection, req, res);
        });
        app.get("/post", (0, cors_1.default)(corsOptions), (req, res) => {
            const post = new read_data_1.Read.Post();
            post.Run(database.connection, req, res);
        });
        app.get("/user", (0, cors_1.default)(corsOptions), (req, res) => {
            const userInfo = new read_data_1.Read.User();
            userInfo.Run(database.connection, req, res);
        });
        app.get("/upost", (0, cors_1.default)(corsOptions), (req, res) => {
            const userPost = new read_data_1.Read.UserPost();
            userPost.Run(database.connection, req, res);
        });
        app.get("/uinfo", (0, cors_1.default)(corsOptions), (req, res) => {
            const fetchUserInfo = new read_data_1.Read.UserInfo();
            fetchUserInfo.Run(database.connection, req, res);
        });
        app.post("/user/setting/bg", (0, cors_1.default)(corsOptions), (req, res) => {
            const userBg = new update_data_1.Update.UpdateUserBackground();
            let checkFile = true;
            let filesDelete = [];
            (0, multer_1.default)({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, path.resolve(__dirname, "../media"));
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                        filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);
                        cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
                    },
                }),
                limits: { fileSize: 50000000 },
                fileFilter(req, file, callback) {
                    if ((file.mimetype.split("/")[0] !== "image" &&
                        file.mimetype.split("/")[0] !== "video") ||
                        !checkFile) {
                        checkFile = false;
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                },
            }).single("bgImg")(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        res.json({ status: true, result: "oversize" });
                    }
                }
                else {
                    if (checkFile) {
                        userBg.Run(database.connection, req.body.user, filesDelete, req, res);
                    }
                    else {
                        if (filesDelete.length > 0) {
                            filesDelete.forEach((e) => {
                                fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => { });
                            });
                        }
                        res.json({ status: true, result: "invalid" });
                    }
                }
            });
        });
        app.post("/user/setting/pf", (0, cors_1.default)(corsOptions), (req, res) => {
            const userPf = new update_data_1.Update.UpdateUserProfile();
            let checkFile = true;
            let filesDelete = [];
            (0, multer_1.default)({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, path.resolve(__dirname, "../media"));
                    },
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                        filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);
                        cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
                    },
                }),
                limits: { fileSize: 50000000 },
                fileFilter(req, file, callback) {
                    if ((file.mimetype.split("/")[0] !== "image" &&
                        file.mimetype.split("/")[0] !== "video") ||
                        !checkFile) {
                        checkFile = false;
                        callback(null, false);
                    }
                    else {
                        callback(null, true);
                    }
                },
            }).single("pfImg")(req, res, (err) => {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        res.json({ status: true, result: "oversize" });
                    }
                }
                else {
                    if (checkFile) {
                        userPf.Run(database.connection, req.body.user, filesDelete, req, res);
                    }
                    else {
                        if (filesDelete.length > 0) {
                            filesDelete.forEach((e) => {
                                fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => { });
                            });
                        }
                        res.json({ status: true, result: "invalid" });
                    }
                }
            });
        });
        app.post("/update/user/name", (0, cors_1.default)(corsOptions), (req, res) => {
            const updateUsername = new update_data_1.Update.UpdateUserName();
            updateUsername.Run(database.connection, req, res);
        });
        app.post("/update/user/password", (0, cors_1.default)(corsOptions), (req, res) => {
            const updateUserPassword = new update_data_1.Update.UpdateUserPassword();
            updateUserPassword.Run(database.connection, req, res);
        });
        app.post("/hide/msg", (0, cors_1.default)(corsOptions), (req, res) => {
            const hideMsg = new insert_data_1.Insert.HideMessage();
            hideMsg.Run(database.connection, req, res);
        });
        httpServer.listen(env.PORT, () => {
            console.log(`listening to port ${env.PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
})(App = exports.App || (exports.App = {}));
