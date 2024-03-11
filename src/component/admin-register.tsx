import React, { createRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/admin-register.css";
import * as PropsState from "./props-state/register";
import * as dotenv from "dotenv";

export namespace RegisterInterface
{

    interface LocationObj
    {
        pathname: string,
        search  : string,
        hash    : string,
        key     : string
    };
    

    export function Container(): JSX.Element
    {
        const Location: LocationObj = useLocation();

        return (
            <RegisterContainer Location={Location} asd="asd"/>
        );
    }

    export class RegisterContainer extends React.Component<{Location: LocationObj, asd: string}, PropsState.RegisterPropsState.State>
    {

        private LOADED: boolean = false;
        private API_URL: string | undefined = process.env.REACT_APP_API_URL;
        private username : React.RefObject<HTMLInputElement>;
        private password : React.RefObject<HTMLInputElement>;
        private rPassword: React.RefObject<HTMLInputElement>;
        private email    : React.RefObject<HTMLInputElement>;
        private submitBtn: React.RefObject<HTMLButtonElement>;

        private checkTimer: ReturnType<typeof setTimeout>;
        readonly PasswordMin: Number = 8;
        readonly UsernameMin: Number = 6;

        private repeatPasswordStatus: boolean;
        private emailStatus: boolean;

        private BackVerifying: boolean = false;
        private usernameValue: string;
        private passwordValue: string;
        private emailValue   : string;

        constructor(props: any)
        {
            super(props);

            this.username  = createRef();
            this.password  = createRef();
            this.rPassword = createRef();
            this.email     = createRef();
            this.submitBtn = createRef();

            this.Submit           = this.Submit.bind(this);
            this.CheckExistedUser = this.CheckExistedUser.bind(this);
            this.CheckPassword    = this.CheckPassword.bind(this);
            this.CheckEmail       = this.CheckEmail.bind(this);
            this.CheckRPassword   = this.CheckRPassword.bind(this);
            this.BackVerify       = this.BackVerify.bind(this);
            this.Resend           = this.Resend.bind(this);

            this.state = {
                cUsername: null,
                cPassword : null,
                cRPassword: null,
                cEmail    : null,
                verifying : false,
                resent    : false,
                invalid   : false,
            }

            // this.saveOldData.username = "";
            // this.saveOldData.password = "";
            // this.saveOldData.email    = "";
            
        }

        componentDidMount(): void
        {
            
            if(!this.LOADED)
            {
                console.log(this.props.Location);
                this.LOADED = true;
            }

        }

        componentDidUpdate(): void 
        {
            if(this.BackVerifying)
            {
                this.username.current!.value  = this.usernameValue;
                this.password.current!.value  = this.passwordValue;
                this.rPassword.current!.value = this.passwordValue;
                this.email.current!.value     = this.emailValue;

                this.BackVerifying = false;

            }
        }


        CheckExistedUser(): void 
        {

            if(this.checkTimer !== undefined)
            {
                clearInterval(this.checkTimer);
            } 

            this.setState(() => ({
                cUsername: "loading"
            }));

            this.checkTimer = setTimeout( async (): Promise<void> => {
                
                if(this.username.current!.value.trim() !== "")
                {

                    if(this.username.current!.value.trim().length >= this.UsernameMin)
                    {
                        const checkSpecial: RegExp = /[ `!@#$%^&*()?+\=\[\]{};':"\\|,.<>\/?~]/;

                        if(checkSpecial.test(this.username.current!.value.trim()))
                        {
                            this.setState(() => ({
                                cUsername: false
                            }));
                        } else 
                        {

                            const promise: Response = await fetch(`${this.API_URL}/existadmin?username=${this.username.current!.value.trim()}`);
                
                        if(promise.ok)
                        {
                            const user: { usernameExisted: boolean } = await promise.json();

                                if(user.usernameExisted)
                                {
                                    this.setState(() => ({
                                        cUsername: false
                                    }));

                                } else {
                                    this.setState(() => ({
                                        cUsername: true
                                    }));
                                            
                                }
                            } else {

                                alert("Network Error");

                            }

                        }

                    } else 
                    {
                        this.setState(() => ({
                            cUsername: false
                        }));
                    }
                
                
                }
               
            }, 2000);


            if(this.username.current!.value.trim() === "")
            {
                this.setState(() => ({
                    cUsername: null
                }));
            }
        }

        CheckPassword(): void 
        {
            if(this.password.current!.value.trim().toString().length < this.PasswordMin)
            {
                this.setState(() => ({
                    cPassword: false
                }));

            } else 
            {
                this.setState(() => ({
                    cPassword: true
                }));
            }

        }

        CheckRPassword(): void 
        {
            if(this.rPassword.current!.value.trim().length > 0)
            {
                if(this.rPassword.current!.value.trim() === this.password.current!.value.trim())
                {
                    this.repeatPasswordStatus = true

                } else 
                {
                    this.repeatPasswordStatus = false;
                }

            } else 
            {
                this.repeatPasswordStatus = false;
            }

        }

        CheckEmail(): void
        {
            if(this.email!.current!.value.trim().length > 0)
            {
                if(this.email.current!.value.trim().match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g))
                {
                    this.emailStatus = true;

                } else 
                {
                    this.emailStatus = false;
                }

            } else {

                this.emailStatus = false;
            }

        }

        Submit(): void
        {
            if(this.state.cUsername === true && this.state.cPassword === true && this.repeatPasswordStatus === true && this.emailStatus === true)
            {
                (async (): Promise<void> => 
                {
                    const username: string = this.username.current!.value.trim();
                    const password: string = this.password.current!.value.trim();
                    const email: string    = this.email.current!.value.trim();

                    const promise = await fetch(`${this.API_URL}/admin/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ username: username, password: password, email: email })
                    });

                    if(promise.ok)
                    {
                        const result: {ok: string} = await promise.json();

                        if(result.ok === "ok")
                        {
                            this.usernameValue = username;
                            this.passwordValue = password;
                            this.emailValue    = email;

                            this.setState(() => ({
                                verifying: true,
                                cUsername: true,
                                cPassword: true,
                                cRPassword: true,
                                cEmail: true
                            }));

                        }

                    } else {

                        alert("network error")
                    }
                })();


                
            } else 
            {
                if(!this.state.cUsername)
                {
                    this.setState(() => ({
                        cUsername: false
                    }));

                } else {
                    this.setState(() => ({
                        cUsername: true
                    }));
                }

                if(!this.state.cPassword)
                {
                    this.setState(() => ({
                        cPassword: false
                    }));

                } else {
                    this.setState(() => ({
                        cPassword: true
                    }));
                }

                if(!this.repeatPasswordStatus)
                {
                    this.setState(() => ({
                        cRPassword: false
                    }));

                } else {
                    this.setState(() => ({
                        cRPassword: true
                    }));
                }

                if(!this.emailStatus)
                {
                    this.setState(() => ({
                        cEmail: false
                    }));

                } else {
                    this.setState(() => ({
                        cEmail: true
                    }));
                }
            }
        }

        BackVerify(): void 
        {

            this.BackVerifying = true;

            this.setState(() => ({
                verifying: false
            }));

        }

        Resend(): void 
        {
            (async (): Promise<void> => 
            {
                const promise = await fetch(`${this.API_URL}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({username: this.usernameValue, password: this.passwordValue, email: this.emailValue})
                });

                const result: {ok: string} = await promise.json();

                if(promise.ok)
                {
                    if(result.ok === "ok")
                    {
                        this.setState(() => ({ resent: true }));

                        setTimeout((): void =>
                        {
                            this.setState(() => ({ resent: false }));
                        }, 5000);


                    } else if(result.ok === "invalid")
                    {
                        this.setState(() => ({ invalid: true }));

                        setTimeout((): void =>
                        {
                            this.setState(() => ({ invalid: false }));
                        }, 5000);
                    }
                }
            })()
        }

        render(): JSX.Element
        {
            return (
                <div className="main-index-container">
                    <div className="main-index-cardboard">
                        <div className="register-cardboard">
                            <div className="register-header">
                                <span>Administration</span>
                            </div>
                            <div className="register-content">
                                <span>Registration</span>
                            </div>
                            <div className="register-footer">
                                <div className="animation-footer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor"  viewBox="0 0 16 16">
                                        <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1z"/>
                                        <path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729c.14.09.266.19.373.297.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466.206.875.34 1.78.364 2.606.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527-1.627 0-2.496.723-3.224 1.527-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.34 2.34 0 0 1 .433-.335.504.504 0 0 1-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a13.748 13.748 0 0 0-.748 2.295 12.351 12.351 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.354 12.354 0 0 0-.339-2.406 13.753 13.753 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27-1.036 0-2.063.091-2.913.27z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
                                        <path fillRule="evenodd" d="M12 3v10h-1V3h1z"/>
                                        <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"/>
                                        <path fillRule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"/>
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                    </svg>
                                </div>
                                <div className="register-btn-container">
                                    <Link to="/admin/login">
                                        <div>
                                            <span>Sign In Here</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.state.resent ?
                    <div className="post-success-container">
                        <div>
                            <span>Resented!</span>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="tick-success" viewBox="0 0 16 16">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.invalid ?
                    <div className="post-success-container" style={{ backgroundColor: "#41DC69" }}>
                        <div>
                            <span>Account has verified</span>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    <div className="register-container">
                        {this.state.verifying === false ?
                        <div className="register-block">
                            <div className="register-block-header">
                                <span>Create An Account</span>
                            </div>
                            <div className="register-input-block">
                                <input onInput={this.CheckExistedUser} type="text" className="input-box" autoComplete="off" required id="register-user" ref={this.username}/>
                                <label className="label-input" htmlFor="register-user">Username</label>
                                {this.state.cUsername === null ? null : (this.state.cUsername === "loading") ? <div className="load-spin"></div> : (this.state.cUsername === false) ? <div className="checkmark-error"></div> : <div className="checkmark-success"></div>}
                            </div>
                            <div className="register-input-block">
                                <input type="password" onInput={this.CheckPassword} className={this.state.cPassword === false ? "warning-password-input" : "input-box"}  required id="register-pass" ref={this.password} />
                                <label className={this.state.cPassword === false ? "label-input-warning" : "label-input"} htmlFor="register-pass">Password</label>
                                {this.state.cPassword === false ? 
                                <div className="warning-password">
                                    <span>Password must be at least 8</span>
                                </div>
                                :
                                null
                                }
                            </div>
                            <div className="register-input-block">
                                <input type="password" className={this.state.cRPassword === false ? "warning-password-input" : "input-box"}  required id="register-cpass" ref={this.rPassword} onInput={this.CheckRPassword}/>
                                <label className={this.state.cRPassword === false ? "label-input-warning" : "label-input"} htmlFor="register-cpass">Repeat Password</label>
                                {this.state.cRPassword === false ? 
                                <div className="warning-password">
                                    <span>Repeat password not same as password</span>
                                </div>
                                :
                                null
                                }
                            </div>
                            <div className="register-input-block">
                                <input type="text" className={this.state.cEmail === false ? "warning-password-input" : "input-box"} autoComplete="off" required id="register-email" onInput={this.CheckEmail} ref={this.email} />
                                <label className={this.state.cEmail === false ? "label-input-warning" : "label-input"} htmlFor="register-email">Email</label>
                                {this.state.cEmail === false ?
                                <div className="warning-email"> 
                                    <span>Invalid Email</span>
                                </div>
                                :
                                null
                                }
                            </div>
                            <div className="account-btn-container">
                                <button onClick={this.Submit} ref={this.submitBtn}>Create Account</button>
                            </div>
                        </div>
                        :
                        <div className="confirmation-block">
                            <div className="confirmation-back-btn-container" onClick={this.BackVerify}></div>
                            <div className="confirmation-header">
                                <span>Validation</span>
                            </div>
                            <div className="confirmation-container">
                                <div>
                                    <span>We has sended the verification link to</span>
                                    <span>{this.emailValue}</span>
                                    <span>Please look at the email and</span>
                                    <span>click the link to complete the validation.</span>
                                </div>
                            </div>
                            <div className="confirmation-btn-container">
                                <button onClick={this.Resend}>Resend</button>
                            </div>
                        </div>
                        }                     
                    </div>
                </div>
            );
        }
    }
}
