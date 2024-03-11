import React, { useEffect } from "react";
import { useLocation, useNavigate, NavigateFunction } from "react-router-dom";
import * as dotenv from "dotenv";
import { useCookies } from "react-cookie";

export namespace AdminVerify
{
    export function Main()
    {
        let LOAD: boolean = false;
        const location: { pathname, search } = useLocation();
        const API: string = process.env.REACT_APP_API_URL!.toString();
        let navigate: NavigateFunction = useNavigate();
        const [cookies, setCookie, removeCookie] = useCookies();

        useEffect((): void => 
        {
            if(!LOAD)
            {
                LOAD = true;

                (async (): Promise<void> => 
                {
                    const promise = await fetch(`${API}/averify${location.search}`)

                    if(promise.ok)
                    {
                        const identity: { auth: boolean, p: boolean, i: string } = await promise.json();

                        if(identity.auth && identity.i !== undefined)
                        {
                            removeCookie("aconnecti", { path: "/" });
                            setCookie("aconnecti", identity.i.toString(), { path: "/" });

                            navigate("/dashboard");

                        } else 
                        {
                            removeCookie("aconnecti", { path: "/" });
                            navigate("/admin/login");
                        }
                    }
                })()
            }
        });
    }
}