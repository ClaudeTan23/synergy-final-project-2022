import mysql2 from "mysql2";
import dotenv from "dotenv";

export namespace Mysql2 
{
    dotenv.config();

    export class Initialize
    {
        server  : string | undefined;
        username: string | undefined;
        password: string | undefined;
        database: string | undefined;
        connection: mysql2.Pool;

        constructor()
        {
            this.server   = process.env.DATABASE_SERVER;
            this.username = process.env.DATABASE_USERNAME;
            this.password = process.env.DATABASE_PASSWORD;
            this.database = process.env.DATABASE_NAME;

            this.connection = mysql2.createPool({
              host: this.server,
              user: this.username,
              password: this.password,
              database: this.database,
            });       
        }
    }
}