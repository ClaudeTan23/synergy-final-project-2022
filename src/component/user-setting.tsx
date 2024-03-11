import React, { createRef } from "react";
import "../css/dark-user-setting.css";
import { Modal } from "./modal-container.tsx";
import { SettingUser } from "./props-state/user-setting.tsx";

export namespace UserSetting
{
    export class Container extends React.Component<SettingUser.Props, SettingUser.State>
    {
        private LOADED: boolean = false;
        private BackgroundInput: React.RefObject<HTMLInputElement>;
        private IconInput: React.RefObject<HTMLInputElement>;
        private nameInput: React.RefObject<HTMLInputElement>;
        private passwordInput: React.RefObject<HTMLInputElement>;
        private confirmInput: React.RefObject<HTMLInputElement>;
        private blobBg: string;
        private blobPf: string;
        private bgFile: any = "";
        private pfFile: any = "";
        private uploadSuccessTimer: ReturnType<typeof setTimeout> | undefined;
        private updateSuccessTimer: ReturnType<typeof setTimeout> | undefined;

        constructor(props)
        {
            super(props);

            this.state = 
            {
                name          : "",
                friends       : 0,
                dateJoin      : "",
                userIcon      : "blankpf.jpg",
                userBackground: "blankbg.jpg",
                email         : "", 
                username      : "",
                password      : "",
                changeName    : false,
                changeUserIcon: false,
                changeUserBg  : false,
                changePassword: false,
                updateSuccess : false,
                uploadSuccess : false,
                checkNameInput: false,
                nameEmpty     : false,
                checkPassword : false,
                confrimPw     : false,
            }

            this.BackgroundInput = createRef();
            this.IconInput       = createRef();
            this.nameInput       = createRef();
            this.passwordInput   = createRef();
            this.confirmInput    = createRef();
            

            this.blobBackground = this.blobBackground.bind(this);
            this.cancelBlobBg   = this.cancelBlobBg.bind(this);
            this.uploadBg       = this.uploadBg.bind(this);
            this.uploadPf       = this.uploadPf.bind(this);
            this.cancelBlobPf   = this.cancelBlobPf.bind(this);
            this.uploadedPf     = this.uploadedPf.bind(this);
            this.updateName     = this.updateName.bind(this);
            this.keyEvent       = this.keyEvent.bind(this);
            this.updatePassword = this.updatePassword.bind(this);
        }

        componentDidMount(): void 
        {
            if(!this.LOADED)
            {
                this.LOADED = true;
                document.title = "Profile";

                this.fetchUserInfo();
            }
        }

        checkCookie(): void 
        {
            if(this.props.cookie.sconnecti === undefined && this.props.cookie.sconnecti === "")
            {
                this.props.removeCookie("sconnecti", { path: "/" });
                this.props.Navigate("/login");
            }
        }

        fetchUserInfo(): void 
        {
            this.checkCookie();

            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            fetch(`${process.env.REACT_APP_API_URL}/uinfo?u=${key}`)
            .then(response => response.json())
            .then(result => 
            {
                if(result.success)
                {
                    const userData: any = result.data[0];

                    this.setState(() => 
                    ({ 
                        username      : userData.username,
                        name          : userData.name,
                        userIcon      : userData.profile,
                        userBackground: userData.background,
                        friends       : userData.totalFriend,
                        email         : userData.email,
                        password      : "*********",
                        dateJoin      : userData.dateJoin
                    }));
                }

            });
        }

        blobBackground(input: React.RefObject<HTMLInputElement>): void 
        {
            const bgImg: any = input.current.files[0];

            if(this.blobBg !== "")
            {
                URL.revokeObjectURL(this.blobBg);
            }

            this.blobBg = URL.createObjectURL(bgImg);
            this.bgFile = bgImg;

            input.current.value = "";

            this.setState(() => ({ changeUserBg: true  }));
        }

        cancelBlobBg(): void 
        {
            this.bgFile = "";
            URL.revokeObjectURL(this.blobBg);
            this.blobBg = "";
            
            this.setState(() => ({ changeUserBg: false  }));
        }

        async uploadBg(): Promise<void> 
        {
            this.checkCookie();

            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const imgForm = new FormData();

            imgForm.append("bgImg", this.bgFile);
            imgForm.append("user", user);

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/user/setting/bg`, 
            {
                method: "POST",
                body: imgForm
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    console.log(result);
                    this.bgFile = "";
                    URL.revokeObjectURL(this.blobBg);
                    this.blobBg = "";
                    
                    this.setState(() => ({ changeUserBg: false, uploadSuccess: true  }));
                    this.fetchUserInfo();

                    setTimeout((): void =>
                    {
                        this.setState(() => ({ uploadSuccess: false }));
                    }, 2000);

                }
            }
        } 

        uploadPf(input: React.RefObject<HTMLInputElement>)
        {
            const pfImg: any = input.current.files[0];

            if(this.blobPf !== "")
            {
                URL.revokeObjectURL(this.blobPf);
            }

            this.blobPf = URL.createObjectURL(pfImg);
            this.pfFile = pfImg;

            input.current.value = "";

            this.setState(() => ({ changeUserIcon: true  }));
        }

        cancelBlobPf(): void 
        {
            this.pfFile = "";
            URL.revokeObjectURL(this.blobPf);
            this.blobPf = "";
            
            this.setState(() => ({ changeUserIcon: false  }));
        }

        async uploadedPf(): Promise<void> 
        {
            this.checkCookie();

            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const imgForm = new FormData();

            imgForm.append("pfImg", this.pfFile);
            imgForm.append("user", user);

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/user/setting/pf`, 
            {
                method: "POST",
                body: imgForm
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    console.log(result);
                    this.pfFile = "";
                    URL.revokeObjectURL(this.blobPf);
                    this.blobPf = "";
                    
                    this.setState(() => ({ changeUserIcon: false, uploadSuccess: true  }));
                    this.fetchUserInfo();

                    setTimeout((): void =>
                    {
                        this.setState(() => ({ uploadSuccess: false }));
                    }, 2000);

                }
            }
        }

        async updateName(input: React.RefObject<HTMLInputElement>): Promise<void>
        {
            const nameInput: string | undefined = input.current?.value.trim();

            if(nameInput !== null && nameInput !== "" && nameInput !== undefined)
            {
                this.checkCookie();

                const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/update/user/name`, 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: user, name: nameInput })
                });

                if(promise.ok)
                {
                    const result = await promise.json();

                    if(result.success)
                    {
                        this.setState(() => ({ nameEmpty: false, changeName: false, updateSuccess: true }));
                        this.fetchUserInfo();

                        setTimeout(() => {
                            this.setState(() => ({ updateSuccess: false }))
                        }, 2000);
                    }

                }
                
                
            } else 
            {
                this.setState(() => ({ nameEmpty: true }));
            }
        }

        keyEvent(input: React.RefObject<HTMLInputElement>): void 
        {
            const password = input.current?.value.trim();

            if(password !== "" && password !== null && password !== undefined)
            {
                if(password.length < 8)
                {
                    this.setState(() => ({ checkPassword: true }));

                } else 
                {
                    this.setState(() => ({ checkPassword: false }));
                }
            }
        }

        async updatePassword(): Promise<void> 
        {
            const password: string | undefined = this.passwordInput.current?.value.trim();
            const confrimPw: string | undefined = this.confirmInput.current?.value.trim();

            if(password !== undefined && password !== "" && password !== null && confrimPw !== undefined && confrimPw !== "" && confrimPw !== null)
            {
                if(password.length < 8 && password === confrimPw)
                {
                    this.setState(() => ({ checkPassword: true, confrimPw: false }));

                } else if(password.length >= 8 && password !== confrimPw)
                {
                    this.setState(() => ({ confrimPw: true, checkPassword: false }));

                } else if(password.length < 8 && password !== confrimPw)
                {
                    this.setState(() => ({ checkPassword: true, confrimPw: true }));

                } else if(password.length >= 8 && password === confrimPw)
                {
                    this.checkCookie();

                    const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                    const promise = await fetch(`${process.env.REACT_APP_API_URL}/update/user/password`, 
                    {
                        method: "POST",
                        headers: 
                        {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ user: user, password: password })
                    });

                    if(promise.ok)
                    {
                        const result = await promise.json();

                        if(result.success)
                        {
                            this.setState(() => ({ checkPassword: false, confrimPw: false, changePassword: false, updateSuccess: true }));

                            setTimeout(() => {
                                this.setState(() => ({ updateSuccess: false }))
                            }, 2000);
                            
                        }
                    }

                }

            } else 
            {
                this.setState(() => ({ checkPassword : true, confrimPw: true }));
            }
        }

        render(): JSX.Element
        {
            return (
                <div className="user-setting-main-container">
                    
                    {/* model from upload or change of profile and background */}
                    {this.state.uploadSuccess ?
                    <Modal.Container title="Uploaded Success"/>
                    :
                    <></>
                    }

                    {this.state.updateSuccess ?
                    <Modal.Container title="Updated Success"/>
                    :
                    <></>
                    }

                    {/* confirmation upload modal */}
                    {this.state.changeUserIcon ?
                    <div className="user-setting-modal-profile-container">
                        <div className="user-setting-modal-pf-block">
                            <div className="user-setting-modal-pf-header">
                                <span>Profile Picture</span>
                            </div>
                            <div className="user-setting-modal-body">
                                <svg viewBox="0 0 100 100" width="120" height="120">
                                    <title>{this.state.name}</title>
                                    <defs>
                                        <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                        <clipPath id="circle-clip">
                                        <use xlinkHref="#circle"/>
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#circle-clip)">
                                        <image xlinkHref={this.blobPf} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                        <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                    </g>
                                </svg>
                            </div>
                            <div className="user-setting-modal-btn-container">
                                <button className="modal-pf-btn-confirm" onClick={this.uploadedPf}>Confirm</button>
                            </div>
                            <div className="user-setting-modal-btn-container">
                                <label className="modal-pf-btn-change" htmlFor="pf">Change</label>
                            </div>
                            <div className="user-setting-modal-btn-container">
                                <button className="modal-pf-btn-cancel" onClick={this.cancelBlobPf}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {/* confirmation upload background modal */}
                    {this.state.changeUserBg ?
                    <div className="user-setting-modal-bg-container">
                        <div className="user-setting-modal-bg-block">
                            <div className="user-setting-modal-bg">
                                <img src={this.blobBg} />
                            </div>
                            <div className="user-setting-modal-bg-body">
                                <div>
                                    <svg viewBox="0 0 100 100" width="120" height="120">
                                        <title>{this.state.name}</title>
                                        <defs>
                                            <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                            <clipPath id="circle-clip">
                                            <use xlinkHref="#circle"/>
                                            </clipPath>
                                        </defs>
                                        <g clipPath="url(#circle-clip)">
                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${this.state.userIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                            <div className="user-setting-modal-bg-footer">
                                <button onClick={this.uploadBg}>Confirm</button>
                                <label htmlFor="bg">Change</label>
                                <button onClick={this.cancelBlobBg}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.changeName ?
                    <div className="user-setting-modal-bg-container">
                        <div className="user-setting-modal-bg-block">
                            <div className="user-setting-modal-bg">
                                <img src={`${process.env.REACT_APP_API_URL}/media/${this.state.userBackground}`} />
                            </div>
                            <div className="user-setting-modal-bg-body">
                                <div>
                                    <svg viewBox="0 0 100 100" width="120" height="120">
                                        <title>{this.state.name}</title>
                                        <defs>
                                            <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                            <clipPath id="circle-clip">
                                            <use xlinkHref="#circle"/>
                                            </clipPath>
                                        </defs>
                                        <g clipPath="url(#circle-clip)">
                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${this.state.userIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                            <div className={this.state.nameEmpty === true ? "user-setting-footer-name-block-warning" : "user-setting-footer-name-block"}>
                                <input type="text" autoComplete="false" placeholder={this.state.name} ref={this.nameInput}/>
                            </div>
                            <div className="user-setting-modal-bg-footer">
                                <button onClick={() => this.updateName(this.nameInput)}>Confirm</button>
                                <button className="user-setting-modal-bg-footer-cancel" onClick={() => this.setState(() => ({ changeName: false, nameEmpty: false }))}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    <div className="user-setting-container">
                        <label className="edit-background-user-block" htmlFor="bg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                        </label>
                        <input type="file" id="bg" hidden accept="image/*" ref={this.BackgroundInput} onChange={() => this.blobBackground(this.BackgroundInput)}/>
                        <div className="user-setting-profile-container">
                            <img src={`${process.env.REACT_APP_API_URL}/media/${this.state.userBackground}`} />
                        </div>
                    </div>
                    <div className="user-setting-icon-username-container">
                        <div className="user-setting-icon-container">
                            <svg viewBox="0 0 100 100" width="120" height="120">
                                <title>{this.state.name}</title>
                                <defs>
                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                    <clipPath id="circle-clip">
                                    <use xlinkHref="#circle"/>
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#circle-clip)">
                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${this.state.userIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                </g>
                            </svg>
                            <label className="user-setting-profile-pic-container-control" htmlFor="pf">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg>
                            </label>
                            <input type="file" id="pf" hidden accept="image/*" onChange={() => this.uploadPf(this.IconInput)} ref={this.IconInput}/>
                        </div>
                        <div className="user-setting-username-control-container">
                            <div className={this.state.name !== "" && this.state.name.length > 10 ? "user-setting-username-container" : "user-setting-username-container-short"}>
                                <span>
                                    {this.state.name}
                                </span>
                            </div>
                            <div className="edit-username-container-control">
                                {/* confirm edit btn */}
                                {/* <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="comfirm-user" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                    </svg>
                                </div> */}

                                {/* cancel edit btn */}
                                {/* <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="cancel-user" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div> */}
                                <div onClick={() => this.setState(() => ({ changeName: true }))}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="user-setting-info-control-main-container">
                        <div className="user-setting-block-pad">
                            {/* <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Gender</span>
                                </div>
                                <div className="user-setting-info-setting-block">
                                    <select>
                                        <option>-</option>
                                        <option>Female</option>
                                        <option>Male</option>
                                    </select>
                                </div>
                            </div> */}

                            <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Username</span>
                                </div>
                                <div className="user-setting-info-setting-p-block">
                                    <div>{this.state.username}</div>
                                </div>
                                <div className="edit-username-container-control">
                                    {/* confirm edit btn */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="comfirm-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                        </svg>
                                    </div> */}

                                    {/* cancel edit btn */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="cancel-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </div> */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                        </svg>
                                    </div> */}
                                </div>
                            </div>

                            <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Password</span>
                                </div>
                                <div className="user-setting-info-setting-p-block">
                                    {this.state.changePassword ?
                                    <div>
                                        <div className="input-password-change-block">
                                        <input type="password" autoComplete="false" placeholder="New password" onInput={() => this.keyEvent(this.passwordInput)} ref={this.passwordInput}/>
                                        </div>
                                        {this.state.checkPassword ?
                                        <div className="warning-password-input-change" style={{ color: "#D01414", fontSize: "14px" }}>Password atleast 8</div>
                                        :
                                        <></>
                                        }
                                        <div className="input-password-change-block">
                                            <input type="password" autoComplete="false" placeholder="Confirm password" ref={this.confirmInput}/>
                                        </div>
                                        {this.state.confrimPw ?
                                        <div className="warning-password-input-change" style={{ color: "#D01414", fontSize: "14px" }}>Confirm password not same</div>
                                        :
                                        <></>
                                        }
                                    </div>
                                    :
                                    <div>**********</div>   
                                    }
                                </div>
                                <div className="edit-username-container-control" style={{ right: "0" }}>
                                    {/* confirm edit btn */}
                                    {this.state.changePassword ?
                                    <div onClick={this.updatePassword}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="comfirm-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                        </svg>
                                    </div>
                                    :
                                    <></>
                                    }

                                    {/* cancel edit btn */}
                                    {this.state.changePassword ?
                                    <div onClick={() => this.setState(() => ({ changePassword: false }))}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="cancel-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </div>
                                    :
                                    <></>
                                    }
                                    
                                    {this.state.changePassword ?
                                    <></>
                                    :
                                    <div onClick={() => this.setState(() => ({ changePassword: true }))}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                        </svg>
                                    </div>
                                    }
                                </div>
                            </div>

                            <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Email</span>
                                </div>
                                <div className="user-setting-info-setting-email-block">
                                    <div>{this.state.email}</div>
                                </div>

                                <div className="edit-username-container-control">
                                    {/* confirm edit btn */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="comfirm-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                                        </svg>
                                    </div> */}

                                    {/* cancel edit btn */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="cancel-user" viewBox="0 0 16 16">
                                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </div> */}
                                    {/* <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="edit-user" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                        </svg>
                                    </div> */}
                                </div>
                            </div>

                            <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Friends</span>
                                </div>
                                <div className="user-setting-info-setting-p-block">
                                    <div>{this.state.friends > 0 ? `${this.state.friends} friends` : "No friends"}</div>
                                </div>
                            </div>

                            <div className="user-setting-info-control-container">
                                <div className="user-setting-info-block">
                                    <span>Date account created</span>
                                </div>
                                <div className="user-setting-info-setting-p-block">
                                    <div>{this.state.dateJoin.split("/")[0]}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        }
    }
}

