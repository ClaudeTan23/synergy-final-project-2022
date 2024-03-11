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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql_1 = require("../database/mysql");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const confirmation_email_sender_1 = require("../mailer/confirmation-email-sender");
const bcrypt = __importStar(require("bcrypt"));
const crypto_js_1 = require("crypto-js");
dotenv_1.default.config();
const corsOption = {
    origin: (_a = process.env.CORS_URL) === null || _a === void 0 ? void 0 : _a.split(","),
    optionsSuccessStatus: 200
};
const conn = new mysql_1.Mysql2.Initialize().connection;
const RegisterRouter = express_1.default.Router();
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
RegisterRouter.options(["/test", "/register", "/admin/register"], (0, cors_1.default)(corsOption));
RegisterRouter.use(express_1.default.json());
RegisterRouter.use(express_1.default.urlencoded({ extended: false }));
// RegisterRouter.use(session(sessionOption));
RegisterRouter.get("/existuser", (0, cors_1.default)(corsOption), (req, res) => {
    conn.execute("SELECT * FROM user WHERE username = ? AND status = 'Active'", [req.query.username], (error, result, fiedls) => {
        const user = result;
        const data = JSON.parse(JSON.stringify(user));
        if (data.length > 0) {
            res.json({ usernameExisted: true }).status(200);
        }
        else {
            res.json({ usernameExisted: false }).status(200);
        }
    });
});
RegisterRouter.get("/existadmin", (0, cors_1.default)(corsOption), (req, res) => {
    conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [req.query.username], (error, result, fiedls) => {
        const user = result;
        const data = JSON.parse(JSON.stringify(user));
        if (data.length > 0) {
            res.json({ usernameExisted: true }).status(200);
        }
        else {
            res.json({ usernameExisted: false }).status(200);
        }
    });
});
RegisterRouter.post("/test", (0, cors_1.default)(corsOption), (req, res) => {
    console.log(req.body);
    res.send("ok");
});
RegisterRouter.post("/register", (0, cors_1.default)(corsOption), (req, res) => {
    const jsonData = req.body;
    conn.execute("SELECT * FROM user WHERE username = ? AND status IN ('PENDING', 'Active')", [jsonData.username.trim()], (error, result, fiedls) => {
        const results = JSON.parse(JSON.stringify(result));
        if (results.length === 1) {
            if (result[0].status === "Active") {
                res.json({ ok: "invalid" });
            }
            else {
                if (jsonData.email.trim() === results[0].email) { //if email same as the request email mean it want to resent new confirmation code again
                    bcrypt.hash(jsonData.password, 10, (err, hash) => {
                        if (!err) {
                            const resent = new confirmation_email_sender_1.ConfirmationSender.Sender("resent", jsonData.username, hash, jsonData.email);
                            resent.Run(conn, res);
                            console.log(req.body);
                            // res.json({ ok: "ok" });
                        }
                        else {
                            res.json({ ok: err });
                        }
                    });
                }
                else {
                    //new email and new confirmation code
                    bcrypt.hash(jsonData.password.trim(), 10, (err, hash) => {
                        if (!err) {
                            const newEmailCode = new confirmation_email_sender_1.ConfirmationSender.Sender("newemailcode", jsonData.username, hash, jsonData.email);
                            newEmailCode.Run(conn, res); //email loading please create a ui for waiting the email to send
                            console.log(req.body);
                            // res.json({ ok: "ok" });
                        }
                        else {
                            res.json({ ok: err });
                        }
                    });
                }
            }
        }
        else {
            bcrypt.hash(jsonData.password.trim(), 10, (err, hash) => {
                if (!err) {
                    const newAccount = new confirmation_email_sender_1.ConfirmationSender.Sender("newaccount", jsonData.username, hash, jsonData.email);
                    newAccount.Run(conn, res);
                    console.log(req.body);
                    //   res.json({ ok: "ok" });
                }
                else {
                    res.json({ ok: err });
                }
            });
        }
    });
});
RegisterRouter.post("/admin/register", (0, cors_1.default)(corsOption), (req, res) => {
    const jsonData = req.body;
    conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status IN ('PENDING', 'Active')", [jsonData.username.trim()], (error, result, fiedls) => {
        const results = JSON.parse(JSON.stringify(result));
        if (results.length === 1) {
            if (result[0].a_status === "Active") {
                res.json({ ok: "invalid" });
            }
            else {
                if (jsonData.email.trim() === results[0].a_email) { //if email same as the request email mean it want to resent new confirmation code again
                    bcrypt.hash(jsonData.password, 10, (err, hash) => {
                        if (!err) {
                            const resent = new confirmation_email_sender_1.AdminConfirmationSender.Sender("resent", jsonData.username, hash, jsonData.email);
                            resent.Run(conn);
                            console.log(req.body);
                            res.json({ ok: "ok" });
                        }
                        else {
                            res.json({ ok: err });
                        }
                    });
                }
                else {
                    //new email and new confirmation code
                    bcrypt.hash(jsonData.password.trim(), 10, (err, hash) => {
                        if (!err) {
                            const newEmailCode = new confirmation_email_sender_1.AdminConfirmationSender.Sender("newemailcode", jsonData.username, hash, jsonData.email);
                            newEmailCode.Run(conn);
                            console.log(req.body);
                            res.json({ ok: "ok" });
                        }
                        else {
                            res.json({ ok: err });
                        }
                    });
                }
            }
        }
        else {
            bcrypt.hash(jsonData.password.trim(), 10, (err, hash) => {
                if (!err) {
                    const newAccount = new confirmation_email_sender_1.AdminConfirmationSender.Sender("newaccount", jsonData.username, hash, jsonData.email);
                    newAccount.Run(conn);
                    console.log(req.body);
                    res.json({ ok: "ok" });
                }
                else {
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
RegisterRouter.get("/averify", (0, cors_1.default)(corsOption), (req, res) => {
    const verifyData = req.query;
    console.log(verifyData);
    if (verifyData.u !== undefined && verifyData.c !== undefined && verifyData.u !== "" && verifyData.c !== "") {
        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_confirmationCode = ? AND a_status = 'PENDING'", [verifyData.u.trim(), verifyData.c.trim()], (err, result, field) => {
            const data = JSON.parse(JSON.stringify(result));
            const date = new Date();
            const totalDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;
            if (data.length >= 1) {
                conn.execute(`UPDATE admin SET a_confirmationCode = 'None', a_status = 'Active', a_date_join = '${totalDate}' WHERE a_username = ?`, [verifyData.u.trim()], (error, results, fields) => {
                    if (!error) {
                        const id = data[0].admin_id;
                        const authClient = process.env.SECRET_KEY_CLIENT.toString();
                        const authKey = crypto_js_1.AES.encrypt(JSON.stringify({ id: id, clientKey: authClient }), process.env.SECRET_KEY.toString()).toString();
                        res.json({ auth: true, i: authKey });
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
    }
    else {
        res.json({ auth: false });
    }
});
exports.default = RegisterRouter;
