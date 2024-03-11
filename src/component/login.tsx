import React, { createRef } from "react";
import { Location, useLocation, Link, NavigateFunction } from "react-router-dom";
import "../css/login.css";
import { LoginPropState } from "./props-state/login";
import dotenv from "dotenv";
import { useCookies } from "react-cookie";
import { Navigate, useNavigate } from "react-router-dom";


export namespace LoginInterface
{
    export class LoginContainer extends React.Component<LoginPropState.Props, LoginPropState.State>
    {

        private username: React.RefObject<HTMLInputElement>;
        private password: React.RefObject<HTMLInputElement>;
        private remember: React.RefObject<HTMLInputElement>;
        private forgetMail: React.RefObject<HTMLInputElement>;

        private recoverEmail: string;

        constructor(props: any)
        {
            super(props);
            
            this.state = { 
                userNotExist: false,
                networkError: false,
                fetchingAuth: false,
                forgetAuth  : null,
                forgetValid : true,
                emailLoader : false,
                closeForget : false,
            }

            this.username = createRef();
            this.password = createRef();
            this.remember = createRef();
            this.forgetMail = createRef();
            this.Login    = this.Login.bind(this);

            this.didChangeRemember = this.didChangeRemember.bind(this);
            this.ForgetPassword    = this.ForgetPassword.bind(this);

        }

        componentDidMount(): void 
        {
            if(this.props.cookie.remember !== "" && this.props.cookie.remember !== undefined)
            {
                this.username.current!.value = this.props.cookie.remember;
                this.remember.current!.checked = true;
            }
            
            document.title = "Login";
        }

        async ForgetPassword(): Promise<void> 
        {
            // if(this.username.current!.value.trim() !== "")
            // {
            //     this.setState(() => ({ emailLoader: true }));

            //     const promise = await fetch(`${process.env.REACT_APP_API_URL}/forget`, {
            //         method: "POST",
            //         headers: {
            //             "Content-type": "application/json"
            //         },
            //         body: JSON.stringify({ u: this.username.current!.value.trim() })
            //     });

            //     if(promise.ok)
            //     {
            //         const response: { result: boolean, status: string, email: string } = await promise.json();

            //         if(response.result && response.status === "success")
            //         {
            //             this.recoverEmail = response.email;

            //             this.setState(() => ({
            //                 forgetAuth: true,
            //                 userNotExist: false,
            //                 forgetValid: true,
            //                 emailLoader: false
            //             }));

            //         } else if(!response.result && response.status === "failed")
            //         {
            //             this.setState(() => ({
            //                 forgetAuth: false,
            //                 userNotExist: false,
            //                 forgetValid: true,
            //                 emailLoader: false
            //             }));

            //         } else if(!response.result && response.status === "invalid")
            //         {
            //             this.setState(() => ({
            //                 forgetAuth: null,
            //                 userNotExist: false,
            //                 forgetValid: false,
            //                 emailLoader: false
            //             }));
            //         }
            //     }
            // }

            if(this.forgetMail.current!.value.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g))
            {
                this.setState(() => ({ emailLoader: true }));


            }
            
        }

        async didChangeRemember(): Promise<void> 
        {
            if(!this.remember.current?.checked)
            {
                this.props.removeCookie("remember", { path: "/"});

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/forget`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ u: this.forgetMail.current!.value.trim() })
                });

                if(promise.ok)
                {
                    const response: { result: boolean, status: string, email: string } = await promise.json();

                    if(response.result && response.status === "success")
                    {
                        this.recoverEmail = response.email;

                        this.setState(() => ({
                            forgetAuth: true,
                            userNotExist: false,
                            forgetValid: true,
                            emailLoader: false
                        }));

                    } else if(!response.result && response.status === "failed")
                    {
                        this.setState(() => ({
                            forgetAuth: false,
                            userNotExist: false,
                            forgetValid: true,
                            emailLoader: false
                        }));

                    } else if(!response.result && response.status === "invalid")
                    {
                        this.setState(() => ({
                            forgetAuth: null,
                            userNotExist: false,
                            forgetValid: false,
                            emailLoader: false
                        }));
                    }
                }

            }
        }

        async Login(): Promise<void> 
        {
            if(this.username.current!.value.trim() !== "" && this.username.current!.value.trim() !== undefined && this.password.current!.value.trim() !== "" && this.password.current!.value.trim() !== undefined)
            {
                const username: string = this.username.current!.value.trim();
                const password: string = this.password.current!.value.trim();

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: username, password: password })
                });

                this.setState(() => ({
                    fetchingAuth: true
                }));

                if(promise.ok)
                {
                    const result: { auth: boolean, i: string | undefined } = await promise.json();

                    this.setState(() => ({
                        fetchingAuth: false
                    }));


                    if(result.auth && result.i !== "" && result.i !== undefined)
                    {
                        this.props.Navigate("/");

                        this.props.removeCookie("sconnecti", { path: "/" });
                        this.props.setCookie("sconnecti", result.i);

                        if(this.remember.current?.checked)
                        {
                            this.props.removeCookie("remember", { path: "/" });
                            this.props.setCookie("remember", username, { maxAge: 3600 * 24 * 365 });
                        }

                    } else 
                    {
                        this.setState(() => ({
                            userNotExist: true,
                            networkError: false,
                            forgetAuth  : null,
                            forgetValid : true
                        }));
                    }

                } else 
                {
                    this.setState(() => ({
                        networkError: true,
                        userNotExist: false,
                        forgetAuth  : null,
                        forgetValid : true
                    }));
                }

            }
        }

        render(): JSX.Element
        {
            return (
                <div className="main-index-container">
                    <div className="main-index-cardboard">
                        <div className="login-cardboard">
                            <div className="login-header">
                                <span>Connect around people</span>
                            </div>
                            <div className="login-body">
                                <span>
                                    ...where you can belong to a school club, a gaming group, or a worldwide art community. Where just you and a handful of friends can spend time together. A place that makes it easy to talk every day and hang out more often.
                                </span>
                            </div>
                            <div className="login-footer">
                                <div className="signup-link">
                                    <span>Doesn't have an account?</span>
                                </div>
                                <Link to="/register" className="signup-btn">
                                    <div>Sign up Here!</div>
                                </Link> 
                            </div>
                        </div>
                    </div>
                    <div className="login-container">
                        <div className="login-block">
                            <div className="signin-header">
                                <span>Sign In</span>
                            </div>
                            {this.state.userNotExist === true ? 
                            <div className="error-login-container">
                                <span>Username/Password are not match</span>
                            </div>
                            :
                            null
                            }

                            {this.state.forgetAuth === true ? 
                            <div className="error-login-container-relative">
                                <span style={{ padding: "0 4px" }}>Recover password has sent to</span>
                                <br/>
                                <span>{this.recoverEmail}</span>
                            </div>
                            :
                            this.state.forgetAuth === false ?
                            <div className="error-login-container">
                                <span>Email Failed</span>
                            </div>
                            :
                            null
                            }

                            {this.state.forgetValid === false ? 
                            <div className="error-login-container">
                                <span>Invalid Username</span>
                            </div>
                            :
                            null
                            }

                            <div className="signin-block">
                                <input className="input-box" type="text" id="user-login" autoComplete="off" required ref={this.username}/>
                                <label className="label-input" htmlFor="user-login">Username</label>
                            </div>
                            <div className="signin-block">
                                <input className="input-box" type="password" id="password-login" autoComplete="off" required ref={this.password}/>
                                <label className="label-input" htmlFor="password-login">Password</label>
                            </div>
                            <div className="signin-btn-block">
                                <div className="forget-block">
                                    {/* <span onPointerUp={this.ForgetPassword}>Forget Username/Password</span> */}
                                    <span onPointerUp={() => this.setState(() => ({ closeForget: true }))}>Forget Username/Password</span>
                                </div>
                                <div className="remember-block">
                                    <label htmlFor="rm-login">
                                        <div className="checkbox-container">
                                            <input type="checkbox" id="rm-login" ref={this.remember} onChange={this.didChangeRemember}/>
                                            <div className="checkbox-box"></div>
                                            <span>Remember Me</span>
                                        </div>
                                    </label>
                                </div>
                                <div className="login-btn-container">

                                    {this.state.fetchingAuth ?
                                    <div className="load-auth-container">
                                        <div className="load-spin-auth"></div>
                                        <span>Log in</span>
                                    </div>
                                    :
                                     <button onPointerUp={this.Login}>Log in</button>
                                    }
                                   
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.state.emailLoader ?
                    <div className="sending-email-back-forget">
                        <div className="sending-email-loader-forget">
                            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" fill="currentColor" className="envelope-heart" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l3.235 1.94a2.76 2.76 0 0 0-.233 1.027L1 5.384v5.721l3.453-2.124c.146.277.329.556.55.835l-3.97 2.443A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741l-3.968-2.442c.22-.28.403-.56.55-.836L15 11.105V5.383l-3.002 1.801a2.76 2.76 0 0 0-.233-1.026L15 4.217V4a1 1 0 0 0-1-1H2Zm6 2.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z"/>
                            </svg>
                            <div>Proccessing sending email</div>
                            <div>Please wait a moment...</div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.closeForget ?
                    <div className="forget-container">
                        {/* <div className="forget-block-email">
                            <div className="forget-block-email-header">
                                We have send you the username and password
                            </div>
                            <div className="forget-block-email-header">to</div>
                            <div className="forget-block-email-header-mail">Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur, est ipsam explicabo porro nam asperiores iusto non odit dicta amet, voluptates adipisci? Magnam ullam enim odit mollitia itaque officiis? Illum.</div>
                        </div> */}
                        <div className="forget-block-email">
                            <div className="forget-block-email-header">
                               Email Address
                            </div>
                            <div className="forget-block-email-header-mail-input">
                                <input type="text" autoComplete="off" ref={this.forgetMail} />
                            </div>
                            <div className="forget-block-email-header-mail-btn">
                                <div onClick={this.ForgetPassword}>Send</div>
                                <div onClick={() => this.setState(() => ({ closeForget: false }))}>Back</div>
                            </div>
                        </div>
                    </div>
                    :<></>
                    }

                </div>
            );
        }
    }

    export function Login(): JSX.Element 
    {
        const navigate: NavigateFunction = useNavigate();
        const [cookie, setCookie, removeCookie] = useCookies();

        return (
            <LoginContainer Navigate={navigate} setCookie={setCookie} removeCookie={removeCookie} cookie={cookie}/>
        );
    }
} 
