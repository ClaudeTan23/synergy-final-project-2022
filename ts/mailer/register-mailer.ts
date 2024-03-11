import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

export namespace NodeMailer
{
    export class Mailer 
    {
        public transport: nodemailer.Transporter;
        private host    : string | undefined;
        private port    : number;
        private secure  : boolean;
        private username: string | undefined;
        private password: string | undefined;

        constructor()
        {
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

        async SendMail(email: string, subject: string, text: string | undefined, html: string, res: any): Promise<void>
        {
            try
            {
                const info: nodemailer.SendMailOptions = await this.transport.sendMail({
                    from: this.username,
                    to: email,
                    subject: subject,
                    text: text,
                    html: html,
                });

                console.log(info);

                if(res !== undefined)
                {
                    res.json({ ok: "ok", result: true, status: "success", email: email, i: "active", auth: true });
                }

            } catch (error)
            {
                res.json({ ok: "fail", result: false, status: "fail", email: email });
                console.log(error);
            }
            
            
        }
    }
}