import { ConfirmationNumber } from "../method/confirmation-code";
import { Mysql2 } from "../database/mysql";
import { FieldPacket, QueryError, RowDataPacket } from "mysql2";
import { Model } from "../database/user-model";
import { NodeMailer } from "./register-mailer";
import mysql2 from "mysql2";


export namespace ConfirmationSender
{
    export class Sender 
    {
        private status  : string;
        private username: string;
        private password: string;
        private email   : string;

        constructor(status: string, username: string, password: string, email: string)
        {
            this.status   = status;
            this.username = username;
            this.password = password;
            this.email    = email;
        }

        Run(conn: mysql2.Pool, res: any): void
        {
            if(this.status === "resent")
            {
                const Resent = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void =>
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(row.length >= 1)
                        {
                            Resent();

                        } else 
                        {
                            conn.execute(`UPDATE user SET confirmationCode = ?, password = ? WHERE username = ?`, [validateNumber, this.password, this.username], (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void => 
                            {
                                //Send confirmation code here
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(process.env.ADMIN_EMAIL!.toString(), "Registration Verification for social connect and please don't reply and leak to other user", undefined, 
                                `
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
                                `,
                                res
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );

                            })
                        }

                    });
                }

                Resent();

            } else if(this.status === "newemailcode")
            {
                const newEmailCode = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void => 
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(row.length >= 1)
                        {
                            newEmailCode();

                        } else 
                        {
                            conn.execute(`UPDATE user SET password = ?, email = ?, confirmationCode = ? WHERE username = ?`,[this.password, this.email, validateNumber, this.username], (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                //send confirmation code here to the new email the client provided
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(
                                  process.env.ADMIN_EMAIL!.toString(),
                                  "Registration Verification for social connect and please don't reply and leak to other user",
                                  undefined,
                                  `
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
                                `,
                                  res
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );
                            });
                        }
                    });
                }

                newEmailCode();

            } else if(this.status === "newaccount")
            {
                const newAccount = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM user WHERE confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void =>
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(result.length >= 1 )
                        {
                            newAccount();
                            
                        } else 
                        {
                            const date: Date = new Date();
                            const time: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}/${date.getHours()}:${date.getMinutes()}`;

                            conn.execute("INSERT INTO user (username, password, forget_password, name, profile, background, gender, email, confirmationCode, status, darkmode, date_join, position, online_status) VALUES (?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?, ?, ?, ?)", 
                            [this.username, this.password, "none", this.username, 'blankpf.jpg', 'blankbg.jpg', '-', this.email, validateNumber, 'PENDING', 'off', time, 'user', 'off'],
                            (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                //send confirmation code with new user
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(process.env.ADMIN_EMAIL!.toString(), "Registration Verification for social connect and please don't reply and leak to other user", undefined, 
                                `
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
                                `,
                                res
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );

                            })
                        }
                    });
                }

        

                newAccount();
            }
        }
    }
}


export namespace AdminConfirmationSender
{
    export class Sender 
    {
        private status  : string;
        private username: string;
        private password: string;
        private email   : string;

        constructor(status: string, username: string, password: string, email: string)
        {
            this.status   = status;
            this.username = username;
            this.password = password;
            this.email    = email;
        }

        Run(conn: mysql2.Pool): void
        {
            if(this.status === "resent")
            {
                const Resent = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void =>
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(row.length >= 1)
                        {
                            Resent();

                        } else 
                        {
                            conn.execute(`UPDATE admin SET a_confirmationCode = ?, a_password = ? WHERE a_username = ?`, [validateNumber, this.password, this.username], (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void => 
                            {
                                //Send confirmation code here
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(
                                  this.email,
                                  "Registration Verification for social connect and please don't reply and leak to other user",
                                  undefined,
                                  `
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
                                `,
                                  undefined
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );

                            })
                        }

                    });
                }

                Resent();

            } else if(this.status === "newemailcode")
            {
                const newEmailCode = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void => 
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(row.length >= 1)
                        {
                            newEmailCode();

                        } else 
                        {
                            conn.execute(`UPDATE admin SET a_password = ?, a_email = ?, a_confirmationCode = ? WHERE a_username = ?`,[this.password, this.email, validateNumber, this.username], (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                //send confirmation code here to the new email the client provided
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(this.email, "Registration Verification for social connect and please don't reply and leak to other user", undefined, 
                                `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Click this link to complete your account registration <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}>Confirmation user account</a> to verified.
                                    </div>
                                </div>
                                `,
                                undefined
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );
                            });
                        }
                    });
                }

                newEmailCode();

            } else if(this.status === "newaccount")
            {
                const newAccount = (): void =>
                {
                    const validateNumber: string = new ConfirmationNumber.Code().Output();

                    conn.execute("SELECT * FROM admin WHERE a_confirmationCode = ?", [validateNumber], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]): void =>
                    {
                        const row: Array<Model.User> = JSON.parse(JSON.stringify(result));

                        if(result.length >= 1 )
                        {
                            newAccount();
                            
                        } else 
                        {
                            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

                            conn.execute("INSERT INTO admin (a_username, a_password, a_forget_password, a_email, a_confirmationCode, a_status, a_date_join) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                            [this.username, this.password, "none", this.email, validateNumber, 'PENDING', time],
                            (error: QueryError | null, results: RowDataPacket[], field: FieldPacket[]): void =>
                            {
                                //send confirmation code with new user
                                const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

                                mailer.SendMail(this.email, "Registration Verification for social connect and please don't reply and leak to other user", undefined, 
                                `
                                <div style="flex-direction: column;width: 100%; height: auto; display: flex;">
                                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                                        Click this link to complete your account registration <a href=${process.env.CLIENT_URL}/averify?u=${this.username}&c=${validateNumber}>Confirmation user account</a> to verified.
                                    </div>
                                </div>
                                `,
                                undefined
                                );

                                console.log(
                                  `<a href=${process.env.CLIENT_URL}/verify?u=${this.username}&c=${validateNumber}>Confirmation user account</a>`
                                );

                            })
                        }
                    });
                }

        

                newAccount();
            }
        }
    }
}