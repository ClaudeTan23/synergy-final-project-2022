import mysql2, {QueryError, RowDataPacket, FieldPacket}  from "mysql2";
import { AES, enc } from "crypto-js";
import dotenv from "dotenv";
import { Response, Request } from "express";
import { PostModel } from "../database/post-model";

export namespace Insert 
{
    export class Post 
    {
        public Run(conn: mysql2.Pool, content: string | undefined, media: Array<string>, user: string, time: string, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            
            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: true, result: "invalid"});
                return;
            }

            
            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            let returnResult: boolean | undefined;

            if(jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined)
            {
                if(jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("INSERT INTO post (user_id, content, media, total_likes, total_comments, date_posted, post_status) VALUES (?, ?, ?, ? ,? ,? ,?)",
                                [jsonKey.id, (content === undefined) ? "" : content, (media.join(',').length > 0) ? media.join(',') : "none", 0, 0, time, "Active"], (err: QueryError | null, result: any, field: FieldPacket[]): void => 
                                {
                                    if(!err)
                                    {
                                        const insertId: any = result.insertId;

                                        conn.execute("SELECT * FROM post FULL JOIN user on user_id = user.id WHERE post_id = ?", [insertId], (e, r, f): void =>
                                        {
                                            if(!e)
                                            {
                                                const postData: Array<any> = JSON.parse(JSON.stringify(r));

                                                const sortPost: Array<any> = postData.map(e => 
                                                {
                                                    return {
                                                        postId: e.post_id,
                                                        userId: e.user_id,
                                                        userIcon: e.profile,
                                                        name : e.name,
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
                                                    }
                                                });

                                                res.json({ status: true, result: "ok", data: sortPost[0] });

                                            } else 
                                            {
                                                res.json({ status: true, result: "database error" });
                                            }

                                        });

                                    } else 
                                    {
                                        res.json({ status: true, result: "database error" });
                                    }
                                });

                } else 
                {
                    res.json({ status: true, result: "invalid" });
                }

            } else 
            {
                res.json({ status: true, result: "invalid" });
            }

        }
    }

    export class Comment 
    {
        public Run(conn: mysql2.Pool, user: string, postId: string, postUserId: string, content: string | undefined, time: string, media: Array<string>, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: true, result: "invalid"});
                return;
            }


            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined)
            {
                if(jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const postData: Array<PostModel.Post> = JSON.parse(JSON.stringify(r));

                            if(postData.length >= 1)
                            {
                                conn.execute("INSERT INTO comment (post_id, postUserId, commentUserId, content, media, time, comment_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                [postId, postUserId, jsonKey.id, (content === undefined || content === "") ? "" : content, (media.length > 0 ? media.join(",") : "none"), time, "Active"], (err: QueryError | null, result: any, field: FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        conn.execute("UPDATE post SET total_comments = total_comments + 1 WHERE post_id = ?", [postId], (error: QueryError | null, results: RowDataPacket[], fiedls: FieldPacket[]): void =>
                                        {
                                            if(!error)
                                            {
                                                const insertId: any = result.insertId;
                                                
                                                conn.execute("SELECT * FROM comment FULL JOIN user ON commentUserId = user.id WHERE cid = ?", [insertId], (ee, rr, ff): void =>
                                                {
                                                    if(!ee)
                                                    {
                                                        const comment: Array<any> = JSON.parse(JSON.stringify(rr));

                                                        const sortComment: any = 
                                                        {
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
                                                        }

                                                        res.json({ status: true, result: "ok", comment: sortComment, totalComments: postData[0].total_comments + 1 });

                                                    } else 
                                                    {
                                                        res.json({ status: true, result: "database error"});
                                                    }

                                                });
                                                

                                            } else 
                                            {
                                                res.json({ status: true, result: "database error"});
                                            }
                                        });

                                    } else 
                                    {
                                        res.json({ status: true, result: "database error" });
                                    }
                                });
                                
                            }

                        } else 
                        {
                            res.json({ status: true, result: "database error" });
                        }

                    });

                } else 
                {
                    res.json({ status: true, result: "invalid" });
                }

            } else 
            {
                res.json({ status: true, result: "invalid" });
            }
        }
    }

    export class AddFriend 
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, socket: any): void
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user.trim();
            const fId: string | undefined = req.body.fId;

            if(user === "" || user === undefined || fId === "" || fId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            const query: string = mysql2.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND NOT f_status IN ?", [[[jsonKey.id, fId]], [[jsonKey.id, fId]], [["friended", "blocked"]]]);

            conn.execute(query, (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
            {
                const queryResult: Array<any> = JSON.parse(JSON.stringify(result));

                if(queryResult.length === 2)
                {
                    conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId =? AND friend_id = ?", ["requesting", "pending", jsonKey.id, fId], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId =? AND friend_id = ?", ["accepting", "pending", fId, jsonKey.id], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                            {
                                if(!error)
                                {
                                    const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

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

                                } else 
                                {
                                    res.json({ success: false, result: "database error" });
                                }

                            });

                        } else {
                            res.json({ success: false, result: "database error" });
                        }
                    });

                } else if(queryResult.length === 0)
                {
                    conn.execute("INSERT INTO friends (userId, friend_id, action, f_status) VALUES (?, ?, ?, ?), (?, ?, ?, ?)", [jsonKey.id, fId, "requesting", "pending", fId, jsonKey.id, "accepting", "pending"], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

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

                        } else 
                        {
                            res.json({ success: false, result: "database error" });
                        }

                    });
                }
            });

        }
    }

    export class CreateGroupChat 
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, socket: any): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user.trim();
            const groupName: string | undefined = req.body.groupName;
            const members: Array<any> | undefined = req.body.members;

            if(user === "" || user === undefined || groupName === "" || groupName === undefined || members === undefined || members.length <= 0)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            let roomId: string;
            members.unshift(jsonKey.id.toString());

            const query: string = mysql2.format("INSERT INTO message_room (room_name, chat_adminId, chat_type, chat_status) VALUES (?, ?, ?, ?)", [groupName, jsonKey.id, "group", "Active"]);

            conn.execute(query, (err, result: any, field): void =>
            {
                if(!err)
                {
                    const memberIds: Array<any> = members.map((e) => ["none", e, result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    roomId = result.insertId;

                    const queryMember: string = mysql2.format("INSERT INTO user_message_room (um_friend_id, um_userId, um_roomId, um_status, delete_time, delete_status, um_remove_time, unseen_msg) VALUES ?", [memberIds]);

                    conn.execute(queryMember, (error, results, fields): void =>
                    {
                        if(!error)
                        {
                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)",[roomId, jsonKey.id, "none", "group created", time, "Active"], (er, re, fi): void =>
                            {
                                if(!er)
                                {
                                    const memberId: Array<string> = memberIds.map((e) => e[1]);
       
        
                                    socket.IO.to(memberId).emit("new-group-chat", { type: "group", groupName: groupName, chatId: roomId.toString(), content: "Group created", time: time, roomId: `room${roomId}`, userId: jsonKey.id.toString() });
                                    res.json({success: true});

                                } else 
                                {
                                    res.json({ success: false });
                                }
                            });

                        } else 
                        {
                            res.json({success: false});
                        }
                    });

                } else 
                {
                    res.json({ success: false });
                }

            });
     
        }
    }

    export class CreateFriendChat 
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, clientSocket: any): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user.trim();
            const friendId: string | undefined = req.body.friendId.trim();

            if(user === "" || user === undefined || friendId === "" || friendId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            let roomId: string;
            const userAndFriendId: Array<string> = [jsonKey.id.toString(), friendId];

            const query: string = mysql2.format("INSERT INTO message_room (room_name, chat_adminId, chat_type, chat_status) VALUES (?, ?, ?, ?)", ["none", "none", "friend", "Active"]);

            conn.execute(query, (err, result: any, field): void =>
            {
                if(!err)
                {
                    const memberIds: Array<any> = [];
                    memberIds.push([jsonKey.id.toString(), friendId, result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    memberIds.push([friendId, jsonKey.id.toString(), result.insertId, 'Active', 'none', 'none', 'none', 1]);
                    roomId = result.insertId;

                    const queryMember: string = mysql2.format("INSERT INTO user_message_room (um_userId, um_friend_id, um_roomId, um_status, delete_time, delete_status, um_remove_time, unseen_msg) VALUES ?", [memberIds]);

                    conn.execute(queryMember, (error, results, fields): void =>
                    {
                        if(!error)
                        {
                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

                            const insertCreateFriend: string = mysql2.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, jsonKey.id, "none", "conversation created", time, "Active"]);

                            conn.execute(insertCreateFriend, (er, re, fi): void =>
                            {
                                if(!er)
                                {
                                    const q = mysql2.format("SELECT * FROM user WHERE id IN ?", [[userAndFriendId]]);

                                    conn.execute(q, (e, r, f): void =>
                                    {
                                        if(!e)
                                        {
                                            const users: Array<any> = JSON.parse(JSON.stringify(r));

                                            const sortUsers: Array<any> = users.map((e) =>
                                            {
                                                return {
                                                    userId: e.id,
                                                    name: e.name,
                                                    profile: e.profile,
                                                    online: (e.online_status === "on") ? true : false
                                                }
                                            });
                
                                            clientSocket.IO.to(userAndFriendId).emit("new-friend-chat", { type: "friend", chatId: roomId.toString(), user: sortUsers, createdUserId: jsonKey.id.toString(), time: time, content: "Conversation created", roomId: `room${roomId}` });
                                            res.json({success: true});

                                        } else 
                                        {
                                            res.json({success: false});
        
                                        }

                                    }); 

                                } else 
                                {
                                    res.json({ success: false });
                                }

                            });

                        } else 
                        {
                            res.json({success: false});
                        }
                    });

                } else 
                {
                    res.json({ success: false });
                }

            });
        }
    }

    export class InsertMessage
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const roomId: string | undefined = req.body.rId.toString().trim();
            const msg: string | undefined    = req.body.msg.trim();

            if(user === "" || user === undefined || roomId === "" || roomId === undefined || msg === "" || msg === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            const query: string = mysql2.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?)", [[roomId, jsonKey.id, msg, "message", time, "Active"]]);


            conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status = ?", [jsonKey.id.toString(), roomId, "Active"], (ce, cr, cf): void =>
            {
                if(!ce)
                {
                    const verifyUser: Array<any> = JSON.parse(JSON.stringify(cr));

                    if(verifyUser.length === 1)
                    {
                            if(verifyUser[0].um_friend_id !== "none")
                            {
                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ?", [roomId], (ee, rr, ff): void =>
                                {
                                    if(!ee)
                                    {
                                        const userFriend: Array<any> = JSON.parse(JSON.stringify(rr));

                                        let userFriendId: Array<string> = userFriend.map(e => e.um_userId.toString())

                                        conn.execute("SELECT * FROM friends WHERE friend_id = ? AND userId = ? AND f_status = ?", [userFriendId[0], userFriendId[1], "friended"], (eee, rrr, fff): void =>
                                        {
                                            const friendedNum: Array<any> = JSON.parse(JSON.stringify(rrr));

                                            if(friendedNum.length === 1)
                                            {
                                                conn.execute(query, (e, r: any, f): void =>
                                                {
                                                    if(!e)
                                                    {
                                                        conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ?", [r.insertId], (err, re, fi): void =>
                                                        {
                                                            if(!err)
                                                            {
                                                                const members: Array<any> = JSON.parse(JSON.stringify(re));

                                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status IN (?, ?)", [roomId, "removed", "disband"], (se, sr, sf): void =>
                                                                {
                                                                    if(!se)
                                                                    {
                                                                        let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                                        membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                        membersId = membersId.map(e => e.um_userId.toString());

                                                                        const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);

                                                                        conn.execute(queryMember, (error, result, field): void =>
                                                                        {
                                                                            if(!error)
                                                                            {

                                                                                const completedMsg: any = members.map((e) => 
                                                                                {
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
                                                                                    }
                                                                                });

                                                                                clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                                res.json({ success: true });

                                                                            } else 
                                                                            {
                                                                                console.log("socket msg database error");
                                                                                res.json({ success: false });
                                                                            }
                                                                        });
                                                                        
                                                                    } else 
                                                                    {
                                                                        res.json({ success: false })
                                                                    }
                                                                });
                                                                
                                                            } else 
                                                            {
                                                                res.json({ success: false });
                                                            }

                                                        });

                                                    } else 
                                                    {
                                                        res.json({ success: false });
                                                    }
                                                });

                                            } else 
                                            {
                                                res.json({ success: "blocked" });
                                            }
                                        });

                                    } else 
                                    {
                                        res.json({ success: false });
                                    }

                                });

                            } else 
                            {
                                conn.execute(query, (e, r: any, f): void =>
                                {
                                    if(!e)
                                    {
                                        conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ?", [r.insertId], (err, re, fi): void =>
                                        {
                                            if(!err)
                                            {
                                                const members: Array<any> = JSON.parse(JSON.stringify(re));

                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status IN (?, ?)", [roomId, "removed", "disband"], (se, sr, sf): void =>
                                                {
                                                    if(!se)
                                                    {
                                                        let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                        membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                        membersId = membersId.map(e => e.um_userId.toString());

                                                        const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);

                                                        conn.execute(queryMember, (error, result, field): void =>
                                                        {
                                                            if(!error)
                                                            {

                                                                const completedMsg: any = members.map((e) => 
                                                                {
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
                                                                    }
                                                                });

                                                                clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                res.json({ success: true });

                                                            } else 
                                                            {
                                                                console.log("socket msg database error");
                                                                res.json({ success: false });
                                                            }
                                                        });
                                                        
                                                    } else 
                                                    {
                                                        res.json({ success: false })
                                                    }
                                                });
                                                
                                            } else 
                                            {
                                                res.json({ success: false });
                                            }

                                        });

                                    } else 
                                    {
                                        res.json({ success: false });
                                    }
                                });
                            }

                        

                    } else 
                    {
                        res.json({ success: false });
                    }

                } else 
                {
                    res.json({ success: false });
                }

            });

        }
    }

    export class DeleteMsg
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const msgId: string | undefined = req.body.msgId.toString().trim();
            const roomId: string | undefined = req.body.roomId.toString().trim();

            if(user === "" || user === undefined || msgId === "" || msgId === undefined || roomId === "" || roomId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            conn.execute("INSERT INTO delete_message (d_user_id, d_message_id, d_room_id) VALUES (?, ?, ?)", [jsonKey.id.toString(), msgId.toString(), roomId], (e, r, f): void =>
            {
                if(!e)
                {
                    clientSocket.IO.to(`room${roomId}`).emit("recall-message", { roomId: roomId, messageId: msgId });
                    res.json({ success: true });

                } else 
                {
                    res.json({ success: false });
                }

            });

        }
    }

    export class InsertGroupMedia
    {
        public Run(conn: mysql2.Pool, user: string, roomId: string, file: Array<string>, req: Request, res: Response, clientSocket: any): void 
        {
            dotenv.config();
            const key: any = process.env;
            
            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: true, result: "invalid"});
                return;
            }

            
            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            let returnResult: boolean | undefined;

            if(jsonKey.id !== "" && jsonKey.id !== undefined && jsonKey.clientKey !== "" && jsonKey.clientKey !== undefined)
            {
                if(jsonKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
                    const mediaQuery: string = mysql2.format("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)",
                                                             [roomId.toString(), jsonKey.id.toString(), (file.length > 0 ? file.join(",") : "none"), "media", time, "Active"]);

                    conn.execute(mediaQuery, (e, r: any, f): void =>
                    {
                        if(!e)
                        {
                            const insertId: any = r.insertId;

                            conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field): void =>
                            {
                                if(!err)
                                {
                                    const msg: Array<any> = JSON.parse(JSON.stringify(result));

                                    conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ?", [roomId.toString(), "Active"], (ee, rr, ff): void =>
                                    {
                                        if(!ee)
                                        {
                                            let members: Array<any> = JSON.parse(JSON.stringify(rr));

                                            members = members.map(e => e.um_userId.toString());
                                            const queryMembers: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, members.length >= 1 ? [members] : [[""]], "Active"]);

                                            conn.execute(queryMembers, (eee, rrr, fff): void =>
                                            {
                                                if(!eee)
                                                {
                                                    const completedMsg: any = msg.map(
                                                    (e) => {
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
                                                    }
                                                    );

                                                    clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);

                                                    res.json({success: true })

                                                } else 
                                                {
                                                    res.json({ success: false });
                                                }

                                            });

                                            
                                        } else 
                                        {
                                            res.json({ success: false });
                                        }
                                    });
                                    
                                } else 
                                {
                                    res.json({ success: false });
                                    console.log("database error select socket media");
                                }

                            });

                        } else 
                        {
                            res.json({ success: false });
                            console.log("database error insert socket media");
                        }

                    });

                } else 
                {
                    res.json({ success: false });
                }

            } else 
            {
                res.json({ success: false });
            }
        }
    }

    export class AddGroupMember
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const memberId: string | undefined = req.body.memberId.toString().trim();
            const roomId: string | undefined = req.body.roomId.toString().trim();

            if(user === "" || user === undefined || memberId === "" || memberId === undefined || roomId === "" || roomId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

            conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_adminId = ? AND chat_status = ?", [roomId, jsonKey.id.toString(), "Active"], (err, re, fi): void =>
            {
                if(!err)
                {
                    const adminNum: Array<any> =  JSON.parse(JSON.stringify(re));
                    
                    if(adminNum.length === 1)
                    {
                        conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status IN (?, ?)", [memberId, roomId, "removed", "exit group"], (e, r, f): void =>
                        {
                            if(!e)
                            {
                                const memberStatus: Array<any> = JSON.parse(JSON.stringify(r));

                                if(memberStatus.length === 1)
                                {
                                    conn.execute("UPDATE user_message_room SET um_status = ? WHERE um_roomId = ? AND um_userId = ?", ["Active", roomId, memberId], (ee, rr, ff): void =>
                                    {
                                        if(!ee)
                                        {
                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "member join", time, "Active"], (eee, rrr: any, fff): void =>
                                            {
                                                if(!eee)
                                                {
                                                    const insertId: any = rrr.insertId;

                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field): void =>
                                                    {
                                                        if(!err)
                                                        {
                                                            const msg: Array<any> = JSON.parse(JSON.stringify(result));

                                                            const completedMsg: any = msg.map(
                                                            (e) => {
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
                                                            }
                                                            );

                                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf): void =>
                                                            {
                                                                if(!se)
                                                                {
                                                                    let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                    membersId = membersId.map(e => e.um_userId.toString());

                                                                    const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);

                                                                    conn.execute(queryMember, (error, result, field): void =>
                                                                    {
                                                                        if(!error)
                                                                        {

                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                            clientSocket.IO.to(memberId).emit("add-group-new-member", { roomId: roomId });

                                                                            res.json({success: true })

                                                                        } else 
                                                                        {
                                                                            console.log("socket msg database error");
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                            
                                                        } else 
                                                        {
                                                            res.json({ success: false });
                                                            console.log("database error select socket media");
                                                        }

                                                    });


                                                } else 
                                                {
                                                    res.json({ success: false });
                                                }

                                            });

                                        } else 
                                        {
                                            res.json({ success: false });
                                        }

                                    });

                                } else 
                                {
                                    conn.execute("INSERT INTO user_message_room (um_friend_id, um_userId, um_roomId, um_status, delete_time, delete_status, um_remove_time) VALUES (?, ?, ?, ?, ?, ?, ?)", ["none", memberId, roomId, "Active", "none", "none", "none"], (ee, rr, ff): void =>
                                    {
                                        if(!ee)
                                        {
                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "member join", time, "Active"], (eee, rrr: any, fff): void =>
                                            {
                                                if(!eee)
                                                {
                                                    const insertId: any = rrr.insertId;

                                                    conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (err, result, field): void =>
                                                    {
                                                        if(!err)
                                                        {
                                                            const msg: Array<any> = JSON.parse(JSON.stringify(result));

                                                            const completedMsg: any = msg.map(
                                                            (e) => {
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
                                                            }
                                                            );

                                                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf): void =>
                                                            {
                                                                if(!se)
                                                                {
                                                                    let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                                    membersId = membersId.filter(e => e.um_userId.toString() !== jsonKey.id.toString());
                                                                    membersId = membersId.map(e => e.um_userId.toString());

                                                                    const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);

                                                                    conn.execute(queryMember, (error, result, field): void =>
                                                                    {
                                                                        if(!error)
                                                                        {

                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);
                                                                            clientSocket.IO.to(memberId).emit("add-group-new-member", { roomId: roomId });

                                                                            res.json({success: true })

                                                                        } else 
                                                                        {
                                                                            console.log("socket msg database error");
                                                                            res.json({ success: false });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                            
                                                        } else 
                                                        {
                                                            res.json({ success: false });
                                                            console.log("database error select socket media");
                                                        }

                                                    });


                                                } else 
                                                {
                                                    res.json({ success: false });
                                                }

                                            });

                                        } else 
                                        {
                                            res.json({ success: false });
                                        }

                                    });
                                    
                                }

                            } else 
                            {
                                res.json({ success: false });
                            }

                        });

                    } else 
                    {
                        res.json({ success: false });
                    }

                } else 
                {
                    res.json({ success: false });
                }

            });
        }
    }

    export class DeletePost
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const postId: string | undefined = req.body.postId.toString().trim();

            if(user === "" || user === undefined || postId === "" || postId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

            conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (e, r, f): void =>
            {
                if(!e)
                {
                    const postInfo: Array<any> = JSON.parse(JSON.stringify(r));

                    if(postInfo[0].user_id.toString() === jsonKey.id.toString())
                    {
                        conn.execute("UPDATE post SET post_status = ? WHERE post_id = ?", ["deleted", postId], (ee, rr, ff): void =>
                        {
                            if(!ee)
                            {
                                res.json({ success: true, result: "post deleted" });
                            } else 
                            {
                                res.json({ success: false });
                            }

                        });

                    } else 
                    {
                        conn.execute("INSERT INTO delete_post (userId, dp_postId) VALUES (?, ?)", [jsonKey.id, postId], (err, result, field): void =>
                        {
                            if(!err)
                            {
                                res.json({ success: true, result: "user post deleted"});

                            } else 
                            {
                                res.json({ success: false });
                            }

                        });
                    }

                } else 
                {
                    res.json({ success: false });
                }
            });
        }
    }

    export class ReportPost
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const postId: string | undefined = req.body.postId.toString().trim();

            if(user === "" || user === undefined || postId === "" || postId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            
            conn.execute("INSERT INTO report_post (r_post_id, r_user_id) VALUES (?, ?)", [postId, jsonKey.id], (e, r, f): void =>
            {
                if(!e)
                {
                    res.json({ success: true });

                } else 
                {
                    res.json({ success: false });
                }

            });
        }
    }

    export class DeleteComment 
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const commentId: string | undefined = req.body.commentId.toString().trim();
            const postId: string | undefined = req.body.postId.toString().trim();

            if(user === "" || user === undefined || commentId === "" || commentId === undefined || postId === "" || postId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

            conn.execute("SELECT * FROM comment WHERE cid = ? AND comment_status = ?", [commentId, "Active"], (e, r, f): void =>
            {
                if(!e)
                {
                    const commentInfo: Array<any> = JSON.parse(JSON.stringify(r));

                    if(commentInfo[0].commentUserId.toString() === jsonKey.id.toString())
                    {
                        conn.execute("UPDATE comment SET comment_status = ? WHERE cid = ?", ["deleted", commentId], (ee, rr, ff): void =>
                        {
                            if(!ee)
                            {
                                conn.execute("UPDATE post SET total_comments = total_comments - 1 WHERE post_id = ? AND post_status = ?", [postId, "Active"], (error, results, fields): void =>
                                {
                                    if(!error)
                                    {
                                        res.json({ success: true, result: "comment deleted" });

                                    } else 
                                    {
                                        res.json({ success: false });
                                    }

                                });

                            } else 
                            {
                                res.json({ success: false });
                            }

                        });

                    } else 
                    {
                        conn.execute("INSERT INTO delete_comment (dc_user_id, dc_commentId) VALUES (?, ?)", [jsonKey.id, commentId], (err, result, field): void =>
                        {
                            if(!err)
                            {
                                res.json({ success: true, result: "user comment deleted"});

                            } else 
                            {
                                res.json({ success: false });
                            }

                        });
                    }

                } else 
                {
                    res.json({ success: false });
                }
            });
        }
    }

    export class ReportComment
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const commentId: string | undefined = req.body.commentId.toString().trim();

            if(user === "" || user === undefined || commentId === "" || commentId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            
            conn.execute("INSERT INTO report_comment (rc_comment_id, rc_user_id) VALUES (?, ?)", [commentId, jsonKey.id], (e, r, f): void =>
            {
                if(!e)
                {
                    res.json({ success: true });

                } else 
                {
                    res.json({ success: false });
                }

            });
        }
    }

    export class HideMessage
    {
        public Run(conn: mysql2.Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined   = req.body.user.trim();
            const msgId: string | undefined = req.body.msgId.toString().trim();
            const roomId: string | undefined = req.body.roomId.toString().trim();

            if(user === "" || user === undefined || msgId === "" || msgId === undefined || roomId === "" || roomId === undefined)
            {
                return;
            }

            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ success: false, result: "invalid"});
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const jsonKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            conn.execute("INSERT INTO hide_message (h_userId, h_messageId, h_roomId) VALUES (?, ?, ?)", [jsonKey.id.toString(), msgId.toString(), roomId], (e, r, f): void =>
            {
                if(!e)
                {
                    res.json({ success: true });

                } else 
                {
                    res.json({ success: false });
                }

            });
        }
    }
}