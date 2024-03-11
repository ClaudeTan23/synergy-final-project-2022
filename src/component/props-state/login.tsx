import { Location, NavigateFunction } from "react-router-dom";
import { useCookies } from "react-cookie";

export namespace LoginPropState 
{
    export interface Props 
    {
        Navigate    : NavigateFunction,
        cookie      : any,
        setCookie   : any,
        removeCookie: any
    }

    export interface State 
    {
        userNotExist : boolean,
        networkError : boolean,
        fetchingAuth : boolean,
        forgetAuth   : boolean | null,
        forgetValid  : boolean,
        emailLoader  : boolean,
        closeForget  : boolean,
    }
}