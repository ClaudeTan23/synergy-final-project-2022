import React, { useRef } from "react";
import { Outlet, Link, useLocation, Routes, Route} from "react-router-dom";
import "../css/background.css";
import "../css/transition.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as login from "./login.tsx";
import * as Register from "./register.tsx";

export namespace Background 
{

    type Props = {
        Message: string
    }

    type State = {
        Location: string
    }

    export function Container(): JSX.Element
    {

        const location = useLocation();

        const { key } = location;
        const nodeRef: React.RefObject<HTMLDivElement> = React.createRef();

        return (
            <div className="main-index-background">
                <div className="header-container">
                    <div className="header-block">
                        <div className="header-title header-one">
                            Social
                        </div>
                        <div className="header-title header-two">
                            Connect
                        </div>
                    </div>
                </div>
                <TransitionGroup className="main-index-container-transition">
                    <CSSTransition
                    key={key}
                    nodeRef={nodeRef}
                    timeout={1000}
                    classNames="item"
        
                    >
                        <div ref={nodeRef} key={key} className="transition-container">
                            {/* <Outlet /> */}
                            <Routes location={location}>
                                <Route path="login" element={<login.LoginInterface.Login />} />
                                <Route path="register" element={<Register.RegisterInterface.Container />} />
                            </Routes>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
                {/* <div className="main-index-container">
                    <div className="main-index-cardboard">
                        <div className="login-cardboard">
                            <div className="testing">testing</div>
                        </div>
                    </div>
                    <div className="login-container">
                        <div className="login-block">
                            <Link to="register">Register</Link>
                        </div>
                    </div>
                </div> */}
  
                {/* <div className="animation-wave-block">
                    <svg id="wave" className="wave" viewBox="0 0 1440 240" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <defs><linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                            <stop stopColor="rgba(107.509, 15.451, 234.879, 1)" offset="0%"></stop><stop stopColor="rgba(25.556, 230.325, 229.632, 1)" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <path className="wave path" fill="url(#sw-gradient-0)" d="M0,120L21.8,108C43.6,96,87,72,131,84C174.5,96,218,144,262,136C305.5,128,349,64,393,60C436.4,56,480,112,524,120C567.3,128,611,88,655,80C698.2,72,742,96,785,96C829.1,96,873,72,916,72C960,72,1004,96,1047,124C1090.9,152,1135,184,1178,168C1221.8,152,1265,88,1309,72C1352.7,56,1396,88,1440,104C1483.6,120,1527,120,1571,100C1614.5,80,1658,40,1702,36C1745.5,32,1789,64,1833,64C1876.4,64,1920,32,1964,24C2007.3,16,2051,32,2095,52C2138.2,72,2182,96,2225,100C2269.1,104,2313,88,2356,80C2400,72,2444,72,2487,68C2530.9,64,2575,56,2618,48C2661.8,40,2705,32,2749,36C2792.7,40,2836,56,2880,56C2923.6,56,2967,40,3011,48C3054.5,56,3098,88,3120,104L3141.8,120L3141.8,240L3120,240C3098.2,240,3055,240,3011,240C2967.3,240,2924,240,2880,240C2836.4,240,2793,240,2749,240C2705.5,240,2662,240,2618,240C2574.5,240,2531,240,2487,240C2443.6,240,2400,240,2356,240C2312.7,240,2269,240,2225,240C2181.8,240,2138,240,2095,240C2050.9,240,2007,240,1964,240C1920,240,1876,240,1833,240C1789.1,240,1745,240,1702,240C1658.2,240,1615,240,1571,240C1527.3,240,1484,240,1440,240C1396.4,240,1353,240,1309,240C1265.5,240,1222,240,1178,240C1134.5,240,1091,240,1047,240C1003.6,240,960,240,916,240C872.7,240,829,240,785,240C741.8,240,698,240,655,240C610.9,240,567,240,524,240C480,240,436,240,393,240C349.1,240,305,240,262,240C218.2,240,175,240,131,240C87.3,240,44,240,22,240L0,240Z"></path>
                    </svg>   
                </div>   */}
            </div>
        );
    }
}