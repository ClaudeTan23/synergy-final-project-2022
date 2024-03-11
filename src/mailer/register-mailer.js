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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMailer = void 0;
const nodemailer = __importStar(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
var NodeMailer;
(function (NodeMailer) {
    class Mailer {
        constructor() {
            dotenv.config();
            this.host = process.env.EMAIL_SMTP_SERVER;
            this.port = Number(process.env.SMTP_PORT);
            this.secure = (process.env.SMTP_SECURE === "true") ? true : false;
            this.username = process.env.EMAIL_USERNAME;
            this.password = process.env.EMAIL_PASSWORD;
            this.transport = nodemailer.createTransport({
                host: this.host,
                port: this.port,
                secure: this.secure,
                auth: {
                    user: this.username,
                    pass: this.password
                }
            });
        }
        async SendMail(email, subject, text, html, res) {
            try {
                const info = await this.transport.sendMail({
                    from: this.username,
                    to: email,
                    subject: subject,
                    text: text,
                    html: html,
                });
                console.log(info);
                if (res !== undefined) {
                    res.json({ ok: "ok", result: true, status: "success", email: email, i: "active", auth: true });
                }
            }
            catch (error) {
                res.json({ ok: "fail", result: false, status: "fail", email: email });
                console.log(error);
            }
        }
    }
    NodeMailer.Mailer = Mailer;
})(NodeMailer = exports.NodeMailer || (exports.NodeMailer = {}));
