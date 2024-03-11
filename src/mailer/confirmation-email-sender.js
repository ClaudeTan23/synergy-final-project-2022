"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConfirmationSender = exports.ConfirmationSender = void 0;
const confirmation_code_1 = require("../method/confirmation-code");
const register_mailer_1 = require("./register-mailer");
var ConfirmationSender;
(function (ConfirmationSender) {
    class Sender {
        constructor(status, username, password, email) {
            this.status = status;
            this.username = username;
            this.password = password;
            this.email = email;
        }
        Run(conn, res) {
            if (this.status === "resent") {
                const Resent = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            Resent();
                        }
                        else {
                            conn.execute(`UPDATE user SET confirmationCode = ?, password = ? WHERE username = ?`, [validateNumber, this.password, this.username], (error, results, field) => {
                                //Send confirmation code here
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(process.env.ADMIN_EMAIL.toString(), "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex; flex-wrap: wrap;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Username: ${this.username}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Email: ${this.email}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px; display: flex; justify-content: center; align-items: center; gap: 10px">
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=active" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Active this account</div>
                                        </a>
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=deactivate" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Deactivate this account</div>
                                        </a>
                                    </div>
                                </div>
                                `, res);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                Resent();
            }
            else if (this.status === "newemailcode") {
                const newEmailCode = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            newEmailCode();
                        }
                        else {
                            conn.execute(`UPDATE user SET password = ?, email = ?, confirmationCode = ? WHERE username = ?`, [this.password, this.email, validateNumber, this.username], (error, results, field) => {
                                //send confirmation code here to the new email the client provided
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(process.env.ADMIN_EMAIL.toString(), "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex; flex-wrap: wrap;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Username: ${this.username}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Email: ${this.email}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px; display: flex; justify-content: center; align-items: center; gap: 10px">
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=active" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Active this account</div>
                                        </a>
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=deactivate" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Deactivate this account</div>
                                        </a>
                                    </div>
                                </div>
                                `, res);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                newEmailCode();
            }
            else if (this.status === "newaccount") {
                const newAccount = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (result.length >= 1) {
                            newAccount();
                        }
                        else {
                            const date = new Date();
                            const time = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;
                            conn.execute("INSERT INTO user (username, password, forget_password, name, profile, background, gender, email, confirmationCode, status, darkmode, date_join, position, online_status) VALUES (?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?, ?, ?, ?)", [this.username, this.password, "none", this.username, 'blankpf.jpg', 'blankbg.jpg', '-', this.email, validateNumber, 'PENDING', 'off', time, 'user', 'off'], (error, results, field) => {
                                //send confirmation code with new user
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(process.env.ADMIN_EMAIL.toString(), "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex; flex-wrap: wrap;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Username: ${this.username}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Email: ${this.email}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px; display: flex; justify-content: center; align-items: center; gap: 10px">
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=active" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Active this account</div>
                                        </a>
                                        <a href="${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}&action=deactivate" style="text-decoration: none;">
                                            <div style="padding: 10px; background-color: #202020; color: #E2E1F9;">Deactivate this account</div>
                                        </a>
                                    </div>
                                </div>
                                `, res);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
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
var AdminConfirmationSender;
(function (AdminConfirmationSender) {
    class Sender {
        constructor(status, username, password, email) {
            this.status = status;
            this.username = username;
            this.password = password;
            this.email = email;
        }
        Run(conn) {
            if (this.status === "resent") {
                const Resent = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            Resent();
                        }
                        else {
                            conn.execute(`UPDATE admin SET a_confirmationCode = ?, a_password = ? WHERE a_username = ?`, [validateNumber, this.password, this.username], (error, results, field) => {
                                //Send confirmation code here
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Username: ${this.username}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Username: ${this.email}
                                    </div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px; display: flex; justify-content: center; align-items: center; gap: 10px">
                                        <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}><button>Active this account</button></a>
                                        <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}><button>Deactivate this account</button></a>
                                    </div>
                                </div>
                                `, undefined);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                Resent();
            }
            else if (this.status === "newemailcode") {
                const newEmailCode = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (row.length >= 1) {
                            newEmailCode();
                        }
                        else {
                            conn.execute(`UPDATE admin SET a_password = ?, a_email = ?, a_confirmationCode = ? WHERE a_username = ?`, [this.password, this.email, validateNumber, this.username], (error, results, field) => {
                                //send confirmation code here to the new email the client provided
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Click this link to complete your account registration <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}>Confirmation user account</a> to verified.
                                    </div>
                                </div>
                                `, undefined);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                newEmailCode();
            }
            else if (this.status === "newaccount") {
                const newAccount = () => {
                    const validateNumber = new confirmation_code_1.ConfirmationNumber.Code().Output();
                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err, result, fields) => {
                        const row = JSON.parse(JSON.stringify(result));
                        if (result.length >= 1) {
                            newAccount();
                        }
                        else {
                            const time = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
                            conn.execute("INSERT INTO admin (a_username, a_password, a_forget_password, a_email, a_confirmationCode, a_status, a_date_join) VALUES (?, ?, ?, ?, ?, ?, ?)", [this.username, this.password, "none", this.email, validateNumber, 'PENDING', time], (error, results, field) => {
                                //send confirmation code with new user
                                const mailer = new register_mailer_1.NodeMailer.Mailer();
                                mailer.SendMail(this.email, "Registration Verification for social connect and please don't reply and leak to other user", undefined, `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Click this link to complete your account registration <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}>Confirmation user account</a> to verified.
                                    </div>
                                </div>
                                `, undefined);
                                console.log(`<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`);
                            });
                        }
                    });
                };
                newAccount();
            }
        }
    }
    AdminConfirmationSender.Sender = Sender;
})(AdminConfirmationSender = exports.AdminConfirmationSender || (exports.AdminConfirmationSender = {}));
