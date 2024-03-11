"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationSender = void 0;
const confirmation_code_1 = require("./confirmation-code");
const mysql_1 = require("../database/mysql");
const register_mailer_1 = require("../mailer/register-mailer");
var ConfirmationSender;
(function (ConfirmationSender) {
    class Sender {
        constructor(status, username, password, email) {
            this.status = status;
            this.username = username;
            this.password = password;
            this.email = email;
        }
        Run() {
            if (this.status === "resent") {
                const Resent = () => {
                    const conn = new mysql_1.Mysql2.Initialize();
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.connection.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            Resent();
                        }
                        else {
                            conn.connection.execute(`UPDATE user SET confirmationCode = ?, password = ? WHERE username = ?`, [validateNumber, this.password, this.username], (error, results, field) => {
                                //Send confirmation code here
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "testing", undefined, `<a href=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                Resent();
            }
            else if (this.status === "newemailcode") {
                const newEmailCode = () => {
                    const conn = new mysql_1.Mysql2.Initialize();
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.connection.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            newEmailCode();
                        }
                        else {
                            conn.connection.execute(`UPDATE user SET password = ?, email = ?, confirmationCode = ? WHERE username = ?`, [this.password, this.email, validateNumber, this.username], (error, results, field) => {
                                //send confirmation code here to the new email the client provided
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "testing", undefined, `<a href=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                newEmailCode();
            }
            else if (this.status === "newaccount") {
                const newAccount = () => {
                    const conn = new mysql_1.Mysql2.Initialize();
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.connection.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (result.length >= 1) {
                            newAccount();
                        }
                        else {
                            conn.connection.execute("INSERT INTO user (username, password, email, confirmationCode, status) VALUES (?, ?, ?, ? ,?)", [this.username, this.password, this.email, validateNumber, 'PENDING'], (error, results, field) => {
                                //send confirmation code with new user
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "testing", undefined, `<a href=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                newAccount();
            }
        }
    }
    ConfirmationSender.Sender = Sender;
})(ConfirmationSender = exports.ConfirmationSender || (exports.ConfirmationSender = {}));
