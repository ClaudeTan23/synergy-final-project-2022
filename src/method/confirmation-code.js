"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationNumber = void 0;
var ConfirmationNumber;
(function (ConfirmationNumber) {
    class Code {
        constructor() {
            this.randomString = "abcdefghijklmnopqrstuvwxyz";
            this.randomInteger = "1234567890";
            this.confirmCodeLength = 16;
            this.confirmCode = "";
        }
        Output() {
            for (let i = 0; i < this.confirmCodeLength; i++) {
                const gamble = Math.floor((Math.random() * 4) + 1);
                if (gamble > 2) {
                    const Num = Math.floor((Math.random() * this.randomString.length));
                    this.confirmCode += this.randomString[Num];
                }
                else {
                    const Num = Math.floor((Math.random() * this.randomInteger.length));
                    this.confirmCode += this.randomInteger[Num];
                }
            }
            return this.confirmCode;
        }
    }
    ConfirmationNumber.Code = Code;
})(ConfirmationNumber = exports.ConfirmationNumber || (exports.ConfirmationNumber = {}));
