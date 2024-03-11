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
            }

            this.username = createRef();
            this.password = createRef();
            this.remember = createRef();
            this.Login    = this.Login.bind(this);

            this.didChangeRemember = this.didChangeRemember.bind(this);
            this.ForgetPassword    = this.ForgetPassword.bind(this);
        }

        componentDidMount(): void 
        {
            if(this.props.cookie.adminremember !== "" && this.props.cookie.adminremember !== undefined)
            {
                this.username.current!.value = this.props.cookie.adminremember;
                this.remember.current!.checked = true;
            }
        }

        async ForgetPassword(): Promise<void> 
        {
            if(this.username.current!.value.trim() !== "")
            {
                const promise = await fetch(`${process.env.REACT_APP_API_URL}/admin/forget`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ u: this.username.current!.value.trim() })
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
                            forgetValid: true
                        }));

                    } else if(!response.result && response.status === "failed")
                    {
                        this.setState(() => ({
                            forgetAuth: false,
                            userNotExist: false,
                            forgetValid: true
                        }));

                    } else if(!response.result && response.status === "invalid")
                    {
                        this.setState(() => ({
                            forgetAuth: null,
                            userNotExist: false,
                            forgetValid: false
                        }));
                    }
                }
            }
            
        }

        didChangeRemember(): void 
        {
            if(!this.remember.current?.checked)
            {
                this.props.removeCookie("adminremember", { path: "/admin"});
                console.log(123)
            }
        }

        async Login(): Promise<void> 
        {
            if(this.username.current!.value.trim() !== "" && this.username.current!.value.trim() !== undefined && this.password.current!.value.trim() !== "" && this.password.current!.value.trim() !== undefined)
            {
                const username: string = this.username.current!.value.trim();
                const password: string = this.password.current!.value.trim();

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/admin/login`, {
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
                        this.props.Navigate("/dashboard");

                        this.props.removeCookie("aconnecti", { path: "/" });
                        this.props.setCookie("aconnecti", result.i , { path: "/" });

                        if(this.remember.current?.checked)
                        {
                            this.props.removeCookie("adminremember", { path: "/" });
                            this.props.setCookie("adminremember", username, { maxAge: 3600 * 24 * 365 });
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
                                <span>Administration</span>
                            </div>
                            <div className="login-body">
                                <span>
                                    Sign in page
                                </span>
                            </div>
                            <div className="login-footer">
                                <div className="signup-link">
                                    <span>Doesn't have an account?</span>
                                </div>
                                <Link to="/admin/register" className="signup-btn">
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
                                    <span onPointerUp={this.ForgetPassword}>Forget Username/Password</span>
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
