"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txtGenerator = void 0;
var txtGenerator;
(function (txtGenerator) {
    function Main() {
        const txt = "abcdefghijklmnopqrstuvwxyz";
        let rText = "";
        for (let i = 0; i < txt.length; i++) {
            rText += txt[Math.floor(Math.random() * txt.length)];
        }
        return rText;
    }
    txtGenerator.Main = Main;
})(txtGenerator = exports.txtGenerator || (exports.txtGenerator = {}));
