import { NavigateFunction } from "react-router-dom";

export namespace DashboardPropsState
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
        noEmptyText : boolean,
        blobMedia   : Array<any>,
        uploadActive: boolean,
    }
}