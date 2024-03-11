import { NavigateFunction } from "react-router-dom";

export namespace SettingUser 
{
    export interface Props 
    {
        Navigate    : NavigateFunction,
        cookie      : any,
        setCookie   : any,
        removeCookie: any,
        Location    : any
    }

    export interface State 
    {
        name          : string,
        friends       : number,
        dateJoin      : string,
        userIcon      : string,
        userBackground: string,
        email         : string, 
        username      : string,
        password      : string,
        changeName    : boolean,
        changeUserIcon: boolean,
        changeUserBg  : boolean,
        changePassword: boolean,
        uploadSuccess : boolean,
        updateSuccess : boolean,
        checkNameInput: boolean,
        nameEmpty     : boolean,
        checkPassword : boolean,
        confrimPw     : boolean,
    }
}