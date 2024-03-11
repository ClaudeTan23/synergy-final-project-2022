"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuth = exports.Auth = void 0;
const crypto_js_1 = require("crypto-js");
const dotenv_1 = __importDefault(require("dotenv"));
const txt_generator_1 = require("./txt-generator");
var Auth;
(function (Auth) {
    class Main {
        constructor(req, res) {
            dotenv_1.default.config();
            this.req = req;
            this.res = res;
            this.env = process.env;
        }
        Session(db, clientSocket) {
            if (this.req.query.u !== undefined && this.req.query.u !== "") {
                try {
                    const key = crypto_js_1.AES.decrypt(this.req.query.u.toString(), this.env.SECRET_KEY);
                    const keyJson = JSON.parse(key.toString(crypto_js_1.enc.Utf8));
                }
                catch (error) {
                    this.res.json({ result: false });
                    return;
                }
                const key = crypto_js_1.AES.decrypt(this.req.query.u.toString(), this.env.SECRET_KEY);
                console.log(key.toString(crypto_js_1.enc.Utf8));
                const keyJson = JSON.parse(key.toString(crypto_js_1.enc.Utf8));
                if (keyJson.id !== "" && keyJson.id !== undefined && keyJson.clientKey !== "" && keyJson.clientKey !== undefined) {
                    if (keyJson.clientKey === this.env.SECRET_KEY_CLIENT) {
                        // const mysql: mysql2.Pool = db;
                        db.execute("SELECT * FROM user WHERE id = ? AND status = 'Active'", [keyJson.id], (error, result, fields) => {
                            if (!error) {
                                const r = JSON.parse(JSON.stringify(result));
                                const txtGenerate = txt_generator_1.txtGenerator.Main();
                                const jsonString = JSON.stringify({ token: txtGenerate, clientKey: this.env.SECRET_KEY_CLIENT });
                                const csrfToken = crypto_js_1.AES.encrypt(jsonString, this.env.SECRET_KEY).toString();
                                // const position: boolean = (r[0].position === "admin") ? true : false;
                                if (r.length >= 1) {
                                    db.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?", [keyJson.id, "Active"], (e, re, f) => {
                                        if (!e) {
                                            // clientSocket.IO.in(clientSocket.socket.id).socketsLeave("room41");
                                            if (this.req.query.s === "" || this.req.query.s === undefined) {
                                                let roomId = JSON.parse(JSON.stringify(re));
                                                const rId = roomId;
                                                roomId = roomId.map(e => `room${e.um_roomId}`);
                                                console.log(clientSocket.socket.id);
                                                clientSocket.socket.join(roomId);
                                                clientSocket.socket.join(keyJson.id.toString());
                                                // clientSocket.socket.join("announcement");
                                                const checkClientId = () => {
                                                    if (clientSocket.socket.clientUserId === undefined) {
                                                        clientSocket.socket.clientUserId = keyJson.id.toString();
                                                        if (clientSocket.socket.clientUserId === undefined) {
                                                            checkClientId();
                                                        }
                                                    }
                                                };
                                                setTimeout(() => {
                                                    db.execute("UPDATE user SET socket_exist = socket_exist + ?, online_status = ? WHERE status = ? AND id = ?", [1, "on", "Active", keyJson.id], (er, results, field) => {
                                                        if (!er) {
                                                            checkClientId();
                                                            clientSocket.IO.to(roomId).emit("online-status", { group: rId.map(e => { return { e, userId: keyJson.id.toString(), name: r[0].name }; }) });
                                                            this.res.json({ result: true, p: false, ct: csrfToken, i: r[0].id, icon: r[0].profile, name: r[0].name, username: r[0].username });
                                                        }
                                                        else {
                                                            this.res.json({ result: false });
                                                        }
                                                    });
                                                }, 100);
                                            }
                                            else {
                                                this.res.json({ result: true, p: false, ct: csrfToken, i: r[0].id, icon: r[0].profile, name: r[0].name, username: r[0].username });
                                            }
                                        }
                                        else {
                                            this.res.json({ result: false });
                                        }
                                    });
                                }
                                else {
                                    this.res.json({ result: false });
                                }
                            }
                            else {
                                this.res.json({ result: false });
                            }
                        });
                    }
                    else {
                        this.res.json({ result: false });
                    }
                }
                else {
                    this.res.json({ result: false });
                }
            }
            else {
                this.res.json({ result: false });
            }
        }
    }
    Auth.Main = Main;
})(Auth = exports.Auth || (exports.Auth = {}));
var AdminAuth;
(function (AdminAuth) {
    class Main {
        constructor(req, res) {
            dotenv_1.default.config();
            this.req = req;
            this.res = res;
            this.env = process.env;
        }
        Session(db, clientSocket) {
            if (this.req.query.u !== undefined && this.req.query.u !== "") {
                try {
                    const key = crypto_js_1.AES.decrypt(this.req.query.u.toString(), this.env.SECRET_KEY);
                    const keyJson = JSON.parse(key.toString(crypto_js_1.enc.Utf8));
                }
                catch (error) {
                    this.res.json({ result: false });
                    return;
                }
                const key = crypto_js_1.AES.decrypt(this.req.query.u.toString(), this.env.SECRET_KEY);
                console.log(key.toString(crypto_js_1.enc.Utf8));
                const keyJson = JSON.parse(key.toString(crypto_js_1.enc.Utf8));
                if (keyJson.id !== "" && keyJson.id !== undefined && keyJson.clientKey !== "" && keyJson.clientKey !== undefined) {
                    if (keyJson.clientKey === this.env.SECRET_KEY_CLIENT) {
                        // const mysql: mysql2.Pool = db;
                        db.execute("SELECT * FROM admin WHERE admin_id = ? AND a_status = 'Active'", [keyJson.id], (error, result, fields) => {
                            if (!error) {
                                const r = JSON.parse(JSON.stringify(result));
                                const txtGenerate = txt_generator_1.txtGenerator.Main();
                                const jsonString = JSON.stringify({ token: txtGenerate, clientKey: this.env.SECRET_KEY_CLIENT });
                                const csrfToken = crypto_js_1.AES.encrypt(jsonString, this.env.SECRET_KEY).toString();
                                // const position: boolean = (r[0].position === "admin") ? true : false;
                                if (r.length >= 1) {
                                    // clientSocket.socket.join("announcement");
                                    this.res.json({ result: true, ct: csrfToken, i: r[0].admin_id });
                                }
                                else {
                                    this.res.json({ result: false });
                                }
                            }
                            else {
                                this.res.json({ result: false });
                            }
                        });
                    }
                    else {
                        this.res.json({ result: false });
                    }
                }
                else {
                    this.res.json({ result: false });
                }
            }
            else {
                this.res.json({ result: false });
            }
        }
    }
    AdminAuth.Main = Main;
})(AdminAuth = exports.AdminAuth || (exports.AdminAuth = {}));
