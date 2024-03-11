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
const express_1 = __importDefault(require("express"));
const crypto_js_1 = require("crypto-js");
const mysql_1 = require("../database/mysql");
const cors_1 = __importDefault(require("cors"));
const bcrypt = __importStar(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const txt_generator_1 = require("../method/txt-generator");
const forget_password_mail_1 = require("../mailer/forget-password-mail");
dotenv_1.default.config();
const env = process.env;
const conn = new mysql_1.Mysql2.Initialize().connection;
const corsConfig = {
    origin: env.CORS_URL.split(","),
    optionsSuccessStatus: 200
};
const LoginRouter = express_1.default.Router();
LoginRouter.use(express_1.default.json());
LoginRouter.options(["/login", "/forget", "/admin/login", "/admin/forget"], (0, cors_1.default)(corsConfig));
LoginRouter.post("/login", (0, cors_1.default)(corsConfig), (req, res) => {
    const reqData = req.body;
    if (reqData.username.trim() !== "" && reqData.username.trim() !== undefined && reqData.password.trim() !== "" && reqData.password.trim() !== undefined) {
        conn.execute("SELECT * FROM user WHERE username = ? AND status = 'Active'", [reqData.username.trim()], (err, result, field) => {
            const data = JSON.parse(JSON.stringify(result));
            if (data.length >= 1) {
                if (data[0].forget_password !== "none") {
                    if (reqData.password.toString().trim() === data[0].forget_password.toString().trim()) {
                        const authClient = env.SECRET_KEY_CLIENT.toString();
                        const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                        const position = (data[0].position === "admin") ? true : false;
                        conn.execute("UPDATE user SET forget_password = ? WHERE id = ?", ["none", data[0].id], (e, r, f) => {
                            if (!e) {
                                res.json({ auth: true, p: position, i: encryptedId });
                            }
                        });
                    }
                    else {
                        bcrypt.compare(reqData.password, data[0].password, (err, result) => {
                            if (result) {
                                const authClient = env.SECRET_KEY_CLIENT.toString();
                                const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                                const position = (data[0].position === "admin") ? true : false;
                                conn.execute("UPDATE user SET forget_password = ? WHERE id = ?", ["none", data[0].id], (e, r, f) => {
                                    if (!e) {
                                        res.json({ auth: true, p: position, i: encryptedId });
                                    }
                                });
                            }
                            else {
                                res.json({ auth: false });
                            }
                        });
                    }
                }
                else {
                    bcrypt.compare(reqData.password, data[0].password, (err, result) => {
                        if (result) {
                            const authClient = env.SECRET_KEY_CLIENT.toString();
                            const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                            const position = (data[0].position === "admin") ? true : false;
                            res.json({ auth: true, p: position, i: encryptedId });
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
LoginRouter.post("/admin/login", (0, cors_1.default)(corsConfig), (req, res) => {
    const reqData = req.body;
    if (reqData.username.trim() !== "" && reqData.username.trim() !== undefined && reqData.password.trim() !== "" && reqData.password.trim() !== undefined) {
        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [reqData.username.trim()], (err, result, field) => {
            const data = JSON.parse(JSON.stringify(result));
            if (data.length >= 1) {
                if (data[0].a_forget_password !== "none") {
                    if (reqData.password.toString().trim() === data[0].a_forget_password.toString().trim()) {
                        const authClient = env.SECRET_KEY_CLIENT.toString();
                        const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].admin_id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                        // const position: boolean = (data[0].position === "admin") ? true : false;
                        conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ?", ["none", data[0].admin_id], (e, r, f) => {
                            if (!e) {
                                res.json({ auth: true, i: encryptedId });
                            }
                        });
                    }
                    else {
                        bcrypt.compare(reqData.password, data[0].a_password, (err, result) => {
                            if (result) {
                                const authClient = env.SECRET_KEY_CLIENT.toString();
                                const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].admin_id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                                // const position: boolean = (data[0].position === "admin") ? true : false;
                                conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ?", ["none", data[0].admin_id], (e, r, f) => {
                                    if (!e) {
                                        res.json({ auth: true, i: encryptedId });
                                    }
                                });
                            }
                            else {
                                res.json({ auth: false });
                            }
                        });
                    }
                }
                else {
                    bcrypt.compare(reqData.password, data[0].a_password, (err, result) => {
                        if (result) {
                            const authClient = env.SECRET_KEY_CLIENT.toString();
                            const encryptedId = crypto_js_1.AES.encrypt(JSON.stringify({ id: data[0].admin_id, clientKey: authClient }), env.SECRET_KEY.toString()).toString();
                            // const position: boolean = (data[0].position === "admin") ? true : false;
                            res.json({ auth: true, i: encryptedId });
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
LoginRouter.post("/forget", (0, cors_1.default)(corsConfig), (req, res) => {
    const forgetData = req.body;
    if (forgetData.u !== "" && forgetData.u !== undefined) {
        conn.execute("SELECT * FROM user WHERE username = ? AND status = 'Active'", [forgetData.u], (err, result, field) => {
            const data = JSON.parse(JSON.stringify(result));
            if (data.length >= 1 && data[0].email !== undefined && data[0].email !== "") {
                const rdPassword = txt_generator_1.txtGenerator.Main();
                conn.execute("UPDATE user SET forget_password = ? WHERE id = ? AND status = ?", [rdPassword, data[0].id, "Active"], (e, r, f) => {
                    if (!e) {
                        const forgetMail = new forget_password_mail_1.ForgetPassword.Main(data[0].username, data[0].email);
                        if (forgetMail.Run(rdPassword, res)) {
                            // res.json({ result: true, status: "success", email: data[0].email });
                        }
                        else {
                            res.json({ result: false, status: "failed" });
                        }
                    }
                });
            }
            else {
                res.json({ result: false, status: "invalid" });
            }
        });
    }
    else {
        res.json({ result: false, status: "invalid" });
    }
});
LoginRouter.post("/admin/forget", (0, cors_1.default)(corsConfig), (req, res) => {
    const forgetData = req.body;
    if (forgetData.u !== "" && forgetData.u !== undefined) {
        conn.execute("SELECT * FROM admin WHERE a_username = ? AND a_status = 'Active'", [forgetData.u], (err, result, field) => {
            const data = JSON.parse(JSON.stringify(result));
            if (data.length >= 1 && data[0].a_email !== undefined && data[0].a_email !== "") {
                const rdPassword = txt_generator_1.txtGenerator.Main();
                conn.execute("UPDATE admin SET a_forget_password = ? WHERE admin_id = ? AND a_status = ?", [rdPassword, data[0].admin_id, "Active"], (e, r, f) => {
                    if (!e) {
                        const forgetMail = new forget_password_mail_1.ForgetPassword.Main(data[0].a_username, data[0].a_email);
                        if (forgetMail.Run(rdPassword, res)) {
                            // res.json({ result: true, status: "success", email: data[0].a_email });
                        }
                        else {
                            res.json({ result: false, status: "failed" });
                        }
                    }
                });
            }
            else {
                res.json({ result: false, status: "invalid" });
            }
        });
    }
    else {
        res.json({ result: false, status: "invalid" });
    }
});
exports.default = LoginRouter;
