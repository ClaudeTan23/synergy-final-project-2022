import express, { Request, Response, Router } from "express";
import { Mysql2 } from "../database/mysql";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { FieldPacket, OkPacket, QueryError, ResultSetHeader, RowDataPacket } from "mysql2";
import { NodeMailer } from "../mailer/register-mailer";
import { Model } from "../database/user-model";
import { ConfirmationSender, AdminConfirmationSender } from "../mailer/confirmation-email-sender";
import * as bcrypt from "bcrypt";
import session, { SessionOptions } from "express-session";
import { AES , SHA256, enc } from "crypto-js";
import mysql2 from "mysql2";

dotenv.config();

const corsOption: CorsOptions = {
    origin: process.env.CORS_URL?.split(","),
    optionsSuccessStatus: 200
};

const conn: mysql2.Pool = new Mysql2.Initialize().connection;

const RegisterRouter: Router = express.Router();
// const sessionOption: SessionOptions = {
//     secret: "uwu",
//     resave: false,
//     saveUninitialized: false,
// }

// declare module "express-session"
// {
//     export interface SessionData 
//     {
//         userId: string
//     }
// }

RegisterRouter.options(["/test", "/register", "/admin/register"], cors(corsOption));

RegisterRouter.use(express.json());
RegisterRouter.use(express.urlencoded({ extended: false }));
// RegisterRouter.use(session(sessionOption));

RegisterRouter.get("/existuser", cors(corsOption), (req: Request, res: Response): void => {

    conn.execute("SELECT * FROM user WHERE username = ? AND status = 'Active'", [req.query.username], (error: QueryError | null, result: RowDataPacket[], fiedls: FieldPacket[]): void => {

        const user: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader = result;
        const data: Array<JSON> = JSON.parse(JSON.stringify(user));
        
        if(data.length > 0)
        {
            
            res.json({ usernameExisted: true }).status(200);

        } else 
        {
            res.json({ usernameExisted: false }).status(200);
        }


    });

});

RegisterRouter.get("/existadmin", cors(corsOption), (req: Request, res: Response): void => {

    conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [req.query.username], (error: QueryError | null, result: RowDataPacket[], fiedls: FieldPacket[]): void => {

        const user: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader = result;
        const data: Array<JSON> = JSON.parse(JSON.stringify(user));
        
        if(data.length > 0)
        {
            
            res.json({ usernameExisted: true }).status(200);

        } else 
        {
            res.json({ usernameExisted: false }).status(200);
        }


    });

});

RegisterRouter.post("/test", cors(corsOption), (req: Request, res: Response): void => {
    console.log(req.body)
    res.send("ok");
})

RegisterRouter.post("/register", cors(corsOption), (req: Request, res: Response): void => {

    const jsonData: {username: string, password: string, email: string} = req.body;


    conn.execute("SELECT * FROM user WHERE username = ? AND status IN ('PENDING', 'Active')", [jsonData.username.trim()], (error: QueryError | null, result: RowDataPacket[], fiedls: FieldPacket[]): void => {
        
        const results: Array<Model.User> = JSON.parse(JSON.stringify(result));

        if(results.length === 1)
        {
            if(result[0].status === "Active")
            {
                res.json({ ok: "invalid" });
                 
            } else 
            {
                if(jsonData.email.trim() === results[0].email)
                { //if email same as the request email mean it want to resent new confirmation code again

                    bcrypt.hash(jsonData.password, 10, (err, hash): void => 
                    {
                        if(!err)
                        {
                        const resent: ConfirmationSender.Sender = new ConfirmationSender.Sender("resent", jsonData.username, hash, jsonData.email);

                        resent.Run(conn, res);

                        console.log(req.body);
                        // res.json({ ok: "ok" });

                        } else 
                        {
                            res.json({ ok: err });
                        }
                        
                    });

                } else {
                    //new email and new confirmation code

                    bcrypt.hash(jsonData.password.trim(), 10, (err, hash): void => 
                    {
                        if(!err)
                        {
                        const newEmailCode: ConfirmationSender.Sender = new ConfirmationSender.Sender("newemailcode", jsonData.username, hash, jsonData.email);

                        newEmailCode.Run(conn, res);  //email loading please create a ui for waiting the email to send

                        console.log(req.body);
                        // res.json({ ok: "ok" });

                        } else 
                        {
                            res.json({ ok: err });
                        }
                        
                    });
            
                }

            }
            
        } else 
        {

            bcrypt.hash(jsonData.password.trim(), 10, (err, hash): void => 
            {
                if(!err)
                {
                  const newAccount: ConfirmationSender.Sender = new ConfirmationSender.Sender("newaccount", jsonData.username, hash, jsonData.email);

                  newAccount.Run(conn, res);

                  console.log(req.body);
                //   res.json({ ok: "ok" });

                } else 
                {
                    res.json({ ok: err });
                }
                
            });
            
        }
    });
    
});

RegisterRouter.post("/admin/register", cors(corsOption), (req: Request, res: Response): void => {

    const jsonData: {username: string, password: string, email: string} = req.body;


    conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status IN ('PENDING', 'Active')", [jsonData.username.trim()], (error: QueryError | null, result: RowDataPacket[], fiedls: FieldPacket[]): void => {
        
        const results: Array<any> = JSON.parse(JSON.stringify(result));

        if(results.length === 1)
        {
            if(result[0].a_status === "Active")
            {
                res.json({ ok: "invalid" });
                 
            } else 
            {
                if(jsonData.email.trim() === results[0].a_email)
                { //if email same as the request email mean it want to resent new confirmation code again

                    bcrypt.hash(jsonData.password, 10, (err, hash): void => 
                    {
                        if(!err)
                        {
                        const resent: AdminConfirmationSender.Sender = new AdminConfirmationSender.Sender("resent", jsonData.username, hash, jsonData.email);

                        resent.Run(conn);

                        console.log(req.body);
                        res.json({ ok: "ok" });

                        } else 
                        {
                            res.json({ ok: err });
                        }
                        
                    });

                } else {
                    //new email and new confirmation code

                    bcrypt.hash(jsonData.password.trim(), 10, (err, hash): void => 
                    {
                        if(!err)
                        {
                        const newEmailCode: AdminConfirmationSender.Sender = new AdminConfirmationSender.Sender("newemailcode", jsonData.username, hash, jsonData.email);

                        newEmailCode.Run(conn);

                        console.log(req.body);
                        res.json({ ok: "ok" });

                        } else 
                        {
                            res.json({ ok: err });
                        }
                        
                    });
            
                }

            }
            
        } else 
        {

            bcrypt.hash(jsonData.password.trim(), 10, (err, hash): void => 
            {
                if(!err)
                {
                  const newAccount: AdminConfirmationSender.Sender = new AdminConfirmationSender.Sender("newaccount", jsonData.username, hash, jsonData.email);

                  newAccount.Run(conn);

                  console.log(req.body);
                  res.json({ ok: "ok" });

                } else 
                {
                    res.json({ ok: err });
                }
                
            });
            
        }
    });
    
});

// RegisterRouter.get("/verify", cors(corsOption), (req: Request, res: Response): void =>
// {
//     const verifyData: any = req.query;
//     console.log(verifyData);
    
//     if(verifyData.u !== undefined && verifyData.c !== undefined && verifyData.u !== "" && verifyData.c !== "")
//     {

//         conn.execute("SELECT * FROM user WHERE username = ? AND confirmationCode = ?", [verifyData.u.trim(), verifyData.c.trim()], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
//         {
//             const data: Array<Model.User> = JSON.parse(JSON.stringify(result));
//             const date: Date = new Date();
//             const totalDate: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;

//             if(data.length >= 1)
//             {
//                 if(verifyData.action.trim() === "active")
//                 {
//                     conn.execute(`UPDATE user SET status = 'Active' WHERE username = ?`, [verifyData.u.trim()], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
//                     {
//                         if(!error)
//                         {
//                             const id: string         = data[0].id;
//                             const authClient: string = process.env.SECRET_KEY_CLIENT!.toString();
//                             const position: boolean = (data[0].position === "admin") ? true : false;

//                             const authKey: string = AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY!.toString()).toString()

//                             const mailer: any = new NodeMailer.Mailer();

//                             mailer.SendMail(
//                                 data[0].email, 
//                                 "Soical Connect Account Approved",
//                                 undefined,
//                                 "Your account from social connect have approved.",
//                                 undefined,
//                                 );

//                             res.json({ auth: true, p: position, i: "active" });   

//                         } else 
//                         {
//                             res.json({ auth: false });
//                         }
//                     });

//                 } else if (verifyData.action.trim() === "deactivate")
//                 {
//                     conn.execute(`UPDATE user SET status = 'Deactivate' WHERE username = ?`, [verifyData.u.trim()], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
//                     {
//                         if(!error)
//                         {
//                             const id: string         = data[0].id;
//                             const authClient: string = process.env.SECRET_KEY_CLIENT!.toString();
//                             const position: boolean = (data[0].position === "admin") ? true : false;

//                             const authKey: string = AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY!.toString()).toString()

//                             res.json({ auth: true, p: position, i: "deactivate" });   

//                         } else 
//                         {
//                             res.json({ auth: false });
//                         }
//                     });
//                 }

//             } else 
//             {
//                 res.json({ auth: false });
//             }
//         });

//     } else 
//     {
//         res.json({ auth: false });
//     }
    
// });

RegisterRouter.get("/averify", cors(corsOption), (req: Request, res: Response): void =>
{
    const verifyData: any = req.query;
    console.log(verifyData);
    
    if(verifyData.u !== undefined && verifyData.c !== undefined && verifyData.u !== "" && verifyData.c !== "")
    {

        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_confirmationCode = ? AND a_status = 'PENDING'", [verifyData.u.trim(), verifyData.c.trim()], (err: QueryError | null, result: RowDataPacket[], field: FieldPacket[]): void =>
        {
            const data: Array<any> = JSON.parse(JSON.stringify(result));
            const date: Date = new Date();
            const totalDate: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;

            if(data.length >= 1)
            {
                conn.execute(`UPDATE admin SET a_confirmationCode = 'None', a_status = 'Active', a_date_join = '${totalDate}' WHERE a_username = ?`, [verifyData.u.trim()], (error: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]): void =>
                {
                    if(!error)
                    {
                        const id: string         = data[0].admin_id;
                        const authClient: string = process.env.SECRET_KEY_CLIENT!.toString();

                        const authKey: string = AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY!.toString()).toString()

                        res.json({ auth: true, i: authKey });   

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

    } else 
    {
        res.json({ auth: false });
    }
    
});


export default RegisterRouter;
