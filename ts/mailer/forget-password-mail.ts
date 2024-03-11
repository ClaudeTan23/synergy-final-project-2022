import { NodeMailer } from "./register-mailer";
import * as dotenv from "dotenv";
import { AES, enc } from "crypto-js";



export namespace ForgetPassword
{
    export class Main
    {
        private username: string;
        private email   : string;


        constructor(username: string, email: string)
        {
            this.username = username;
            this.email    = email;
        }

        Run(resetCode: string, res: any): boolean 
        {
            const mailer: NodeMailer.Mailer = new NodeMailer.Mailer();

            mailer.SendMail(
              this.email,
              "Please don't share this temporary password, dont'reply to this email as well",
              undefined,
              `
                <div style="width: 100%; height: auto;">
                    <div style="font-weight: 700; font-size: 28px; background-color: #2A2A2A; color: #E2E1F9; padding: 20px 0; width: 100%; display: flex; justify-content: center">Social Connect</div>
                    <div style="background-color: #A4A4A4; color: #2C2D2F; width: 100%; padding: 10px 0; height: 100px; font-weight: 500; font-size: 18px;">
                        Your password is <span style="color: #405BBC; font-weight: 600;">${resetCode}</span>, this password will be gone after you use this password or not to login. please change your password once you login.
                    </div>
                </div>
                `,
              res
            );

            return true;
        }
    }
}