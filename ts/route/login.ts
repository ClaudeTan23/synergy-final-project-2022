import express, { Request, Response, Router } from "express";
import { AES, enc } from "crypto-js";
import { Mysql2 } from "../database/mysql";
import cors, { CorsOptions } from "cors";
import { QueryError, RowDataPacket, FieldPacket } from "mysql2";
import { Model } from "../database/user-model";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { txtGenerator } from "../method/txt-generator";
import { ForgetPassword } from "../mailer/forget-password-mail";
import mysql2 from "mysql2";

dotenv.config();

const env: any = process.env;

const conn: mysql2.Pool = new Mysql2.Initialize().connection;

const corsConfig: CorsOptions = {
    origin: env.CORS_URL.split(","),
    optionsSuccessStatus: 200
};

const LoginRouter: Router = express.Router();

LoginRouter.use(express.json());

LoginRouter.options(["/login", "/forget", "/admin/login", "/admin/forget"], cors(corsConfig));



LoginRouter.post("/login", cors(corsConfig), (req: Request, res: Response): void =>
{
    const reqData: { username: string, password: string } = req.body;

    if(reqData.username.trim() !== "" && reqData.username.trim() !== undefined && reqData.password.trim() !== "" && reqData.password.trim() !== undefined)
    {

        conn.execute("SELECT * FROM user WHERE username = ? AND status = 'Active'", [reqData.username.trim()], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void => 
        {
            const data: Array<any> = JSON.parse(JSON.stringify(result));

            if(data.length >= 1)
            {   
                if(data[0].forget_password !== "none")
                {
                    if(reqData.password.toString().trim() === data[0].forget_password.toString().trim())
                    {
                        const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                        const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                        const position: boolean = (data[0].position === "admin") ? true : false;

                        conn.execute("UPDATE user SET forget_password = ? WHERE id = ?", ["none", data[0].id], (e, r, f): void =>
                        {
                            if(!e)
                            {
                                res.json({ auth: true, p: position, i: encryptedId });

                            } 
                        });

                        

                    } else 
                    {
                        bcrypt.compare(reqData.password, data[0].password, (err, result): void => 
                        {

                            if(result)
                            {
                                const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                                const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                                const position: boolean = (data[0].position === "admin") ? true : false;

                                conn.execute("UPDATE user SET forget_password = ? WHERE id = ?", ["none", data[0].id], (e, r, f): void =>
                                {
                                    if(!e)
                                    {
                                        res.json({ auth: true, p: position, i: encryptedId });

                                    } 
                                });

                            } else 
                            {
                                res.json({ auth: false });
                            }

                        });

                    }

                } else 
                {
                    bcrypt.compare(reqData.password, data[0].password, (err, result): void => 
                    {

                        if(result)
                        {
                            const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                            const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                            const position: boolean = (data[0].position === "admin") ? true : false;

                            res.json({ auth: true, p: position, i: encryptedId });

                        } else 
                        {
                            res.json({ auth: false });
                        }

                    });

                }


            } else 
            {
                res.json({ auth: false })
            }
        });

    } else 
    {
        res.json({ auth: false });
    }
});

LoginRouter.post("/admin/login", cors(corsConfig), (req: Request, res: Response): void =>
{
    const reqData: { username: string, password: string } = req.body;

    if(reqData.username.trim() !== "" && reqData.username.trim() !== undefined && reqData.password.trim() !== "" && reqData.password.trim() !== undefined)
    {

        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [reqData.username.trim()], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void => 
        {
            const data: Array<any> = JSON.parse(JSON.stringify(result));

            if(data.length >= 1)
            {   
                if(data[0].a_forget_password !== "none")
                {
                    if(reqData.password.toString().trim() === data[0].a_forget_password.toString().trim())
                    {
                        const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                        const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].admin_id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                        // const position: boolean = (data[0].position === "admin") ? true : false;

                        conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ?", ["none", data[0].admin_id], (e, r, f): void =>
                        {
                            if(!e)
                            {
                                res.json({ auth: true, i: encryptedId });

                            } 
                        });

                        

                    } else 
                    {
                        bcrypt.compare(reqData.password, data[0].a_password, (err, result): void => 
                        {

                            if(result)
                            {
                                const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                                const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].admin_id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                                // const position: boolean = (data[0].position === "admin") ? true : false;

                                conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ?", ["none", data[0].admin_id], (e, r, f): void =>
                                {
                                    if(!e)
                                    {
                                        res.json({ auth: true, i: encryptedId });

                                    } 
                                });

                            } else 
                            {
                                res.json({ auth: false });
                            }

                        });

                    }

                } else 
                {
                    bcrypt.compare(reqData.password, data[0].a_password, (err, result): void => 
                    {

                        if(result)
                        {
                            const authClient: string = env.SECRET_KEY_CLIENT!.toString();
                            const encryptedId: string = AES.encrypt(JSON.stringify({id: data[0].admin_id, clientKey: authClient}), env.SECRET_KEY!.toString()).toString();
                            // const position: boolean = (data[0].position === "admin") ? true : false;

                            res.json({ auth: true, i: encryptedId });

                        } else 
                        {
                            res.json({ auth: false });
                        }

                    });

                }


            } else 
            {
                res.json({ auth: false })
            }
        });

    } else 
    {
        res.json({ auth: false });
    }
});

LoginRouter.post("/forget", cors(corsConfig), (req: Request, res: Response): void => 
{
    const forgetData: { u: string } = req.body;

    if(forgetData.u !== "" && forgetData.u !== undefined)
    {

        conn.execute("SELECT * FROM user WHERE email = ? AND status = 'Active'", [forgetData.u], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
        {
            const data: Array<Model.User> = JSON.parse(JSON.stringify(result));

            if(data.length >= 1 && data[0].email !== undefined && data[0].email !== "")
            {
                const rdPassword: string = txtGenerator.Main();

                conn.execute("UPDATE user SET forget_password = ? WHERE id = ? AND status = ?", [rdPassword, data[0].id, "Active"], (e, r, f): void =>
                {
                    if(!e)
                    {
                        const forgetMail: ForgetPassword.Main = new ForgetPassword.Main(data[0].username, data[0].email);

                        if(forgetMail.Run(rdPassword, res))
                        {
                            // res.json({ result: true, status: "success", email: data[0].email });

                        } else 
                        {
                            res.json({ result: false, status: "failed" });
                        }
                    }

                });

            } else 
            {
                res.json({ result: false, status: "invalid" });
            }

        });

    } else 
    {
        res.json({ result: false, status: "invalid" });
    }
});

LoginRouter.post("/admin/forget", cors(corsConfig), (req: Request, res: Response): void => 
{
    const forgetData: { u: string } = req.body;

    if(forgetData.u !== "" && forgetData.u !== undefined)
    {

        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [forgetData.u], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
        {
            const data: Array<any> = JSON.parse(JSON.stringify(result));

            if(data.length >= 1 && data[0].a_email !== undefined && data[0].a_email !== "")
            {
                const rdPassword: string = txtGenerator.Main();

                conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ? AND a_status = ?", [rdPassword, data[0].admin_id, "Active"], (e, r, f): void =>
                {
                    if(!e)
                    {
                        const forgetMail: ForgetPassword.Main = new ForgetPassword.Main(data[0].a_username, data[0].a_email);

                        if(forgetMail.Run(rdPassword, res))
                        {
                            // res.json({ result: true, status: "success", email: data[0].a_email });

                        } else 
                        {
                            res.json({ result: false, status: "failed" });
                        }
                    }

                });

            } else 
            {
                res.json({ result: false, status: "invalid" });
            }

        });

    } else 
    {
        res.json({ result: false, status: "invalid" });
    }
});

export default LoginRouter;

