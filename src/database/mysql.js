"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mysql2 = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv_1 = __importDefault(require("dotenv"));
var Mysql2;
(function (Mysql2) {
    dotenv_1.default.config();
    class Initialize {
        constructor() {
            this.server = process.env.DATABASE_SERVER;
            this.username = process.env.DATABASE_USERNAME;
            this.password = process.env.DATABASE_PASSWORD;
            this.database = process.env.DATABASE_NAME;
            this.connection = mysql2_1.default.createPool({
                host: this.server,
                user: this.username,
                password: this.password,
                database: this.database,
            });
        }
    }
    Mysql2.Initialize = Initialize;
})(Mysql2 = exports.Mysql2 || (exports.Mysql2 = {}));
