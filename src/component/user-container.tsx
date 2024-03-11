import React from "react";
import { Link } from "react-router-dom";
import "../css/dark-user-container.css";

export namespace UserContainer 
{
    export const User = (props: any) => {

        return (
            <div className="hover-user-container">
                <div className="hover-header-block">
                    <div className="hover-user-icon-block">
                        <svg viewBox="0 0 100 100" width="80" height="80">
                            <title>{props.name}</title>
                            <defs>
                                <circle id="circle" cx="80" cy="80" r="49" vectorEffect="non-scaling-stroke"/>
                                <clipPath id="circle-clip">
                                <use xlinkHref="#circle"/>
                                </clipPath>
                            </defs>
                            <g clipPath="url(#circle-clip)">
                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${props.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                            </g>
                        </svg>
                    </div>
                    <div className="hover-content-block">
                        <div>{props.name}</div>
                        <div>Joined in <span>{props.dateJoin.split("/")[0]}</span></div>
                    </div>
                </div>
            </div>
        )
    };
}