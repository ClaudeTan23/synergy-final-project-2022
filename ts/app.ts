import express, { CookieOptions, request, Request, Response } from "express";
import mysql2, { FieldPacket, QueryError, RowDataPacket } from "mysql2";
import * as dotenv from "dotenv";
import { Mysql2 } from "./database/mysql";
import RegisterRouter from "./route/register";
import cors, { CorsOptions } from "cors";
import session, { SessionOptions } from "express-session";
import cookieParser from "cookie-parser";
import { AES, enc } from "crypto-js"; 
import { Model } from "./database/user-model";
import { Auth, AdminAuth } from "./method/auth";
import LoginRouter from "./route/login";
import multer, { StorageEngine, Multer, diskStorage} from "multer";
import * as path from "path";
import * as fs from "fs";
import { Insert } from "./method/insert-data";
import { Update } from "./method/update-data";
import { Read } from "./method/read-data";
import { HomeSocket } from "./websocket/home-page";
import http, { createServer } from "http";
import { NodeMailer } from "./mailer/register-mailer";

declare module "express-session"
{
    export interface SessionData
    {
        userId: string
    }
}

export namespace App
{

    try {
        
        dotenv.config();
        const env: any = process.env;
        const app: express.Application = express();
        const httpServer = createServer(app); 
        const database: Mysql2.Initialize = new Mysql2.Initialize();
        const socketIo: HomeSocket.Main = new HomeSocket.Main(httpServer, database.connection);
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
        const corsOptions: CorsOptions = {
            origin: env.CORS_URL?.split(","),
            optionsSuccessStatus: 200,
            credentials: true,
        }

        

        // const sessionOptions: SessionOptions = {
        //     secret: "uwu",
        //     resave: false,
        //     saveUninitialized: false, 
        //     cookie: { secure: false, maxAge: 1000 * 60 * 24, domain: "http://172.20.10.2:3000" },
        // }

        // app.set("trust proxy", 1);
        app.use(express.json());
        app.use(express.urlencoded({extended: false}));
        app.use("/media", express.static(path.resolve(__dirname, "../media")));
        // app.use(session(sessionOptions));
        app.use(cookieParser());

        app.options(
          [
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
          ],
          cors(corsOptions)
        );

        app.use("/", RegisterRouter);
        app.use("/", LoginRouter);

        // app.use(function(req, res, next) {
        //     res.header("Access-Control-Allow-Origin", "http://172.20.10.2:3000/");
        //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
        //     res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
        //     next();
        // });


        app.get("/u", cors(corsOptions), (req: Request, res: Response): void => 
        {
            const auth: Auth.Main = new Auth.Main(req, res);

            auth.Session(database.connection, socketIo);

        });

        app.get("/adminu", cors(corsOptions), (req: Request, res: Response): void => 
        {
            const auth: AdminAuth.Main = new AdminAuth.Main(req, res);

            auth.Session(database.connection, socketIo);

        });


        app.get("/s", cors(corsOptions), (req: Request, res: Response): void => {

            res.send("asd");
        });

        app.get("/verify", cors(corsOptions), (req: Request, res: Response): void =>
        {
            const verifyData: any = req.query;
            console.log(verifyData);
            
            if(verifyData.u !== undefined && verifyData.c !== undefined && verifyData.u !== "" && verifyData.c !== "")
            {

                database.connection.execute("SELECT * FROM user WHERE username = ? AND confirmationCode = ?", [verifyData.u.trim(), verifyData.c.trim()], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                {
                    const data: Array<Model.User> = JSON.parse(JSON.stringify(result));
                    const date: Date = new Date();
                    const totalDate: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;

                    if(data.length >= 1)
                    {
                        if(verifyData.action.trim() === "active")
                        {
                            database.connection.execute(`UPDATE user SET status = 'Active' WHERE username = ?`, [verifyData.u.trim()], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                            {
                                if(!error)
                                {
                                    const id: string         = data[0].id;
                                    const authClient: string = process.env.SECRET_KEY_CLIENT!.toString();
                                    const position: boolean = (data[0].position === "admin") ? true : false;

                                    const authKey: string = AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY!.toString()).toString()

                                    const mailer: any = new NodeMailer.Mailer();

                                    mailer.SendMail(
                                        data[0].email, 
                                        "Social Connect Account Approved",
                                        undefined,
                                        "Your account from social connect have approved.",
                                        res,
                                        );

                                    // res.json({ auth: true, p: position, i: "active" });   

                                } else 
                                {
                                    res.json({ auth: false });
                                }
                            });

                        } else if (verifyData.action.trim() === "deactivate")
                        {
                            database.connection.execute(`UPDATE user SET status = 'Deactivate' WHERE username = ?`, [verifyData.u.trim()], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                            {
                                if(!error)
                                {
                                    const id: string         = data[0].id;
                                    const authClient: string = process.env.SECRET_KEY_CLIENT!.toString();
                                    const position: boolean = (data[0].position === "admin") ? true : false;

                                    socketIo.IO.to(id.toString()).emit("deactivate-account", true);

                                    const authKey: string = AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY!.toString()).toString()

                                    res.json({ auth: true, p: position, i: "deactivate" });   

                                } else 
                                {
                                    res.json({ auth: false });
                                }
                            });
                        }

                    } else 
                    {
                        res.json({ auth: false });
                    }
                });

            } else 
            {
                res.json({ auth: false });
            }
            
        });

        app.post("/post", cors(corsOptions), (req: Request, res: Response): void => {

            let checkFile: boolean = true;
            let filesDelete: Array<string> = [];
            const insertPost: Insert.Post = new Insert.Post();

            multer({
              storage: diskStorage({
                destination: (req, file, cb) => 
                {
                  cb(null, path.resolve(__dirname, "../media"));

                },
                filename: (req, file, cb) => 
                {
                  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                  filesDelete.push(uniqueSuffix + "." + file.mimetype.split("/")[1]);

                  cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);

                },
              }),
              limits: { fileSize: 50000000 },
              fileFilter(req, file, callback) 
              {
     
                if(file.mimetype.split("/")[0] !== "image" && file.mimetype.split("/")[0] !== "video" || !checkFile)
                {
                    checkFile = false;
                    callback(null, false);
                    

                } else 
                {
                    callback(null, true);
                }

              },
            }).fields([{ name: "files" }])(req, res, (err) => 
            {
              if (err instanceof multer.MulterError) 
              {
                if (err.code === "LIMIT_FILE_SIZE") 
                {
                  res.json({ status: true, result: "oversize" });

                } 

              } else 
              {
                    if(checkFile) 
                    {
                      insertPost.Run(database.connection, req.body.content, filesDelete, req.body.user, req.body.time, req, res)
                               
                    } else 
                    {

                        if (filesDelete.length > 0) 
                        {

                            filesDelete.forEach((e) => 
                            {
                            fs.unlink(path.resolve(__dirname, `../media/${e}`), (e) => {});
                            });
                            
                        }

                        res.json({ status: true, result: "invalid" });
                    }
              }

            });

            checkFile = true;
            filesDelete = [];


        });

        app.post("/comment", cors(corsOptions), (req: Request, res: Response): void => {

          let checkFile: boolean = true;
          let filesDelete: Array<string> = [];
          const insertPost: Insert.Comment = new Insert.Comment();

          multer({
            storage: diskStorage({
              destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, "../media"));
              },
              filename: (req, file, cb) => {
                const uniqueSuffix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
                filesDelete.push(
                  uniqueSuffix + "." + file.mimetype.split("/")[1]
                );

                cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
              },
            }),
            limits: { fileSize: 50000000 },
            fileFilter(req, file, callback) {
              if (
                (file.mimetype.split("/")[0] !== "image" &&
                  file.mimetype.split("/")[0] !== "video") ||
                !checkFile
              ) {
                checkFile = false;
                callback(null, false);
              } else {
                callback(null, true);
              }
            },
          }).single("file")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.json({ status: true, result: "oversize" });
              }
            } else {
              if (checkFile) {
                
                insertPost.Run(database.connection, req.body.user, req.body.postId, req.body.postUserId, req.body.content, req.body.time, filesDelete, req, res);
                
              } else {
                if (filesDelete.length > 0) {
                  filesDelete.forEach((e) => {
                    fs.unlink(
                      path.resolve(__dirname, `../media/${e}`),
                      (e) => {}
                    );
                  });
                }

                res.json({ status: true, result: "invalid" });
              }
            }
          });

          checkFile = true;
          filesDelete = [];

        } );

        app.post("/like", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const updateLike: Update.Like = new Update.Like();
          const properties: { user: string, postId: string} = req.body;

          updateLike.Run(database.connection , properties.user, properties.postId, req, res);

        });

        app.get("/comment", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const readComment: Read.Comment = new Read.Comment();

          readComment.Run(database.connection, req.query.p, req.query.comment, req, res);
  
        });

        app.get("/friends", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const friends: Read.Friends = new Read.Friends();

          friends.Run(database.connection, req, res);

        });

        app.get("/smf", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const searchFriend: Read.SearchFriends = new Read.SearchFriends();

          searchFriend.Run(database.connection, req, res);
        });

        app.get("/fnf", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const findNewFriends: Read.FindNewFriend = new Read.FindNewFriend();

          findNewFriends.Run(database.connection, req, res);
        });

        app.get("/blocked", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const blockedUser: Read.BlockedUsers = new Read.BlockedUsers();

          blockedUser.Run(database.connection, req, res);
        });

        app.get("/fbu", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const searchBlockedUser: Read.findBlockedUser = new Read.findBlockedUser();

          searchBlockedUser.Run(database.connection, req, res);
        })

        app.post("/unfriended", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const unFriended: Update.Unfriended = new Update.Unfriended();

          unFriended.Run(database.connection, req, res);
        });

        app.get("/frequest", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const fetchFriendRequest: Read.FriendRequest = new Read.FriendRequest();

          fetchFriendRequest.Run(database.connection, req, res);
        })

        app.post("/addfriend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const addFriend: Insert.AddFriend = new Insert.AddFriend();

          addFriend.Run(database.connection, req, res, socketIo);
        })

        app.get("/srequest", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const sentRequest: Read.SentRequest = new Read.SentRequest();

          sentRequest.Run(database.connection, req, res);
        });

        app.get("/sfr", cors(corsOptions), (req: Request, res: Response): void => 
        {
          const searchFriendRequest: Read.findFriendRequest = new Read.findFriendRequest();

          searchFriendRequest.Run(database.connection, req, res);
        })

        app.get("/ssr", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const searchSentRequest: Read.findSentRequest = new Read.findSentRequest();

          searchSentRequest.Run(database.connection, req, res);
        })

        app.post("/crequest", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const cancelRequest: Update.CancelRequest = new Update.CancelRequest();

          cancelRequest.Run(database.connection, req, res, socketIo);
        });

        app.post("/confrimrequest", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const confrimRequest: Update.ConfirmRequest = new Update.ConfirmRequest();

          confrimRequest.Run(database.connection, req, res, socketIo);
        });

        app.post("/blocked", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const block: Update.Blocked = new Update.Blocked();

          block.Run(database.connection, req, res, socketIo);
        });

        app.post("/unblock", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const unBlocked: Update.Unblock = new Update.Unblock();

          unBlocked.Run(database.connection, req, res);
        });

        app.get("/nfriend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const friendNotification: Read.FriendNotice = new Read.FriendNotice();

          friendNotification.Run(database.connection, req, res);
        });

        app.get("/posts", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const fetchPost: Read.FetchPosts = new Read.FetchPosts();

          fetchPost.Run(database.connection, req, res);
        });

        app.get("/chatfriend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const friendChat: Read.FetchFriendChat = new Read.FetchFriendChat();

          friendChat.Run(database.connection, req, res);
        });

        app.post("/create/chat/group", cors(corsOptions), (req: Request, res: Response): void => 
        {
          const CreateGroupChat: Insert.CreateGroupChat = new Insert.CreateGroupChat();

          CreateGroupChat.Run(database.connection, req, res, socketIo);
        });

        app.get("/chatfriendnonexist", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const searchNonExistFriendChat: Read.FetchNonExistFriendChat = new Read.FetchNonExistFriendChat();

          searchNonExistFriendChat.Run(database.connection, req, res);
        });

        app.post("/create/chat/friend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const createFriendChat: Insert.CreateFriendChat = new Insert.CreateFriendChat();

          createFriendChat.Run(database.connection, req, res, socketIo);
        });

        app.get("/messagelist", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const fetchChatList: Read.FetchChatList = new Read.FetchChatList();

          fetchChatList.Run(database.connection, req, res);
        });

        app.get("/fetch/chat", cors(corsOptions), (req: Request, res: Response): void => 
        {
          const fetchChat: Read.FetchChat = new Read.FetchChat();

          fetchChat.Run(database.connection, req, res);
        });

        app.post("/post/msg", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const insertMsg: Insert.InsertMessage = new Insert.InsertMessage();

          insertMsg.Run(database.connection, req, res, socketIo);
        });

        app.get("/fetcholdchat", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const oldChat: Read.FetchOldChat = new Read.FetchOldChat();

          oldChat.Run(database.connection, req, res);
        });

        app.post("/delete/msg", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const deleteMessage: Insert.DeleteMsg = new Insert.DeleteMsg();

          deleteMessage.Run(database.connection, req, res, socketIo);
        });

        app.post("/update/unseen", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const updateUnseen: Update.UpdateUnseen = new Update.UpdateUnseen();

          updateUnseen.Run(database.connection, req, res);
        });

        app.post("/delete/chat", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const deleteMsg: Update.DeleteMessage = new Update.DeleteMessage();

          deleteMsg.Run(database.connection, req, res);
        });

        app.get("/fetch/group/members", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const getMembers: Read.GroupMembers = new Read.GroupMembers();

          getMembers.Run(database.connection, req, res);
        });

        app.post("/group/file", cors(corsOptions), (req: Request, res: Response): void => 
        {
          const insertGroupMedia: Insert.InsertGroupMedia = new Insert.InsertGroupMedia();
          let checkFile: boolean = true;
          let filesDelete: Array<string> = [];

          multer({
            storage: diskStorage({
              destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, "../media"));
              },
              filename: (req, file, cb) => {
                const uniqueSuffix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
                filesDelete.push(
                  uniqueSuffix + "." + file.mimetype.split("/")[1]
                );

                cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
              },
            }),
            limits: { fileSize: 50000000 },
            fileFilter(req, file, callback) {
              if (
                (file.mimetype.split("/")[0] !== "image" &&
                  file.mimetype.split("/")[0] !== "video") ||
                !checkFile
              ) {
                checkFile = false;
                callback(null, false);
              } else {
                callback(null, true);
              }
            },
          }).single("file")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.json({ status: true, result: "oversize" });
              }
            } else {
              if (checkFile) {
                
                insertGroupMedia.Run(database.connection, req.body.user, req.body.roomId, filesDelete, req, res, socketIo);
                
              } else {
                if (filesDelete.length > 0) {
                  filesDelete.forEach((e) => {
                    fs.unlink(
                      path.resolve(__dirname, `../media/${e}`),
                      (e) => {}
                    );
                  });
                }

                res.json({ status: true, result: "invalid" });
              }
            }
          });

        });

        app.get("/group/friend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const getGroupFriends: Read.GroupFriends = new Read.GroupFriends();

          getGroupFriends.Run(database.connection, req, res);
        });

        app.get("/group/search/friend", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const fethcGroupFriend: Read.SearchFriendsGroup = new Read.SearchFriendsGroup();

          fethcGroupFriend.Run(database.connection, req, res);
        });

        app.post("/remove/group/member", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const removeGroupMember: Update.RemoveGroupMember = new Update.RemoveGroupMember();

          removeGroupMember.Run(database.connection, req, res, socketIo);
        });

        app.post("/disband/group", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const disbandGroup: Update.DisbandGroup = new Update.DisbandGroup();

          disbandGroup.Run(database.connection, req, res, socketIo);
        });

        app.post("/group/add/member", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const addMember: Insert.AddGroupMember = new Insert.AddGroupMember();

          addMember.Run(database.connection, req, res, socketIo);
        });

        app.post("/exit/group", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const exitGroup: Update.ExitGroup = new Update.ExitGroup();
          
          exitGroup.Run(database.connection, req, res, socketIo);
        });

        app.post("/delete/post", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const deletePost: Insert.DeletePost = new Insert.DeletePost();

          deletePost.Run(database.connection, req, res);

        });

        app.post("/report/post", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const reportPost: Insert.ReportPost = new Insert.ReportPost();

          reportPost.Run(database.connection, req, res);
        });

        app.post("/delete/comment", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const deleteComment: Insert.DeleteComment = new Insert.DeleteComment();

          deleteComment.Run(database.connection, req, res);
        });

        app.post("/report/comment", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const reportComment: Insert.ReportComment = new Insert.ReportComment();

          reportComment.Run(database.connection, req, res);
        });

        app.get("/search/post", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const searchPosts: Read.SearchPosts = new Read.SearchPosts();

          searchPosts.Run(database.connection, req, res);
        });

        app.get("/post", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const post: Read.Post = new Read.Post();

          post.Run(database.connection, req, res);
        });

        app.get("/user", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const userInfo: Read.User = new Read.User();

          userInfo.Run(database.connection, req, res);
        });

        app.get("/upost", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const userPost: Read.UserPost = new Read.UserPost();

          userPost.Run(database.connection, req, res);
        });

        app.get("/uinfo", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const fetchUserInfo: Read.UserInfo = new Read.UserInfo();

          fetchUserInfo.Run(database.connection, req, res);
        });

        app.post("/user/setting/bg", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const userBg: Update.UpdateUserBackground = new Update.UpdateUserBackground();
          let checkFile: boolean = true;
          let filesDelete: Array<string> = [];

          multer({
            storage: diskStorage({
              destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, "../media"));
              },
              filename: (req, file, cb) => {
                const uniqueSuffix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
                filesDelete.push(
                  uniqueSuffix + "." + file.mimetype.split("/")[1]
                );

                cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
              },
            }),
            limits: { fileSize: 50000000 },
            fileFilter(req, file, callback) {
              if (
                (file.mimetype.split("/")[0] !== "image" &&
                  file.mimetype.split("/")[0] !== "video") ||
                !checkFile
              ) {
                checkFile = false;
                callback(null, false);
              } else {
                callback(null, true);
              }
            },
          }).single("bgImg")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.json({ status: true, result: "oversize" });
              }
            } else {
              if (checkFile) {
                
                userBg.Run(database.connection, req.body.user, filesDelete, req, res);
                
              } else {
                if (filesDelete.length > 0) {
                  filesDelete.forEach((e) => {
                    fs.unlink(
                      path.resolve(__dirname, `../media/${e}`),
                      (e) => {}
                    );
                  });
                }

                res.json({ status: true, result: "invalid" });
              }
            }
          });
        });

        app.post("/user/setting/pf", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const userPf: Update.UpdateUserProfile = new Update.UpdateUserProfile();
          let checkFile: boolean = true;
          let filesDelete: Array<string> = [];

          multer({
            storage: diskStorage({
              destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, "../media"));
              },
              filename: (req, file, cb) => {
                const uniqueSuffix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
                filesDelete.push(
                  uniqueSuffix + "." + file.mimetype.split("/")[1]
                );

                cb(null, uniqueSuffix + "." + file.mimetype.split("/")[1]);
              },
            }),
            limits: { fileSize: 50000000 },
            fileFilter(req, file, callback) {
              if (
                (file.mimetype.split("/")[0] !== "image" &&
                  file.mimetype.split("/")[0] !== "video") ||
                !checkFile
              ) {
                checkFile = false;
                callback(null, false);
              } else {
                callback(null, true);
              }
            },
          }).single("pfImg")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.json({ status: true, result: "oversize" });
              }
            } else {
              if (checkFile) {
                
                userPf.Run(database.connection, req.body.user, filesDelete, req, res);
                
              } else {
                if (filesDelete.length > 0) {
                  filesDelete.forEach((e) => {
                    fs.unlink(
                      path.resolve(__dirname, `../media/${e}`),
                      (e) => {}
                    );
                  });
                }

                res.json({ status: true, result: "invalid" });
              }
            }
          });

        });

        app.post("/update/user/name", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const updateUsername: Update.UpdateUserName = new Update.UpdateUserName();

          updateUsername.Run(database.connection, req, res);
        });

        app.post("/update/user/password", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const updateUserPassword: Update.UpdateUserPassword = new Update.UpdateUserPassword();

          updateUserPassword.Run(database.connection, req, res);
        });

        app.post("/hide/msg", cors(corsOptions), (req: Request, res: Response): void =>
        {
          const hideMsg: Insert.HideMessage = new Insert.HideMessage();

          hideMsg.Run(database.connection, req, res);
        });

        httpServer.listen(env.PORT, (): void => {
            console.log(`listening to port ${env.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
    

}

