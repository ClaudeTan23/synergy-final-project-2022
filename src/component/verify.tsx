import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, NavigateFunction } from "react-router-dom";
import * as dotenv from "dotenv";
import { useCookies } from "react-cookie";
import "../css/home-dark.css";
import { io } from "socket.io-client";

export namespace Verify
{
    export function Main()
    {
        let LOAD: boolean = false;
        const location: { pathname, search } = useLocation();
        const API: string = process.env.REACT_APP_API_URL!.toString();
        let navigate: NavigateFunction = useNavigate();
        const [cookies, setCookie, removeCookie] = useCookies();
        let [ success, setSuccess ] = useState(false);
        let [ action, setAction ] = useState("");

        useEffect((): void => 
        {
            if(!LOAD)
            {
                LOAD = true;

                document.title = "Acoount Activation";

                const socketIO: any = io(`${process.env.REACT_APP_API_URL}`, {
                                        withCredentials: true,
                                        extraHeaders: { "cors-socket-headers": "meow" },
                                        transports: ["websocket"],
                                        upgrade: false
                                    });;

                socketIO.on("connect", (): void =>
                {
                    (async (): Promise<void> => 
                    {
                        const promise = await fetch(`${API}/verify${location.search}`)

                        if(promise.ok)
                        {
                            const identity: { auth: boolean, p: boolean, i: string } = await promise.json();

                            if(identity.auth && identity.i !== undefined)
                            {
                                if(identity.i === "active")
                                {
                                    // alert("active")
                                    setAction("Account Has Activated");
                                } else if(identity.i === "deactivate")
                                {
                                    // alert("deactivate")
                                    setAction("Account Has Deactivated");
                                }

                                setSuccess(true);

                            } else 
                            {
                                setSuccess(true);
                                setAction("Invalid Account");
                            }
                        }
                    })()
                });

                socketIO.on("deactivate-account", (data: any): void =>
                {
                    console.log(data);

                });

            }
        }, []);

        return (
            <div className="verify-container">
                <div>
                    {success ?
                    action
                    :
                    "PROCCESSING"
                    }
                </div>
            </div>
        )
    }
}