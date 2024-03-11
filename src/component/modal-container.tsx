import React from "react";
import "../css/home-dark.css";

export namespace Modal 
{
    export function Container(props: { title: string }): JSX.Element
    {
        return (
            <div className="model-block-alert">
                <span>{props.title}</span>
            </div>
        )
    }
}