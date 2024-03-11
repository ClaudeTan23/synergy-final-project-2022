import express, { Response, Request, query } from "express";
import mysql2, { Pool, QueryError, RowDataPacket, FieldPacket, Field } from "mysql2";
import dotenv from "dotenv";
import { AES, enc } from "crypto-js";
import { PostModel } from "../database/post-model";
import { LikesModel } from "../database/like-model";
import * as bcrypt from "bcrypt";

export namespace Update 
{
    export class Like 
    {
        public Run(conn: Pool, user: string, postId: string, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            
            try
            {
                const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            } catch(e: any)
            {
                res.json({ status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));
            let liked: boolean;

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM likes WHERE post_id = ? AND like_user_id = ?", [postId, userKey.id], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const likeData: Array<LikesModel.Likes> = JSON.parse(JSON.stringify(r));

                            if(likeData.length >= 1)
                            {
                                liked = (likeData[0].liked !== "none") ? true : false;
                                
                                conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    const data: Array<PostModel.Post> = JSON.parse(JSON.stringify(result));

                                    if(data.length === 1)
                                    {
                                        conn.execute("UPDATE post SET total_likes = ? WHERE post_id = ? AND post_status = ?", [(liked) ? data[0].total_likes - 1 : data[0].total_likes + 1, data[0].post_id, "Active"], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                        {
                                            if(!error)
                                            {
                                                conn.execute("UPDATE likes SET liked = ? WHERE like_id = ?", [(liked) ? "none" : "liked", likeData[0].like_id], (E, R, F): void => 
                                                {
                                                    if(!E)
                                                    {
                                                        res.json({ status: "success", likes: (liked) ? data[0].total_likes - 1 : data[0].total_likes + 1, liked: (liked) ? false : true });

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
                                        res.json({ status: "404" });
                                    }

                                });

                            } else {
                                    
                                conn.execute("SELECT * FROM post WHERE post_id = ? AND post_status = ?", [postId, "Active"], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    const postData: Array<PostModel.Post> = JSON.parse(JSON.stringify(result));

                                    if(postData.length === 1)
                                    {
                                        conn.execute("INSERT INTO likes (post_id, like_user_id, liked) VALUES (?, ?, ?)", [postId, userKey.id, "liked"], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                        {
                                            if(!error)
                                            {
                                                conn.execute("UPDATE post SET total_likes = ? WHERE post_id = ?", [postData[0].total_likes + 1, postData[0].post_id], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                                                {
                                                    if(!e)
                                                    {
                                                        res.json({ status: "success", likes: postData[0].total_likes + 1, liked: true });

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

    export class Unfriended 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const fId: string | undefined = req.body.fId;
            
            try
            {
                if(user !== "" && user !== undefined && fId !== "" && fId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const queryString: string = mysql2.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "friended"]);
                    
                    conn.execute(queryString, (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                    {
                        if(!err)
                        {
                            const friendData: Array<any> = JSON.parse(JSON.stringify(result));

                            if(friendData.length === 2)
                            {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unfriending", "none", userKey.id, fId], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                {
                                    if(!error)
                                    {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unfriended", "none", fId, userKey.id], (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                                        {
                                            if(!e)
                                            {
                                                res.json({ success: true });

                                            } else 
                                            {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });

                                    } else 
                                    {
                                        res.json({ success: false, status: "database error" });
                                    }

                                });

                            } else 
                            {
                                res.json({ success: false, status: "invalid data" });
                            }

                        } else 
                        {
                            res.json({ success: false, status: "database error" });
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

    export class CancelRequest
    {
        public Run(conn: Pool, req: Request, res: Response, socketClient: any): void
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const fId: string | undefined = req.body.userId;
            
            try
            {
                if(user !== "" && user !== undefined && fId !== "" && fId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const queryString: string = mysql2.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "pending"]);

                    conn.execute(queryString, (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const queryResult: Array<any> = JSON.parse(JSON.stringify(r));

                            if(queryResult.length === 2)
                            {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["canceling", "none", userKey.id, fId], (err: QueryError | null, result: RowDataPacket[], field:FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["canceled", "none", fId, userKey.id], (error: QueryError | null, results: RowDataPacket[], fields:FieldPacket[]): void =>
                                        {
                                            if(!error)
                                            {
                                                socketClient.IO.to([fId.toString(), userKey.id.toString()]).emit("noticeFriend", 1);
                                                res.json({ success: true });

                                            } else 
                                            {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });

                                    } else 
                                    {
                                        res.json({ success: false, status: "database error" });
                                    }

                                });
                                
                            } else 
                            {
                                res.json({ success: false, status: "invalid" });
                            }

                        } else 
                        {
                            res.json({ success: false, status: "database error" });
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

    export class ConfirmRequest 
    {
        public Run(conn: Pool, req: Request, res: Response, clientSocket: any): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const fId: string | undefined = req.body.userId;
            
            try
            {
                if(user !== "" && user !== undefined && fId !== "" && fId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const queryString: string = mysql2.format("SELECT * FROM friends WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[userKey.id, fId]], [[userKey.id, fId]], "pending"]);

                    conn.execute(queryString, (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const queryResult: Array<any> = JSON.parse(JSON.stringify(r));

                            if(queryResult.length === 2)
                            {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["accepted", "friended", userKey.id, fId], (err: QueryError | null, result: RowDataPacket[], field:FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["requesting", "friended", fId, userKey.id], (error: QueryError | null, results: RowDataPacket[], fields:FieldPacket[]): void =>
                                        {
                                            if(!error)
                                            {
                                                res.json({ success: true });
                                                clientSocket.IO.to(userKey.id.toString()).emit("update-friend-notice", true);

                                            } else 
                                            {
                                                res.json({ success: false, status: "database error" });
                                            }
                                        });

                                    } else 
                                    {
                                        res.json({ success: false, status: "database error" });
                                    }

                                });
                                
                            } else 
                            {
                                res.json({ success: false, status: "invalid" });
                            }

                        } else 
                        {
                            res.json({ success: false, status: "database error" });
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

    export class Blocked 
    {
        public Run(conn: Pool, req: Request, res: Response, clientSocket: any): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const fId: string | undefined = req.body.userId;
            
            try
            {
                if(user !== "" && user !== undefined && fId !== "" && fId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const query: string = mysql2.format("SELECT * FROM friends FULL JOIN user ON friend_id = user.id WHERE userId in ? AND friend_id in ?", [[[userKey.id, fId]], [[userKey.id, fId]]]);

                    conn.execute(query, (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const numRows: Array<any> = JSON.parse(JSON.stringify(r));

                            if(numRows.length === 2)
                            {
                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["blocking", "blocked", userKey.id, fId], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                {
                                    if(!err)
                                    {
                                        conn.execute("SELECT * FROM friends WHERE userId = ? AND friend_id = ? AND action = ?", [fId, userKey.id, "blocking"], (er: QueryError | null, re: RowDataPacket[], fi: FieldPacket[]): void =>
                                        {
                                            const result: Array<any> = JSON.parse(JSON.stringify(re));
                                            
                                            if(result.length === 0)
                                            {
                                                conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["blocked", "blocked", fId, userKey.id], (error, results, fields): void =>
                                                {
                                                    if(!error)
                                                    {
                                                        res.json({ success: true });
                                                        clientSocket.IO.to(userKey.id.toString()).emit("update-friend-notice", true);

                                                    } else 
                                                    {
                                                        res.json({ success: false, result: "database error" });
                                                    }
                                                    
                                                });

                                            } else 
                                            {
                                                res.json({ success: true });
                                            }

                                        });

                                    } else 
                                    {
                                        res.json({ success: false, result: "database error" });
                                    }

                                });

                            } else 
                            {
                                conn.execute("INSERT INTO friends (userId, friend_id, action, f_status) VALUES (?, ?, ?, ?), (?, ?, ?, ?)", [userKey.id, fId, "blocking", "blocked", fId, userKey.id, "blocked", "blocked"], (iErr: QueryError | null, iResult: RowDataPacket[], iField: FieldPacket[]): void =>
                                {
                                    if(!iErr)
                                    {
                                        res.json({ success: true });

                                    } else 
                                    {
                                        res.json({ success: false, result: "database error" });
                                    }

                                });
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

    export class Unblock 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const fId: string | undefined = req.body.userId;
            
            try
            {
                if(user !== "" && user !== undefined && fId !== "" && fId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    const query = mysql2.format("SELECT * FROM friends FULL JOIN user ON friend_id = user.id WHERE userId in ? AND friend_id in ? AND f_status = ?", [[[fId, userKey.id]], [[fId, userKey.id]], "blocked"]);

                    conn.execute(query, (e: QueryError | null, r: RowDataPacket[], f: FieldPacket[]): void =>
                    {
                        if(!e)
                        {
                            const numRows: Array<any> = JSON.parse(JSON.stringify(r));

                            if(numRows.length === 2)
                            {
                                conn.execute("SELECT * FROM friends WHERE friend_id = ? AND userId = ? AND action = ?", [userKey.id, fId, "blocking"], (er: QueryError | null, re: RowDataPacket[], fi: FieldPacket[]): void =>
                                {
                                    if(!er)
                                    {
                                        const rows: Array<any> = JSON.parse(JSON.stringify(re));

                                        if(rows.length === 0)
                                        {
                                            conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unblocking", "none", userKey.id, fId], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                            {
                                                if(!err)
                                                {
                                                    conn.execute("UPDATE friends SET action = ?, f_status = ? WHERE userId = ? AND friend_id = ?", ["unblocked", "none", fId, userKey.id], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                                                    {
                                                        if(!error)
                                                        {
                                                            res.json({ success: true });

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
                                            conn.execute("UPDATE friends SET action = ? WHERE userId = ? AND friend_id = ?", ["blocked", userKey.id, fId], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
                                            {
                                                if(!err)
                                                {
                                                    res.json({ success: true });

                                                } else 
                                                {
                                                    res.json({ success: false, result: "database error" });
                                                }
                                            });
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

    export class UpdateUnseen
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const roomId: string | undefined = req.body.roomId;
            
            try
            {
                if(user !== "" && user !== undefined && roomId !== "" && roomId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("UPDATE user_message_room SET unseen_msg = ? WHERE um_roomId = ? AND um_userId = ?", [0, roomId, userKey.id.toString()], (err, result, field): void =>
                    {
                        if(!err)
                        {
                            res.json({ success: true });

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

    export class DeleteMessage 
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const maxMsgId: string | undefined = req.body.latestMsgId.toString();
            const groupId: string | undefined = req.body.groupId.toString();
            

            try
            {
                if(user !== "" && user !== undefined && maxMsgId !== "" && maxMsgId !== undefined && groupId !== "" && groupId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("UPDATE user_message_room SET delete_status = ?, delete_time = ? WHERE um_userId = ? AND um_roomId = ?", ["delete", maxMsgId, userKey.id.toString(), groupId], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            res.json({ success: true });

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

    export class RemoveGroupMember
    {
        public Run(conn: Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const roomId: string | undefined = req.body.groupId.toString();
            const memberId: string | undefined = req.body.memberId.toString();
            const chatMaxId: string | undefined = req.body.maxChatId.toString();
    

            try
            {
                if(user !== "" && user !== undefined && roomId !== "" && roomId !== undefined && memberId !== "" && memberId !== undefined && chatMaxId !== "" && chatMaxId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_type = ? AND chat_status = ?", [roomId, "group", "Active"], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const checkAdmin: Array<any> = JSON.parse(JSON.stringify(r));

                            if(checkAdmin.length === 1)
                            {
                                if(checkAdmin[0].chat_adminId.toString() === userKey.id.toString())
                                {
                                    
                                        
                                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, memberId, "none", "removed", time, "Active"], (error, results: any, fields): void =>
                                            {
                                                if(!error)
                                                {
                                                    const insertId: any = results.insertId;

                                                    conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf): void =>
                                                    {
                                                        if(!se)
                                                        {
                                                            let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                            membersId = membersId.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                            membersId = membersId.map(e => e.um_userId.toString());

                                                            const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                    
                                                            conn.execute(queryMember, (sse, ssr, ssf): void =>
                                                            {
                                                                if(!sse)
                                                                {
                                                                    conn.execute("UPDATE user_message_room SET um_remove_time = ?, um_status = ? WHERE um_userId = ? AND um_roomId = ?", [insertId, "removed", memberId, roomId], (err, result, field): void =>
                                                                    {
                                                                        if(!err)
                                                                        {
                                                                            conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (ee, rr, ff): void =>
                                                                            {
                                                                                if(!ee)
                                                                                {
                                                                                    const msg: Array<any> = JSON.parse(JSON.stringify(rr));

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

                                                                                    clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0], {roomId: roomId, memberId: memberId, type: "removed"});


                                                                                    res.json({ success: true });

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

    export class DisbandGroup
    {
        public Run(conn: Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const roomId: string | undefined = req.body.roomId.toString();
    

            try
            {
                if(user !== "" && user !== undefined && roomId !== "" && roomId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_type = ? AND chat_status = ?", [roomId, "group", "Active"], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            const checkAdmin: Array<any> = JSON.parse(JSON.stringify(r));

                            if(checkAdmin.length === 1)
                            {
                                if(checkAdmin[0].chat_adminId.toString() === userKey.id.toString())
                                {
                                    
                                        
                                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

                                            conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, userKey.id, "none", "disband", time, "Active"], (error, results: any, fields): void =>
                                            {
                                                if(!error)
                                                {
                                                    const insertId: any = results.insertId;

                                                    conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND NOT um_status = ?", [roomId, "removed"], (se, sr, sf): void =>
                                                    {
                                                        if(!se)
                                                        {
                                                            let totalMemberId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                            totalMemberId = totalMemberId.map(e => e.um_userId.toString());

                                                            let membersId: Array<any> = JSON.parse(JSON.stringify(sr));
                                                            membersId = membersId.filter(e => e.um_userId.toString() !== userKey.id.toString());
                                                            membersId = membersId.map(e => e.um_userId.toString());

                                                            const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, membersId.length >= 1 ? [membersId] : [[""]], "Active"]);
                                    
                                                            conn.execute(queryMember, (sse, ssr, ssf): void =>
                                                            {
                                                                if(!sse)
                                                                {
                                                                    const disbandNoticeQuery: string = mysql2.format("UPDATE user_message_room SET um_remove_time = ?, um_status = ? WHERE um_userId IN ? AND um_roomId = ?", [insertId, "disband", totalMemberId.length >= 1 ? [totalMemberId] : [[""]], roomId]);

                                                                    conn.execute(disbandNoticeQuery, (err, result, field): void =>
                                                                    {
                                                                        if(!err)
                                                                        {
                                                                            conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (ee, rr, ff): void =>
                                                                            {
                                                                                if(!ee)
                                                                                {
                                                                                    const msg: Array<any> = JSON.parse(JSON.stringify(rr));

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

                                                                                    conn.execute("UPDATE message_room SET chat_status = ? WHERE chat_id = ?", ["disband", roomId], (de, dr, df): void =>
                                                                                    {
                                                                                        if(!de)
                                                                                        {
                                                                                            clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0]);

                                                                                            res.json({ success: true });

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

    export class ExitGroup
    {
        public Run(conn: Pool, req: Request, res: Response, clientSocket: any)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const roomId: string | undefined = req.body.roomId.toString();
    

            try
            {
                if(user !== "" && user !== undefined && roomId !== "" && roomId !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("SELECT * FROM message_room WHERE chat_id = ? AND chat_status = ?", [roomId, "Active"], (eee, rrr, fff): void =>
                    {
                        const checkGroupNum: Array<any> = JSON.parse(JSON.stringify(rrr));

                        if(checkGroupNum.length === 1)
                        {
                            conn.execute("SELECT * FROM user_message_room WHERE um_roomId = ? AND um_status = ?", [roomId, "Active"], (e, r, f): void =>
                            {
                                if(!e)
                                {
                                    let memberId: Array<any> = JSON.parse(JSON.stringify(r));
                                    memberId = memberId.map(e => e.um_userId.toString());

                                    if(memberId.includes(userKey.id.toString()))
                                    {
                                        const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

                                        conn.execute("INSERT INTO message (m_room_id, user_id, message_content, message_type, message_time, message_status) VALUES (?, ?, ?, ?, ?, ?)", [roomId, userKey.id, "none", "exit group", time, "Active"], (ee, rr: any, ff): void =>
                                        {
                                            if(!ee)
                                            {
                                                const insertId: any = rr.insertId;

                                                conn.execute("UPDATE user_message_room SET um_status = ?, um_remove_time = ? WHERE um_userId = ? AND um_roomId = ?", ["exit group", insertId, userKey.id, roomId], (err, result, field): void =>
                                                {
                                                    if(!err)
                                                    {
                                                        const queryMember: string = mysql2.format("UPDATE user_message_room SET unseen_msg = unseen_msg + 1, delete_status = ? WHERE um_roomId = ? AND um_userId IN ? AND um_status = ?", ["none", roomId, memberId.length >= 1 ? [memberId] : [[""]], "Active"]);

                                                        conn.execute(queryMember, (error, results, fields): void =>
                                                        {
                                                            if(!error)
                                                            {
                                                                conn.execute("SELECT * FROM message FULL JOIN user ON user.id = user_id WHERE message_id = ? AND message_status = ?", [insertId, "Active"], (me, mr, mf): void =>
                                                                {
                                                                    if(!me)
                                                                    {
                                                                        const msg: Array<any> = JSON.parse(JSON.stringify(mr));

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

                                                                        clientSocket.IO.to(`room${roomId}`).emit("group-message", completedMsg[0], {roomId: roomId, memberId: userKey.id.toString(), type: "exitGroup"});

                                                                        res.json({ success: true });

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

                    });
                    
                }
            }
        }
    }

    export class UpdateUserBackground
    {
        public Run(conn: Pool, user: any, file: Array<any>, req: Request, res: Response): void 
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
                    conn.execute("UPDATE user SET background = ? WHERE id = ?", [file.join(","), jsonKey.id], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            res.json({ success: true });

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

    export class UpdateUserProfile
    {
        public Run(conn: Pool, user: any, file: Array<any>, req: Request, res: Response): void 
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
                    conn.execute("UPDATE user SET profile = ? WHERE id = ?", [file.join(","), jsonKey.id], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            res.json({ success: true });

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

    export class UpdateUserName
    {
        public Run(conn: Pool, req: Request, res: Response)
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const name: string | undefined = req.body.name.toString();
    

            try
            {
                if(user !== "" && user !== undefined && name !== "" && name !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    conn.execute("UPDATE user SET name = ? WHERE id = ?", [name, userKey.id], (e, r, f): void =>
                    {
                        if(!e)
                        {
                            res.json({ success: true });

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

    export class UpdateUserPassword
    {
        public Run(conn: Pool, req: Request, res: Response): void 
        {
            dotenv.config();
            const key: any = process.env;
            const user: string | undefined = req.body.user;
            const password: string | undefined = req.body.password.toString();
    

            try
            {
                if(user !== "" && user !== undefined && password !== "" && password !== undefined)
                {
                    const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
                    const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

                } else 
                {
                    res.json({ success: false, status: "invalid" });
                    return;
                }

            } catch(e: any)
            {
                res.json({ success: false, status: "invalid" });
                return;
            }

            const userId = AES.decrypt(user.trim().toString(), key.SECRET_KEY);
            const userKey: { id: string, clientKey: string } = JSON.parse(userId.toString(enc.Utf8));

            if(userKey.id !== "" && userKey.id !== undefined && userKey.clientKey !== "" && userKey.clientKey !== undefined)
            {
                if(userKey.clientKey.trim() === key.SECRET_KEY_CLIENT)
                {
                    bcrypt.hash(password, 10, (err, hash): void =>
                    {
                        if(!err)
                        {
                            conn.execute("UPDATE user SET password = ? WHERE id = ?", [hash, userKey.id], (e, r, f): void =>
                            {
                                if(!e)
                                {
                                    res.json({ success: true });

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

            } else 
            {
                res.json({ success: false });
            }
        }
    }
}