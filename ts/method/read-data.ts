import express, { Request, Response } from "express";
import mysql2, { Pool, QueryError, RowDataPacket, FieldPacket } from "mysql2";
import { AES, enc } from "crypto-js";
import * as dotenv from "dotenv";

export namespace Read
{
    export class Comment 
    {
        public Run(conn: Pool, postId: any, commentNow: any, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const sortQuery: Array<any> = [];

                    conn.execute("SELECT * FROM comment FULL JOIN user AS b ON commentUserId = b.id WHERE post_id = ? AND comment_status = ? ORDER BY cId DESC limit ?, 5", [postId, "Active", commentNow], (err: QueryError | null , result: RowDataPacket[], fields: FieldPacket[]) => {

                        if(!err)
                        {
                            conn.execute("SELECT * FROM delete_comment WHERE dc_user_id = ?", [userKey.id], (e, r, f): void =>
                            {
                                if(!e)
                                {
                                    const deleteComments: Array<any> = JSON.parse(JSON.stringify(r));
                                    const deleteCommentId: Array<string> = deleteComments.map(e => e.dc_commentId.toString());

                                    conn.execute("SELECT * FROM report_comment WHERE rc_user_id = ?", [userKey.id], (ee, rr, ff): void =>
                                    {
                                        if(!ee)
                                        {
                                            const reportComments: Array<any> = JSON.parse(JSON.stringify(rr));
                                            const reportCommentId: Array<string> = reportComments.map(e => e.rc_comment_id.toString());

                                            const query: Array<any> = JSON.parse(JSON.stringify(result));

                                            query.forEach((e: any) => 
                                            {
                                                sortQuery.push({ commentId: e.cid, postId: e.post_id, postUserId: e.postUserId, commentUserId: e.commentUserId, content: e.content, media: e.media.split(","), dateJoin: e.date_join,
                                                                time: e.time, name: e.name, commentUserIcon: e.profile, username: e.username, deleted: deleteCommentId.includes(e.cid.toString()), reported: reportCommentId.includes(e.cid.toString()), control: false});
                                            });

                                            res.json({ status: "success", comments: sortQuery });

                                        } else 
                                        {
                                            res.json({ status: "database error" });
                                        }

                                    });

                                } else 
                                {
                                    res.json({ status: "database error" });
                                }

                            });

                        } else
                        {
                            res.json({ status: "database error" });
                        }

                        
                    });

                } else 
                {
                    res.json({ status: "invalid" });
                }

            } else 
            {
                res.json({ status: "invalid" });
            }

        }
    }

    export class Friends
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {

                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const totalFriends: Array<any> = JSON.parse(JSON.stringify(r));

                            conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                if(!err)
                                {
                                    const friendData = JSON.parse(JSON.stringify(result));
                                    const data: Array<any> = [];

                                    if(friendData.length >= 1)
                                    {
                                        friendData.forEach((friend: any): void =>
                                        {
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
                                            })
                                        });

                                        res.json({status: "success", friends: data, totalFriends: totalFriends.length});

                                    } else 
                                    {
                                        res.json({status: "success", friends: data, totalFriends: totalFriends.length});
                                    }

                                } else 
                                {
                                    res.json({ status: "database error" });
                                }
                            });

                        } else 
                        {
                            res.json({ status: "database error" });
                        }
                    });

                } else 
                {
                    res.json({ status: "invalid" });
                }

            } else 
            {
                res.json({ status: "invalid" });
            }
            
        }
    }

    export class SearchFriends
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            // SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE "a%" AND user.status = "Active" AND f_status = "friended"
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ?", [`${req.query.friend}%`, "friended", userKey.id], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const friendData = JSON.parse(JSON.stringify(result));
                            const totalFriend: Array<any> = [];

                                if(friendData.length > 0)
                                {
                                    friendData.forEach((friend: any): void => 
                                    {
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

                                } else 
                                {
                                    res.json({ status: "success", friends: totalFriend });
                                }
                                
                            
                        } else 
                        {
                            res.json({ status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ status: "invalid"});
                }

            } else 
            {
                res.json({ status: "invalid" });
            }

        }
    }

    export class FindNewFriend
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user WHERE name LIKE ? AND NOT id = ?", [`${req.query.friend}%`, userKey.id], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const userData = JSON.parse(JSON.stringify(result));
                            
                            if(userData.length > 0)
                            {
                                const userId = userData.map((e: any) => { return e.id });
                                const sqlQuery: string = mysql2.format(`SELECT friend_id FROM friends WHERE friend_id IN ? AND f_status in ? AND userId = ?`, [[userId], [["friended", "blocked", "pending"]], userKey.id]);

                                conn.execute(sqlQuery , [], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                {
                                    if(!error)
                                    {
                                        const newFriendData = JSON.parse(JSON.stringify(results));
                                               
                                        const existedId: Array<any> = newFriendData.map((e: any) => { return e.friend_id });
                                        const existedNewFriend: Array<any> = userData.filter((e: any) => { return  !existedId.includes(e.id.toString())})
                                        const result: Array<any> = [];

                                        existedNewFriend.forEach((friend: any): void => 
                                        {
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

                                    } else 
                                    {
                                        res.json({ status: "database error" });
                                    }

                                });

                            } else 
                            {
                                res.json({ status: "success", friends: [] });
                            }
                                
                            
                        } else 
                        {
                            res.json({ status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ status: "invalid"});
                }

            } else 
            {
                res.json({ status: "invalid" });
            }
        }
    }

    export class BlockedUsers 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND action = ?", [userKey.id, "blocked", "blocking"], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const totalBlocked: Array<any> = JSON.parse(JSON.stringify(r));

                            conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND action = ?", [userKey.id, "blocked", "blocking"], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                if(!err)
                                {
                                    const blockedUsers = JSON.parse(JSON.stringify(result));
                                    const data: Array<any> = [];

                                    if(blockedUsers.length >= 1)
                                    {
                                        blockedUsers.forEach((friend: any): void =>
                                        {
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
                                            })
                                        });

                                        res.json({status: "success", users: data, totalBlocked: totalBlocked.length});

                                    } else 
                                    {
                                        res.json({status: "success", users: data, totalBlocked: totalBlocked.length});
                                    }

                                } else 
                                {
                                    res.json({ status: "database error" });
                                }
                            });
                            
                        } else 
                        {
                            res.json({ status: "database error" });
                        }
                    }) ;

                } else 
                {
                    res.json({ status: "invalid" });
                }

            } else 
            {
                res.json({ status: "invalid" });
            }
        }
    }

    export class findBlockedUser
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ?", [`${req.query.user}%`, "blocked", userKey.id], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const userData = JSON.parse(JSON.stringify(result));
                            const data: Array<any> = [];

                                if(userData.length > 0)
                                {
                                    userData.forEach((friend: any): void => 
                                    {
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

                                } else 
                                {
                                    res.json({ status: "success", users: data });
                                }
                                                         
                        } else 
                        {
                            res.json({ status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ status: "invalid"});
                }

            } else 
            {
                res.json({ status: "invalid" });
            }
        }
    }

    export class FriendRequest
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            
            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "accepting", userKey.id], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const totalFriendRequest: Array<any> = JSON.parse(JSON.stringify(r));

                            conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "accepting", userKey.id], (error: QueryError | null, results: RowDataPacket[], fiedls: FieldPacket[]): void =>
                            {
                                const requestFriends: Array<any> = JSON.parse(JSON.stringify(results));
                                let data: Array<any> =[];

                                if(!error)
                                {
                                    if(requestFriends.length > 0)
                                    {
                                        data = requestFriends.map((e: any): any =>
                                                {
                                                    return  {
                                                                fId: e.fId,
                                                                userId: e.id,
                                                                action: e.action,
                                                                username: e.username,
                                                                name: e.name,
                                                                profile: e.profile,
                                                                background: e.background,
                                                                dataJoin: e.data_join
                                                            }
                                                });

                                        res.json({ success: true, data: data, totalFriendRequest: totalFriendRequest.length });

                                    } else 
                                    {
                                        res.json({ success: true, data: [], totalFriendRequest: totalFriendRequest.length });
                                    }

                                } else 
                                {
                                    res.json({ success: false, result: "database error" });
                                }

                            });

                        } else 
                        {
                            res.json({ success: false, result: "database error" });
                        }
                    });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }

        }
    }

    export class SentRequest
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            
            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "requesting", userKey.id], (e:QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const totalSentRequests: Array<any> = JSON.parse(JSON.stringify(r));

                            conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ?", ["pending", "requesting", userKey.id], (error: QueryError | null, results: RowDataPacket[], fiedls: FieldPacket[]): void =>
                            {
                                const requestFriends: Array<any> = JSON.parse(JSON.stringify(results));
                                let data: Array<any> =[];

                                if(!error)
                                {
                                    if(requestFriends.length > 0)
                                    {
                                        data = requestFriends.map((e: any): any =>
                                                {
                                                    return  {
                                                                fId: e.fId,
                                                                userId: e.id,
                                                                action: e.action,
                                                                username: e.username,
                                                                name: e.name,
                                                                profile: e.profile,
                                                                background: e.background,
                                                                dataJoin: e.data_join
                                                            }
                                                });

                                        res.json({ success: true, data: data, totalSentRequests: totalSentRequests.length });

                                    } else 
                                    {
                                        res.json({ success: true, data: [], totalSentRequests: totalSentRequests.length });
                                    }

                                } else 
                                {
                                    res.json({ success: false, result: "database error" });
                                }

                            });
                            
                        } else 
                        {
                            res.json({ success: false, result: "database error" });
                        }
                    });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }
        }
    }

    export class findFriendRequest 
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ? AND user.name LIKE ?", ["pending", "accepting", userKey.id, `${req.query.user}%`], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const userData = JSON.parse(JSON.stringify(result));
                            let data: Array<any> = [];

                                if(userData.length > 0)
                                {
                                    data = userData.map((e: any) => 
                                            {
                                                return {
                                                  fId: e.fId,
                                                  userId: e.id,
                                                  action: e.action,
                                                  username: e.username,
                                                  name: e.name,
                                                  profile: e.profile,
                                                  background: e.background,
                                                  dataJoin: e.data_join,
                                                }
                                            });

                                    res.json({ success: true, users: data });

                                } else 
                                {
                                    res.json({ success: true, users: data });
                                }
                                                         
                        } else 
                        {
                            res.json({ success: false, status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ success: false, status: "invalid"});
                }

            } else 
            {
                res.json({ success: false, status: "invalid" });
            }
        }
    }

    export class findSentRequest
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ success: false, result : "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.user !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM `friends` FULL JOIN user ON friend_id = user.id WHERE f_status = ? AND action = ? AND userId = ? AND user.name LIKE ?", ["pending", "requesting", userKey.id, `${req.query.user}%`], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const userData = JSON.parse(JSON.stringify(result));
                            let data: Array<any> = [];

                                if(userData.length > 0)
                                {
                                    data = userData.map((e: any) => 
                                            {
                                                return {
                                                  fId: e.fId,
                                                  userId: e.id,
                                                  action: e.action,
                                                  username: e.username,
                                                  name: e.name,
                                                  profile: e.profile,
                                                  background: e.background,
                                                  dataJoin: e.data_join,
                                                }
                                            });

                                    res.json({ success: true, users: data });

                                } else 
                                {
                                    res.json({ success: true, users: data });
                                }
                                                         
                        } else 
                        {
                            res.json({ success: false, status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ success: false, status: "invalid"});
                }

            } else 
            {
                res.json({ success: false, status: "invalid" });
            }
        }
    }

    export class FriendNotice 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const query: string = mysql2.format("SELECT * FROM notification FULL JOIN user ON request_userId = user.id WHERE type in ? AND receive_userId = ? AND n_status = ? AND seen = ? ORDER BY n_id DESC",
                                                        [[["friend-request", "sent-request"]], userKey.id, "Active", "false"]);
                                                   

                    conn.execute(query, (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const data: Array<any> = JSON.parse(JSON.stringify(r));

                            data.map((notice: any): any =>
                            {
                                return {
                                    fId: notice.id,
                                    username: notice.username,
                                    name: notice.name,
                                    profile: notice.profile,
                                    background: notice.background,
                                    dateJoin: notice.date_join,
                                    noticeTime: notice.n_time
                                    }
                            });

                            res.json({ success: true, data: data });

                        } else 
                        {
                            res.json({ success: false, result: "database error" });
                        }

                    });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }
        }
    }

    export class FetchPosts
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const postNum: number = Number(req.query.n);

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postNum !== undefined && !isNaN(postNum))
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT friend_id FROM friends WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const friends: Array<any> = JSON.parse(JSON.stringify(r));

                            const sortFriend: Array<any> = friends.map((e: any): any => { return e.friend_id });
                            sortFriend.push(userKey.id);

                            
                                const query: string = mysql2.format("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE user_id IN ? AND post_status = ? ORDER BY post_id DESC LIMIT ?, ?",
                                                                    [[sortFriend], "Active", postNum, 5]);

 
                                conn.execute(query, (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        const searchLike: Array<any> = JSON.parse(JSON.stringify(result));
                                        const totalPostId: Array<any> = searchLike.map((e: any): any => e.post_id);

                                        const likedQuery: string = mysql2.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);

                                        if(searchLike.length !== 0)
                                        {
                                            conn.execute(likedQuery, (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                            {
                                                if(!error)
                                                {
                                                    conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df): void =>
                                                    {
                                                        if(!de)
                                                        {
                                                            conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf): void =>
                                                            {
                                                                if(!re)
                                                                {
                                                                    const reportPost: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                    const reportPostId: Array<string> = reportPost.map(e => e.r_post_id.toString());

                                                                    const deletePost: Array<any> = JSON.parse(JSON.stringify(dr));
                                                                    const deletePostId: Array<string> = deletePost.map(e => e.dp_postId.toString());

                                                                    const likeResult: Array<any> = JSON.parse(JSON.stringify(results));
                                                                    const sortLikeResult: Array<any> = likeResult.map((e: any): any => e.post_id);

                                                                    const data: Array<any> = JSON.parse(JSON.stringify(result));
                                                                    let sortData: Array<any> = [];

                                                                    sortData = data.map((e: any): any =>
                                                                                {
                                                                                    return  {
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
                                                                                                liked: sortLikeResult.includes(e.post_id.toString()),
                                                                                                deleted: deletePostId.includes(e.post_id.toString()),
                                                                                                reported: reportPostId.includes(e.post_id.toString()),
                                                                                                dateJoin: e.date_join
                                                                                            }
                                                                                });

                                                                    res.json({ success: true, data: sortData });


                                                                } else 
                                                                {
                                                                    res.json({ success: true, result: "database error" });
                                                                }

                                                            });

                                                        } else 
                                                        {
                                                            res.json({ success: true, result: "database error" });
                                                        }
                                                        

                                                    });

                                                } else 
                                                {
                                                    res.json({ success: true, result: "database error" });
                                                }

                                            });

                                        } else 
                                        {
                                            const data: Array<any> = JSON.parse(JSON.stringify(result));
                                            let sortData: Array<any> = [];

                                            sortData = data.map((e: any): any =>
                                                        {
                                                            return  {
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
                                                                        dateJoin: e.date_join
                                                                    }
                                                        });

                                            res.json({ success: true, data: sortData });

                                        }

                                    } else 
                                    {
                                        res.json({ success: false, result: "database error" });
                                    }

                                });

                            
                        } else 
                        {
                            res.json({ success: false, result: "database error" });
                        }

                    });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }
        }
    }

    export class FetchFriendChat
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const postNum: number = Number(req.query.n);
            const searchQuery: any = req.query.s;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && searchQuery !== "" && searchQuery !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    // conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND user.status = ? AND f_status = ? AND user.name LIKE ? LIMIT ?, ? ", [userKey.id, "Active", "friended", `${searchQuery}%`, postNum, 5], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND user.name LIKE ?", [userKey.id, "friended", `${searchQuery}%`], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const data: Array<any> = JSON.parse(JSON.stringify(r));

                            const sortData: Array<any> = data.map((e: any): any => 
                            {
                                return {
                                  userId: e.friend_id,
                                  name: e.name,
                                  profile: e.profile,
                                };
                            })

                            res.json(sortData);

                        } else 
                        {
                            res.json({ status: "database error" });
                        }
                    });
                }
            }
        }
    }

    export class FetchNonExistFriendChat
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const postNum: number = Number(req.query.n);
            const searchQuery: any = req.query.s;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && searchQuery !== "" && searchQuery !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    // conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND user.status = ? AND f_status = ? AND user.name LIKE ? LIMIT ?, ? ", [userKey.id, "Active", "friended", `${searchQuery}%`, postNum, 5], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? AND user.name LIKE ?", [userKey.id, "friended", `${searchQuery}%`], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const data: Array<any> = JSON.parse(JSON.stringify(r));

                            const sortData: Array<any> = data.map((e: any): any => 
                            {
                                return {
                                  userId: e.friend_id,
                                  name: e.name,
                                  profile: e.profile,
                                };
                            })

                            if(data.length <= 0)
                            {
                                res.json([]);
                                return;
                            }

                            const friendId: Array<any> = data.map(e => e.friend_id);
                            const query: string = mysql2.format("SELECT * FROM user_message_room FULL JOIN message_room ON um_roomId = message_room.chat_id WHERE message_room.chat_type = ? AND chat_status = ? AND um_status = ? AND um_userId IN ? AND um_friend_id = ?", ["friend", "Active", "Active", [friendId], userKey.id.toString()]);
                            
                            conn.execute(query, (err, result, field): void =>
                            {
                                if(!err)
                                {
                                    let sortArray: Array<any> = JSON.parse(JSON.stringify(result));

                                    sortArray = sortArray.map((e) => e.um_userId);

                                    const sortResult: Array<any> = sortData.filter((e) => !sortArray.includes(e.userId));

                                    res.send(sortResult);

                                } else 
                                {
                                    res.json({ status: "database error" });
                                }
                            });

                        } else 
                        {
                            res.json({ status: "database error" });
                        }
                    });
                }
            }
        }
    }

    export class FetchChatList
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user_message_room FULL JOIN message_room ON message_room.chat_id = um_roomId WHERE um_userId = ? AND NOT delete_status = ?", [userKey.id, "delete"], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const data: Array<any> = JSON.parse(JSON.stringify(r));
                            const friendChat: Array<any> = data.filter((e) => e.um_friend_id !== "none");
                            const groupChat : Array<any> = data.filter((e) => e.um_friend_id === "none");
                            let query: string;

                            if(data.length <= 0)
                            {
                                res.json([]);
                                return;
                            }

                            if(friendChat.length > 0)
                            {
                                query = mysql2.format("SELECT name, profile, online_status, id FROM user WHERE id IN ?", [[friendChat.map((e) => e.um_friend_id)]]);

                            } else 
                            {
                                query = mysql2.format("SELECT name, profile, online_status, id FROM user WHERE id = ?", [0]);
                            }

                            conn.execute(query, (er, re, fi): void =>
                            {
                                if(!er)
                                {
                                    const nData: Array<any> = JSON.parse(JSON.stringify(re));
                                    const deleteMsgs: string = mysql2.format("SELECT * FROM delete_message WHERE d_room_id IN ?", [[data.map(e => e.um_roomId.toString())]]);

                                    conn.execute(deleteMsgs, (ea, ra, fa): void =>
                                    {
                                        if(!ea)
                                        {
                                            let messageId: string; 
                                            const deleteNum: Array<any> = JSON.parse(JSON.stringify(ra));

                                            // if(deleteNum.length > 0)
                                            // {
                                            //     messageId = 
                                            //     mysql2.format("SELECT max(message_id) as maxId, m_room_id FROM message WHERE m_room_id IN ? AND NOT message_id IN ? GROUP BY m_room_id", 
                                            //                 [[data.map((e) => e.um_roomId)], [deleteNum.map(e => e.d_message_id.toString())]]);
                                            // } else 
                                            // {
                                                messageId = mysql2.format("SELECT max(message_id) as maxId, m_room_id FROM message WHERE m_room_id IN ? GROUP BY m_room_id", [[data.map((e) => e.um_roomId)]]);
                                            // }

                                            const removeQuery: string = mysql2.format("SELECT * FROM user_message_room WHERE um_roomId IN ? AND um_userId = ? AND um_status IN (?, ?)", [[data.map((e) => e.um_roomId)], userKey.id, "removed", "exit group"]);

                                            conn.execute(removeQuery, (removeErr, removeR, removeF): void =>
                                            {
                                                if(!removeErr)
                                                {
                                                    const removeMessage: Array<any> = JSON.parse(JSON.stringify(removeR));
                                                    const removeRoomId: Array<string> = removeMessage.map(e => e.um_roomId); 

                                                    conn.execute(messageId, (error, result, fiedls): void =>
                                                    {
                                                        if(!error)
                                                        {
                                                            let mData: Array<any> = JSON.parse(JSON.stringify(result));

                                                            const tt = mData.map(e => 
                                                                {
                                                                    if(removeRoomId.includes(e.m_room_id))
                                                                    {
                                                                        e.maxId = removeMessage[removeRoomId.indexOf(e.m_room_id.toString())].um_remove_time;
                                                                        return e;
                                                    
                                                                    } else 
                                                                    {
                                                                        return e;
                                                                    }

                                                                });

                                                                // console.log(tt);

                                                            const messageQuery: string = mysql2.format("SELECT * FROM message WHERE message_id IN ? AND message_status = ?", [[tt.map((e) => e.maxId)], "Active"]);

                                                            conn.execute(messageQuery, (errors, results, fields): void =>
                                                            {
                                                                if(!errors)
                                                                {
                                                                    const messageData: Array<any> = JSON.parse(JSON.stringify(results));

                                                                    // conn.execute("SELECT d_message_id as dId FROM delete_message WHERE d_message_id IN ?", [[messageData.map(e => e.message_id)]]);
                                                                    // console.log(mysql2.format("SELECT d_message_id as dId FROM delete_message WHERE d_message_id IN ?", [[messageData.map(e => e.message_id.toString())]]));
                                                                    let completedData: Array<any> = [];


                                                                    const sortDatas: Array<any> = data.map((e) => 
                                                                    {
                                                                        const joinData: Array<any> = nData.filter((a) => a.id.toString() === e.um_friend_id.toString());

                                                                        if(joinData.length !== 0)
                                                                        {
                                                                            e.friendInfo = joinData;
                                                                            return e;

                                                                        } else 
                                                                        {
                                                                            return e;
                                                                        }
                                                                    });

                                                                    const SortData: Array<any> = sortDatas.map((e) => 
                                                                    {
                                                                        const maxMsgId: Array<any> = tt.filter((a) => a.m_room_id.toString() === e.um_roomId.toString());

                                                                        e.max = maxMsgId[0].maxId.toString();
                                                                        return e;
                                                                    });


                                                                    const Data: Array<any> = SortData.map((e) => 
                                                                    {
                                                                        const msg: Array<any> = messageData.filter((a) => e.um_roomId.toString() === a.m_room_id.toString());

                                                                        e.msg = msg;
                                                                        return e;

                                                                    });

                                                                    const pArray: Array<any> = Data;
                                                                    const idArray: Array<any> = [];

                                                                    Data.forEach(e => 
                                                                    {
                                                                        let maxID: string = "";
                                                                        let sortIndex: number = 0;
                                                                        
                                                                        const test = pArray.filter((e) => !idArray.includes(e.max.toString()));

                                                                        test.map((a, index: number, array) => 
                                                                        {
                        
                                                                            if(Number(a.max) > Number(maxID))
                                                                            {
                                                                                maxID = a.max;
                                                                                sortIndex = index;
                        
                                                                            }

                                                                        });

                                                                        idArray.push(maxID.toString());
                                                                        completedData.push(test[sortIndex]);

                                                                    });

                                                                    const recalledData = deleteNum.map(e => e.d_message_id);
                                                                    // console.log(recalledData);
                                                                        completedData = completedData.map(e => 
                                                                        {
                                                                            if(recalledData.includes(e.max))
                                                                            {
                                                                                e.msg[0].message_content = "User recalled message";
                                                                                // console.log(e.msg[0]);
                                                                                return e

                                                                            } else 
                                                                            {
                                                                                return e
                                                                            }
                                                                        });

                                                                        const hidequery: string = mysql2.format("SELECT * FROM hide_message WHERE h_roomId IN ? AND h_userId = ?", [[data.map(e => e.um_roomId.toString())], userKey.id]);

                                                                        conn.execute(hidequery, (he, hr, hf): void =>
                                                                        {
                                                                            if(!he)
                                                                            {
                                                                                const hideMessage: Array<any> = JSON.parse(JSON.stringify(hr));
                                                                                const hideMsg: Array<any> = hideMessage.map(e => e.h_messageId.toString());

                                                                                completedData = completedData.map(e =>
                                                                                {
                                                                                    if(hideMsg.includes(e.max.toString()))
                                                                                    {
                                                                                        e.msg[0].message_content = "You hidden this message";
                                                                                        return e;

                                                                                    } else 
                                                                                    {
                                                                                        return e;
                                                                                    }

                                                                                });

                                                                                res.json(completedData);

                                                                            } else 
                                                                            {
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


                                                                } else 
                                                                {
                                                                    res.json({success:false});
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

            
                                        } else {
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
                        }



                    });

                } else
                {
                    res.json({ success: false, status: "invalid" });
                }

            } else
            {
                res.json({ success: false, status: "invalid" });
            }

        }
    }

    export class FetchChat 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const roomId: any = req.query.rid;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && roomId !== "" && roomId !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ?", [userKey.id, roomId], (cme, cmr, cmf): void =>
                    {
                        if(!cme)
                        {
                            const checkMember: Array<any> = JSON.parse(JSON.stringify(cmr));

                            if(checkMember.length === 1)
                            {
                                conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ? AND um_status IN (?, ?)", [userKey.id, roomId, "removed", "exit group"], (rve, rvr, rvf): void =>
                                {
                                    if(!rve)
                                    {
                                        const removedNum: Array<any> = JSON.parse(JSON.stringify(rvr));

                                        if(removedNum.length === 1)
                                        {
                                            // conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? AND message_id < ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active", Number(removedNum[0].um_remove_time)], (e, r, f): void =>
                                            // {
                                                
                                            // });

                                            conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? AND message_id <= ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active", Number(removedNum[0].um_remove_time)], (e, r, f): void =>
                                            {
                                                if(!e)
                                                {
                                                    const msgData: Array<any> = JSON.parse(JSON.stringify(r));
                                                
                                                    const deleteMsgQuery: string = mysql2.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);

                                                    conn.execute(deleteMsgQuery, (err, result, field): void =>
                                                    {
                                                        if(!err)
                                                        {
                                                            let deleteMsg: Array<any> = JSON.parse(JSON.stringify(result));
                                                            deleteMsg = deleteMsg.map(e => e.d_message_id.toString());

                                                            let completedMsgData: Array<any> = msgData;
                                                            
                                                            completedMsgData = completedMsgData.map(e => 
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
                                                                    me: e.user_id.toString(),
                                                                };
                                                            });

                                                            conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id], (he, hr, hf): void =>
                                                            {
                                                                if(!he)
                                                                {
                                                                    const hiddenMsg: Array<any> = JSON.parse(JSON.stringify(hr));
                                                                    const hiddenMessage: Array<any> = hiddenMsg.map(e => e.h_messageId.toString());

                                                                    completedMsgData = completedMsgData.map(e => 
                                                                    {
                                                                        if(hiddenMessage.includes(e.message_id.toString()))
                                                                        {
                                                                            e.hidden = true;
                                                                            return e;

                                                                        }  else 
                                                                        {
                                                                            e.hidden = false;
                                                                            return e;
                                                                        }

                                                                    });
                                                                
                                                                    conn.execute("SELECT * FROM message_room WHERE chat_id = ?", [roomId], (error, results, fields): void =>
                                                                    {
                                                                        if(!error)
                                                                        {
                                                                            let roomInfo: Array<any> = JSON.parse(JSON.stringify(results));
                                                                            roomInfo[0].msg = completedMsgData.reverse();

                                                                            if(roomInfo[0].chat_type === "friend")
                                                                            {
                                                                                conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ?", [roomId], (ee, rr, ff) => 
                                                                                {
                                                                                    if(!ee)
                                                                                    {
                                                                                        let friendChatInfo: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                                        let userChatInfo: Array<any> = JSON.parse(JSON.stringify(rr));

                                                                                        friendChatInfo = friendChatInfo.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                                                        userChatInfo = userChatInfo.filter(e => e.um_userId.toString() === userKey.id.toString());

                                                                                        roomInfo[0].room_name = friendChatInfo[0].name;
                                                                                        roomInfo[0].profile   = friendChatInfo[0].profile;
                                                                                        roomInfo[0].online_status = friendChatInfo[0].online_status;
                                                                                        roomInfo[0].userRoomStatus = friendChatInfo[0].um_status;
                                                                                        
                                                                                        
                                                                                        if(userChatInfo[0].unseen_msg > 0)
                                                                                        {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (eee, rrr, fff): void =>
                                                                                            {
                                                                                                if(!eee)
                                                                                                {
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });

                                                                                                } else 
                                                                                                {
                                                                                                    res.json({ success: false });
                                                                                                }

                                                                                            });

                                                                                        } else 
                                                                                        {
                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
                                                                                        }


                                                                                    } else 
                                                                                    {
                                                                                        res.json({ success: false });
                                                                                    }

                                                                                });

                                                                            } else 
                                                                            {
                                                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (me, mr, mf): void =>
                                                                                {
                                                                                    if(!me)
                                                                                    {
                                                                                        const memberUnseen: Array<any> = JSON.parse(JSON.stringify(mr));

                                                                                        if(memberUnseen[0].unseen_msg > 0)
                                                                                        {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (es, rs, fs): void =>
                                                                                            {
                                                                                                if(!es)
                                                                                                {
                                                                                                    roomInfo[0].userRoomStatus = memberUnseen[0].um_status;

                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });

                                                                                                } else 
                                                                                                {
                                                                                                    res.json({ success: false });
                                                                                                }

                                                                                            });

                                                                                        } else 
                                                                                        {
                                                                                            roomInfo[0].userRoomStatus = memberUnseen[0].um_status;

                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg, userRoomStatus: memberUnseen[0].um_status });
                                                                                        }

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

                                        } else if(removedNum.length === 0)
                                        {
                                            conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_status = ? ORDER BY message_id DESC LIMIT 20", [roomId, "Active"], (e, r, f): void =>
                                            {
                                                if(!e)
                                                {
                                                    const msgData: Array<any> = JSON.parse(JSON.stringify(r));
                                                
                                                    const deleteMsgQuery: string = mysql2.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);

                                                    conn.execute(deleteMsgQuery, (err, result, field): void =>
                                                    {
                                                        if(!err)
                                                        {
                                                            let deleteMsg: Array<any> = JSON.parse(JSON.stringify(result));
                                                            deleteMsg = deleteMsg.map(e => e.d_message_id.toString());

                                                            let completedMsgData: Array<any> = msgData;
                                                            
                                                            completedMsgData = completedMsgData.map(e => 
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
                                                                    me: e.user_id.toString()
                                                                };
                                                            });

                                                            conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id], (he, hr, hf): void =>
                                                            {
                                                                if(!he)
                                                                {

                                                                    const hiddenMsg: Array<any> = JSON.parse(JSON.stringify(hr));
                                                                    const hiddenMessage: Array<any> = hiddenMsg.map(e => e.h_messageId.toString());

                                                                    completedMsgData = completedMsgData.map(e => 
                                                                    {
                                                                        if(hiddenMessage.includes(e.message_id.toString()))
                                                                        {
                                                                            e.hidden = true;
                                                                            return e;

                                                                        }  else 
                                                                        {
                                                                            e.hidden = false;
                                                                            return e;
                                                                        }

                                                                    });

                                                                    conn.execute("SELECT * FROM message_room WHERE chat_id = ?", [roomId], (error, results, fields): void =>
                                                                    {
                                                                        if(!error)
                                                                        {
                                                                            let roomInfo: Array<any> = JSON.parse(JSON.stringify(results));
                                                                            roomInfo[0].msg = completedMsgData.reverse();

                                                                            if(roomInfo[0].chat_type === "friend")
                                                                            {
                                                                                conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ?", [roomId], (ee, rr, ff) => 
                                                                                {
                                                                                    if(!ee)
                                                                                    {
                                                                                        let friendChatInfo: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                                        let userChatInfo: Array<any> = JSON.parse(JSON.stringify(rr));

                                                                                        friendChatInfo = friendChatInfo.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                                                        userChatInfo = userChatInfo.filter(e => e.um_userId.toString() === userKey.id.toString());

                                                                                        roomInfo[0].room_name = friendChatInfo[0].name;
                                                                                        roomInfo[0].profile   = friendChatInfo[0].profile;
                                                                                        roomInfo[0].online_status = friendChatInfo[0].online_status;

                                                                                        conn.execute("SELECT * FROM friends WHERE userId = ? AND friend_id = ?", [userKey.id, friendChatInfo[0].id], (eeee, rrrr, ffff): void =>
                                                                                        {
                                                                                            if(!eeee)
                                                                                            {
                                                                                                const friendStatus: Array<any> = JSON.parse(JSON.stringify(rrrr));

                                                                                                roomInfo[0].friendAction = friendStatus[0].action;
                                                                                                roomInfo[0].userRoomStatus = friendStatus[0].f_status;

                                                                                                if(userChatInfo[0].unseen_msg > 0)
                                                                                                {
                                                                                                    conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (eee, rrr, fff): void =>
                                                                                                    {
                                                                                                        if(!eee)
                                                                                                        {
                                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });

                                                                                                        } else 
                                                                                                        {
                                                                                                            res.json({ success: false });
                                                                                                        }

                                                                                                    });

                                                                                                } else 
                                                                                                {
                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });
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

                                                                                });

                                                                            } else 
                                                                            {
                                                                                conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (me, mr, mf): void =>
                                                                                {
                                                                                    if(!me)
                                                                                    {
                                                                                        const memberUnseen: Array<any> = JSON.parse(JSON.stringify(mr));

                                                                                        if(memberUnseen[0].unseen_msg > 0)
                                                                                        {
                                                                                            conn.execute("UPDATE user_message_room SET unseen_msg = 0 WHERE um_roomId = ? AND um_userId = ?", [roomId, userKey.id.toString()], (es, rs, fs): void =>
                                                                                            {
                                                                                                if(!es)
                                                                                                {
                                                                                                    roomInfo[0].userRoomStatus = memberUnseen[0].um_status;

                                                                                                    res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg });

                                                                                                } else 
                                                                                                {
                                                                                                    res.json({ success: false });
                                                                                                }

                                                                                            });

                                                                                        } else 
                                                                                        {
                                                                                            roomInfo[0].userRoomStatus = memberUnseen[0].um_status;

                                                                                            res.json({ success: true, data: roomInfo, deleteMsg: deleteMsg, userRoomStatus: memberUnseen[0].um_status });
                                                                                        }

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

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                }

            } else 
            {
                res.json({ success: false, status: "invalid" });
            }
    
        }
    }

    export class FetchOldChat 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const num: any = req.query.n;
            const roomId: any = req.query.r;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && num !== "" && num !== undefined && roomId !== "" && roomId !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {

                    conn.execute("SELECT * FROM user_message_room WHERE um_userId = ? AND um_roomId = ?", [userKey.id, roomId], (err, result, field): void =>
                    {
                        if(!err)
                        {
                            const roomStatus: Array<any> = JSON.parse(JSON.stringify(result));

                            if(roomStatus.length === 1)
                            {
                                if(roomStatus[0].um_status !== "removed" && roomStatus[0].um_status !== "exit group")
                                {
                                  conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? ORDER BY message_id DESC LIMIT ?, 10",[roomId, num], (e, r, f): void =>
                                  {
                                      if(!e)
                                      {
                                          const msg: Array<any> = JSON.parse(JSON.stringify(r));
                                          let completedMsg: Array<any> = msg.map((e: any) =>
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
                                                me: e.user_id.toString(),
                                              };
                                          });

                                          if(msg.length > 0)
                                          {
                                                const deleteMsgQuery: string = mysql2.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);

                                                conn.execute(deleteMsgQuery, (error, results, fields): void =>
                                                {
                                                    if(!error)
                                                    {
                                                        conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id.toString()], (he, hr, hf): void =>
                                                        {
                                                            if(!he)
                                                            {
                                                                const hideMsg: Array<any> = JSON.parse(JSON.stringify(hr));
                                                                const hideMessage: Array<any> = hideMsg.map(e => e.h_messageId.toString());

                                                                completedMsg = completedMsg.map(e =>
                                                                {
                                                                    if(hideMessage.includes(e.message_id.toString()))
                                                                    {
                                                                        e.hidden = true;
                                                                        return e;

                                                                    } else 
                                                                    {
                                                                        e.hidden = false;
                                                                        return e;
                                                                    }
                                                                });

                                                                let deleteMsg: Array<any> = JSON.parse(JSON.stringify(results));

                                                                deleteMsg = deleteMsg.map(e => e.d_message_id.toString());

                                                                res.json({ success: true, data: completedMsg, deleteMsg: deleteMsg });

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
                                                res.json({ success: true, data: [], deleteMsg: [] });
                                            }

                                        } else 
                                        {
                                            res.json({ success: false });
                                        }

                                  });

                                } else 
                                {
                                    conn.execute("SELECT * FROM message FULL JOIN user ON user_id = user.id WHERE m_room_id = ? AND message_id <= ? ORDER BY message_id DESC LIMIT ?, 10",[roomId, roomStatus[0].um_remove_time, num], (e, r, f): void =>
                                    {
                                        if(!e)
                                        {
                                            const msg: Array<any> = JSON.parse(JSON.stringify(r));
                                            let completedMsg: Array<any> = msg.map((e: any) =>
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
                                                    me: e.user_id.toString(),
                                                };
                                            });

                                            if(msg.length > 0)
                                            {
                                                    const deleteMsgQuery: string = mysql2.format("SELECT d_message_id FROM delete_message WHERE d_room_id = ?", [roomId]);

                                                    conn.execute(deleteMsgQuery, (error, results, fields): void =>
                                                    {
                                                        if(!error)
                                                        {
                                                            conn.execute("SELECT * FROM hide_message WHERE h_roomId = ? AND h_userId = ?", [roomId, userKey.id.toString()], (he, hr, hf): void => 
                                                            {
                                                                if(!he)
                                                                {
                                                                    const hideMsg: Array<any> = JSON.parse(JSON.stringify(hr));
                                                                    const hideMessage: Array<any> = hideMsg.map(e => e.h_messageId.toString());

                                                                    completedMsg = completedMsg.map(e =>
                                                                    {
                                                                        if(hideMessage.includes(e.message_id.toString()))
                                                                        {
                                                                            e.hidden = true;
                                                                            return e;

                                                                        } else 
                                                                        {
                                                                            e.hidden = false;
                                                                            return e;
                                                                        }
                                                                    }); 
                                                                    
                                                                    let deleteMsg: Array<any> = JSON.parse(JSON.stringify(results));

                                                                    deleteMsg = deleteMsg.map(e => e.d_message_id.toString());

                                                                    res.json({ success: true, data: completedMsg, deleteMsg: deleteMsg });

                                                                } else {
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
                                                    res.json({ success: true, data: [], deleteMsg: [] });
                                                }

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

    export class GroupMembers 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const roomId: any = req.query.r;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && roomId !== "" && roomId !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user_message_room FULL JOIN user ON um_userId = user.id WHERE um_roomId = ? AND um_status = ?", [roomId, "Active"], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const members: Array<any> = JSON.parse(JSON.stringify(r));

                            if(members.length > 0)
                            {
                                const sortMembers: Array<any> = members.map((e) =>
                                {
                                    return {
                                        userId: e.id,
                                        name: e.name,
                                        username: e.username,
                                        profile: e.profile
                                    }
                                });


                                res.json({success: true, data: sortMembers});

                            } else 
                            {
                                res.json({ success: true, data: [] })
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
        }
    }

    export class GroupFriends
    {
        public Run(conn: Pool, req: Request, res: Response): void
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const num: any = req.query.num;
            const roomId: any = req.query.roomId;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any) 
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {

                            conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE userId = ? AND f_status = ? LIMIT ?, 15", [userKey.id, "friended", num], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                if(!err)
                                {
                                    const friendData = JSON.parse(JSON.stringify(result));
                                    const data: Array<any> = [];

                                    if(friendData.length >= 1)
                                    {
                                        friendData.forEach((friend: any): void =>
                                        {
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

                                        const queryGroup: string = mysql2.format("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ? AND um_userId IN ?", 
                                                            [roomId, "Active", [data.map(e => e.friendId)]]);

                                                    conn.execute(queryGroup, (e, r, f): void =>
                                                    {
                                                        if(!e)
                                                        {
                                                            let groupData: Array<any> = JSON.parse(JSON.stringify(r));

                                                            groupData = groupData.map(e => e.um_userId);

                                                            const sortGroupMembers: Array<any> = data.filter(e => !groupData.includes(e.friendId));

                                                            res.json({status: "success", friends: sortGroupMembers, num: friendData.length });
                                                        
                                                        } else 
                                                        {
                                                            res.json({ status: "database error" });
                                                        }

                                                    });

                                    } else 
                                    {
                                        res.json({status: "success", friends: data, num: friendData.length });
                                    }

                                } else 
                                {
                                    res.json({ status: "database error" });
                                }

                            });

                  

                } else 
                {
                    res.json({ status: "invalid" });
                }

            } else 
            {
                res.json({ status: "invalid" });
            }
            
        }
    }

    export class SearchFriendsGroup
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            // SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE "a%" AND user.status = "Active" AND f_status = "friended"
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const roomId: any = req.query.roomId;
            const num: any = req.query.num;


            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && req.query.friend !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM friends FULL JOIN user ON friend_id = id WHERE user.name LIKE ? AND f_status = ? AND userId = ? LIMIT ? ,15", [`${req.query.friend}%`, "friended", userKey.id, Number(num)], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const friendData = JSON.parse(JSON.stringify(result));
                            const totalFriend: Array<any> = [];

                                if(friendData.length > 0)
                                {
                                    friendData.forEach((friend: any): void => 
                                    {
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

                                                    const queryGroup: string = mysql2.format("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ? AND um_userId IN ?", 
                                                                                [roomId, "Active", [totalFriend.map(e => e.friendId)]]);

                                                    conn.execute(queryGroup, (e, r, f): void =>
                                                    {
                                                        if(!e)
                                                        {
                                                            let groupData: Array<any> = JSON.parse(JSON.stringify(r));

                                                            groupData = groupData.map(e => e.um_userId);

                                                            const sortGroupMembers: Array<any> = totalFriend.filter(e => !groupData.includes(e.friendId));

                                                            res.json({status: "success", friends: sortGroupMembers, num: friendData.length });
                                                        
                                                        } else 
                                                        {
                                                            res.json({ status: "database error" });
                                                        }

                                                    });
  

                                } else 
                                {
                                    res.json({ status: "success", friends: totalFriend });
                                }
                                
                            
                        } else 
                        {
                            res.json({ status: "database error"});
                        }
                         
                            
                    });

                } else 
                {
                    res.json({ status: "invalid"});
                }

            } else 
            {
                res.json({ status: "invalid" });
            }

        }
    }

    export class SearchPosts
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const postQuery: any = req.query.q;
            const num: any = req.query.n;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postQuery !== "" && postQuery !== undefined && num !== "" && num !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE content LIKE ? AND post_status = ?  ORDER BY post_id DESC LIMIT ?, 20 ", [`%${postQuery}%`, "Active", num], (e ,r, f): void =>
                    {
                        if(!e)
                        {
                            const posts: Array<any> = JSON.parse(JSON.stringify(r));

                            const sortPosts: Array<any> = posts.map(e => 
                                {
                                    return {
                                        post_id: e.post_id,
                                        content: e.content,
                                        user_id: e.user_id,
                                        name   : e.name,
                                        profile: e.profile,   
                                    }
                                });

                            res.json({ success: true, posts: sortPosts });

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
        }
    }

    export class Post 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const postId: any = req.query.p;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && postId !== undefined && postId !== "")
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
 
                                conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        const searchLike: Array<any> = JSON.parse(JSON.stringify(result));
                                        const totalPostId: Array<any> = searchLike.map((e: any): any => e.post_id);

                                        const likedQuery: string = mysql2.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);

                                        if(searchLike.length !== 0)
                                        {
                                            conn.execute(likedQuery, (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                            {
                                                if(!error)
                                                {
                                                    conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df): void =>
                                                    {
                                                        if(!de)
                                                        {
                                                            conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf): void =>
                                                            {
                                                                if(!re)
                                                                {
                                                                    const reportPost: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                    const reportPostId: Array<string> = reportPost.map(e => e.r_post_id.toString());

                                                                    const deletePost: Array<any> = JSON.parse(JSON.stringify(dr));
                                                                    const deletePostId: Array<string> = deletePost.map(e => e.dp_postId.toString());

                                                                    const likeResult: Array<any> = JSON.parse(JSON.stringify(results));
                                                                    const sortLikeResult: Array<any> = likeResult.map((e: any): any => e.post_id);

                                                                    const data: Array<any> = JSON.parse(JSON.stringify(result));
                                                                    let sortData: Array<any> = [];

                                                                    sortData = data.map((e: any): any =>
                                                                                {
                                                                                    return  {
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
                                                                                                liked: sortLikeResult.includes(e.post_id.toString()),
                                                                                                deleted: deletePostId.includes(e.post_id.toString()),
                                                                                                reported: reportPostId.includes(e.post_id.toString()),
                                                                                                dateJoin: e.date_join
                                                                                            }
                                                                                });

                                                                    conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id, searchLike[0].id], (eee, rrr, fff): void =>
                                                                    {
                                                                        if(!eee)
                                                                        {
                                                                            const friendStatus: Array<any> = JSON.parse(JSON.stringify(rrr));

                                                                            const sortFriend: Array<any> = friendStatus.map(e =>
                                                                            {
                                                                                return {
                                                                                    friendStatus: e.f_status,
                                                                                    action: e.action
                                                                                }
                                                                            });

                                                                            res.json({ success: true, data: sortData, friendStatus: sortFriend });

                                                                        } else 
                                                                        {
                                                                            res.json({ success: true, result: "database error" });
                                                                        }

                                                                    });

                                                                } else 
                                                                {
                                                                    res.json({ success: true, result: "database error" });
                                                                }

                                                            });

                                                        } else 
                                                        {
                                                            res.json({ success: true, result: "database error" });
                                                        }
                                                        

                                                    });

                                                } else 
                                                {
                                                    res.json({ success: true, result: "database error" });
                                                }

                                            });

                                        } else 
                                        {
                                            const data: Array<any> = JSON.parse(JSON.stringify(result));
                                            let sortData: Array<any> = [];

                                            sortData = data.map((e: any): any =>
                                                        {
                                                            return  {
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
                                                                        dateJoin: e.date_join
                                                                    }
                                                        });

                                            res.json({ success: true, data: sortData });

                                        }

                                    } else 
                                    {
                                        res.json({ success: false, result: "database error" });
                                    }

                                });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }
        }
    }

    export class User 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const uId: any = req.query.uid;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && uId !== "" && uId !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user WHERE id = ?", [uId.trim()], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const user: Array<any> = JSON.parse(JSON.stringify(r));

                            if(user.length === 1)
                            {
                                if(userKey.id.toString() !== user[0].id.toString())
                                {
                                    conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id.toString(), user[0].id.toString()], (ee, rr, ff): void =>
                                    {
                                        if(!ee)
                                        {
                                            const userInfo: Array<any> = JSON.parse(JSON.stringify(rr));

                                            if(userInfo.length === 0)
                                            {
                                                const sortUserData: Array<any> = user.map(e =>
                                                {
                                                    return {
                                                        userId: e.id,
                                                        username: e.username,
                                                        name: e.name,
                                                        profile: e.profile,
                                                        background: e.background,
                                                        date_join: e.date_join,
                                                    }
                                                });

                                                res.json({ success: true, user: true, userInfo: sortUserData, friendStatus: false, me: false });

                                            } else 
                                            {
                                                const sortUserData: Array<any> = user.map(e =>
                                                {
                                                    return {
                                                        userId: e.id,
                                                        username: e.username,
                                                        name: e.name,
                                                        profile: e.profile,
                                                        background: e.background,
                                                        date_join: e.date_join,
                                                    }
                                                });

                                                const friendState: Array<any> = userInfo.map(e =>
                                                {
                                                    return {
                                                        action: e.action,
                                                        f_status: e.f_status
                                                    }
                                                });

                                                res.json({ success: true, user: true, userInfo: sortUserData, friendStatus: true, friendInfo: friendState, me: false });
                                            }

                                        } else 
                                        {
                                            res.json({success: false});
                                        }
                                    });

                                } else 
                                {
                                    const sortUserData: Array<any> = user.map(e =>
                                    {
                                        return {
                                            userId: e.id,
                                            username: e.username,
                                            name: e.name,
                                            profile: e.profile,
                                            background: e.background,
                                            date_join: e.date_join,
                                        }
                                    });

                                    res.json({ success: true, user: true, userInfo: sortUserData, me: true });
                                }

                            

                            } else 
                            {
                                res.json({ success: true, user: false, me: false });
                            }

                        } else 
                        {
                            res.json({success: false});
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

    export class UserPost
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;
            const uId: any = req.query.uid;
            const num: any = req.query.n;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined && uId !== undefined && uId !== "" && num !== undefined && num !== "")
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
 
                                conn.execute("SELECT * FROM post FULL JOIN user ON user_id = user.id WHERE user_id = ? AND post_status = ? ORDER BY post_id DESC LIMIT ?, 10", [uId.toString(), "Active", num], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        const searchLike: Array<any> = JSON.parse(JSON.stringify(result));
                                        const totalPostId: Array<any> = searchLike.map((e: any): any => e.post_id);

                                        const likedQuery: string = mysql2.format("SELECT post_id FROM likes WHERE post_id IN ? AND liked = ? AND like_user_id = ?", [[totalPostId], "liked", userKey.id]);

                                        if(searchLike.length !== 0)
                                        {
                                            conn.execute(likedQuery, (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                            {
                                                if(!error)
                                                {
                                                    conn.execute("SELECT * FROM delete_post WHERE userId = ?", [userKey.id], (de, dr, df): void =>
                                                    {
                                                        if(!de)
                                                        {
                                                            conn.execute("SELECT * FROM report_post WHERE r_user_id = ?", [userKey.id], (re, rr, rf): void =>
                                                            {
                                                                if(!re)
                                                                {
                                                                    const reportPost: Array<any> = JSON.parse(JSON.stringify(rr));
                                                                    const reportPostId: Array<string> = reportPost.map(e => e.r_post_id.toString());

                                                                    const deletePost: Array<any> = JSON.parse(JSON.stringify(dr));
                                                                    const deletePostId: Array<string> = deletePost.map(e => e.dp_postId.toString());

                                                                    const likeResult: Array<any> = JSON.parse(JSON.stringify(results));
                                                                    const sortLikeResult: Array<any> = likeResult.map((e: any): any => e.post_id);

                                                                    const data: Array<any> = JSON.parse(JSON.stringify(result));
                                                                    let sortData: Array<any> = [];

                                                                    sortData = data.map((e: any): any =>
                                                                                {
                                                                                    return  {
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
                                                                                                liked: sortLikeResult.includes(e.post_id.toString()),
                                                                                                deleted: deletePostId.includes(e.post_id.toString()),
                                                                                                reported: reportPostId.includes(e.post_id.toString()),
                                                                                                dateJoin: e.date_join
                                                                                            }
                                                                                });

                                                                    conn.execute("SELECT * FROM friends FULL JOIN user ON user.id = friend_id WHERE userId = ? AND friend_id = ?", [userKey.id, searchLike[0].id], (eee, rrr, fff): void =>
                                                                    {
                                                                        if(!eee)
                                                                        {
                                                                            const friendStatus: Array<any> = JSON.parse(JSON.stringify(rrr));

                                                                            const sortFriend: Array<any> = friendStatus.map(e =>
                                                                            {
                                                                                return {
                                                                                    friendStatus: e.f_status,
                                                                                    action: e.action
                                                                                }
                                                                            });

                                                                            res.json({ success: true, data: sortData, friendStatus: sortFriend });

                                                                        } else 
                                                                        {
                                                                            res.json({ success: true, result: "database error" });
                                                                        }

                                                                    });

                                                                } else 
                                                                {
                                                                    res.json({ success: true, result: "database error" });
                                                                }

                                                            });

                                                        } else 
                                                        {
                                                            res.json({ success: true, result: "database error" });
                                                        }
                                                        

                                                    });

                                                } else 
                                                {
                                                    res.json({ success: true, result: "database error" });
                                                }

                                            });

                                        } else 
                                        {
                                            const data: Array<any> = JSON.parse(JSON.stringify(result));
                                            let sortData: Array<any> = [];

                                            sortData = data.map((e: any): any =>
                                                        {
                                                            return  {
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
                                                                        dateJoin: e.date_join
                                                                    }
                                                        });

                                            res.json({ success: true, data: sortData });

                                        }

                                    } else 
                                    {
                                        res.json({ success: false, result: "database error" });
                                    }

                                });

                } else 
                {
                    res.json({ success: false, result: "invalid" });
                }

            } else 
            {
                res.json({ success: false, result: "invalid" });
            }
        }
    }

    export class UserInfo
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const reqIdKey: any = req.query.u;

            try
            {
                const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(reqIdKey.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM user WHERE id = ? AND status = ?", [userKey.id, "Active"], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const userInfo: Array<any> = JSON.parse(JSON.stringify(r));

                            if(userInfo.length === 1)
                            {
                                const sortUserData: Array<any> = userInfo.map((e) => 
                                {
                                    return {
                                        username  : e.username,
                                        name      : e.name,
                                        profile   : e.profile,
                                        background: e.background,
                                        email     : e.email,
                                        dateJoin  : e.date_join,
                                    }

                                });

                                conn.execute("SELECT COUNT(f_id) as totalfriend FROM friends WHERE userId = ? AND f_status = ?", [userKey.id, "friended"], (err, result, field): void =>
                                {
                                    if(!err)
                                    {
                                        const totalFriends: Array<any> = JSON.parse(JSON.stringify(result));

                                        sortUserData[0].totalFriend = totalFriends[0].totalfriend;

                                        res.json({ success: true, data: sortUserData });

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
    
}
