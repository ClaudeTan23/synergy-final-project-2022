import { Mysql2 } from "../database/mysql";
import { Request, Response } from "express";
import { AES, enc } from "crypto-js";
import dotenv from "dotenv";
import { QueryError, RowDataPacket, FieldPacket } from "mysql2";
import { Model } from "../database/user-model";
import { txtGenerator } from "./txt-generator";
import mysql2 from "mysql2";

export namespace Auth 
{

    export class Main 
    {
        public req: Request;
        public res: Response;
        public env: any;

        constructor(req: Request, res: Response)
        {
            dotenv.config();

            this.req = req;
            this.res = res;
            this.env = process.env;

        }

        public Session(db: mysql2.Pool, clientSocket: any): void
        {
            if (this.req.query.u !== undefined && this.req.query.u !== "") 
            {

                try {
                    
                    const key = AES.decrypt(this.req.query.u!.toString(), this.env.SECRET_KEY);
                    const keyJson = JSON.parse(key.toString(enc.Utf8));

                } catch (error: any) 
                {
                    this.res.json({ result: false });

                    return;
                }

                const key = AES.decrypt(this.req.query.u!.toString(), this.env.SECRET_KEY);
                console.log(key.toString(enc.Utf8));
                const keyJson = JSON.parse(key.toString(enc.Utf8));

                if (keyJson.id !== "" && keyJson.id !== undefined && keyJson.clientKey !== "" && keyJson.clientKey !== undefined)
                {
                    if (keyJson.clientKey === this.env.SECRET_KEY_CLIENT) 
                    {
                    // const mysql: mysql2.Pool = db;

                        db.execute("SELECT * FROM user WHERE id = ? AND status = 'Active'", [keyJson.id], (error: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void => 
                        {
                            if (!error) 
                            {
                                const r: Array<Model.User> = JSON.parse(JSON.stringify(result));    
                                const txtGenerate: string = txtGenerator.Main();
                                const jsonString: string = JSON.stringify({ token: txtGenerate, clientKey: this.env.SECRET_KEY_CLIENT });


                                const csrfToken: string = AES.encrypt(jsonString, this.env.SECRET_KEY).toString();
                                // const position: boolean = (r[0].position === "admin") ? true : false;
                                
                                if (r.length >= 1) 
                                {
                                    db.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?", [keyJson.id, "Active"], (e, re, f): void =>
                                    {
                                        if(!e)
                                        {
                                            // clientSocket.IO.in(clientSocket.socket.id).socketsLeave("room41");
                                            if(this.req.query.s === "" || this.req.query.s === undefined)
                                            {
                                                let roomId: Array<any> = JSON.parse(JSON.stringify(re));

                                                const rId: Array<any> = roomId;

                                                roomId = roomId.map(e => `room${e.um_roomId}`);
                                                console.log(clientSocket.socket.id)
                                                clientSocket.socket.join(roomId);

                                                clientSocket.socket.join(keyJson.id.toString());
                                                // clientSocket.socket.join("announcement");

                                                const checkClientId = (): void =>
                                                {
                                                    if(clientSocket.socket.clientUserId === undefined )
                                                    {
                                                        clientSocket.socket.clientUserId = keyJson.id.toString();

                                                        if(clientSocket.socket.clientUserId === undefined)
                                                        {
                                                            checkClientId();
                                                        }
                                                    }
                                                }

                                                setTimeout(() => {

                                                    db.execute("UPDATE user SET socket_exist = socket_exist + ?, online_status = ? WHERE status = ? AND id = ?", [1, "on", "Active", keyJson.id], (er, results, field): void =>
                                                    {
                                                        if(!er)
                                                        {
                                                            checkClientId();

                                                            clientSocket.IO.to(roomId).emit("online-status", { group: rId.map(e => {  return {e, userId: keyJson.id.toString(), name: r[0].name} }) });
                                                            
                                                            this.res.json({ result: true, p: false, ct: csrfToken, i: r[0].id, icon: r[0].profile, name: r[0].name, username: r[0].username });
                                                            

                                                        } else 
                                                        {
                                                            this.res.json({ result: false });
                                                        }

                                                    });

                                                }, 100);

                                            } else 
                                            {
                                                this.res.json({ result: true, p: false, ct: csrfToken, i: r[0].id, icon: r[0].profile, name: r[0].name, username: r[0].username });

                                            }

                                        } else 
                                        {
                                            this.res.json({ result: false });
                                        }
                                        
                                    });

                                } else 
                                {
                                    this.res.json({ result: false });
                                }

                            } else
                            {
                                this.res.json({ result: false });
                            }
                        });

                    } else 
                    {
                    this.res.json({ result: false });

                    }

                } else
                {
                    
                    this.res.json({ result: false });
                }
            
            } else
            {
                this.res.json({ result: false });
            }
        }

    }
}

export namespace AdminAuth 
{

    export class Main 
    {
        public req: Request;
        public res: Response;
        public env: any;

        constructor(req: Request, res: Response)
        {
            dotenv.config();

            this.req = req;
            this.res = res;
            this.env = process.env;

        }

        public Session(db: mysql2.Pool, clientSocket: any): void
        {
            if (this.req.query.u !== undefined && this.req.query.u !== "") 
            {

                try {
                    
                    const key = AES.decrypt(this.req.query.u!.toString(), this.env.SECRET_KEY);
                    const keyJson = JSON.parse(key.toString(enc.Utf8));

                } catch (error: any) 
                {
                    this.res.json({ result: false });

                    return;
                }

                const key = AES.decrypt(this.req.query.u!.toString(), this.env.SECRET_KEY);
                console.log(key.toString(enc.Utf8));
                const keyJson = JSON.parse(key.toString(enc.Utf8));

                if (keyJson.id !== "" && keyJson.id !== undefined && keyJson.clientKey !== "" && keyJson.clientKey !== undefined)
                {
                    if (keyJson.clientKey === this.env.SECRET_KEY_CLIENT) 
                    {
                    // const mysql: mysql2.Pool = db;

                        db.execute("SELECT * FROM admin WHERE admin_id = ? AND a_status = 'Active'", [keyJson.id], (error: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void => 
                        {
                            if (!error) 
                            {
                                const r: Array<any> = JSON.parse(JSON.stringify(result));    
                                const txtGenerate: string = txtGenerator.Main();
                                const jsonString: string = JSON.stringify({ token: txtGenerate, clientKey: this.env.SECRET_KEY_CLIENT });


                                const csrfToken: string = AES.encrypt(jsonString, this.env.SECRET_KEY).toString();
                                // const position: boolean = (r[0].position === "admin") ? true : false;
                                
                                if (r.length >= 1) 
                                {
                                    // clientSocket.socket.join("announcement");
                                    this.res.json({ result: true, ct: csrfToken, i: r[0].admin_id });

                                } else 
                                {
                                    this.res.json({ result: false });
                                }

                            } else
                            {
                                this.res.json({ result: false });
                            }
                        });

                    } else 
                    {

                    this.res.json({ result: false });

                    }

                } else
                {
                    
                    this.res.json({ result: false });
                }
            
            } else
            {
                this.res.json({ result: false });
            }
        }

    }
}