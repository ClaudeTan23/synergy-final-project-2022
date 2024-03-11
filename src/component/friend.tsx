import React, { useEffect, createRef } from "react";
import "../css/dark-friend.css";
import { FriendPropState } from "./props-state/friend";
import { Link, useNavigate, useLocation, NavigateFunction, Location } from "react-router-dom";
import  { Cookies, useCookies }  from "react-cookie";

export namespace Friend 
{
    class Block extends React.Component <FriendPropState.Props, FriendPropState.State>
    {
        private LOAD: boolean = false;
        private myFriendSearchBar: React.RefObject<HTMLInputElement>;
        private timerMyFriend: ReturnType<typeof setTimeout>;
        private timerNewFriend: ReturnType<typeof setTimeout>;
        private friendRequestSearchBar: React.RefObject<HTMLInputElement>;
        private sentRequestSearchBar : React.RefObject<HTMLInputElement>;
        private newFriendSearchBar: React.RefObject<HTMLInputElement>;
        private blockedSearchBar: React.RefObject<HTMLInputElement>;
        private timerBlockedFriend: ReturnType<typeof setTimeout>;
        private confirmationObject: { fId: string | undefined, name: string | undefined, index: number | undefined, type: string | undefined};
        private timerRequest: ReturnType<typeof setTimeout>;

        constructor(props)
        {
            super(props);
            
            this.state =
            {
                animationContainer  : "friends",
                myFriends           : undefined,
                myFriendsLoader     : false,
                requestsFriend      : undefined,
                requestsFriendLoader: false, 
                newFriends          : undefined,
                newFriendLoader     : false,
                blockedUsers        : undefined,
                blockUsersLoader    : false, 
                confirmationBlock   : false,
                confirmationType    : "",
                friendRequestAnimate: false,
                friendSentAnimate   : false,
                totalFriends        : 0,
                totalFriendRequests : 0,
                totalSentRequests   : 0,
                totalBlockedUsers   : 0
            }

            this.myFriendSearchBar      = createRef();
            this.friendRequestSearchBar = createRef();
            this.newFriendSearchBar     = createRef();
            this.blockedSearchBar       = createRef();
            this.sentRequestSearchBar   = createRef();

            this.toggleAnimation      = this.toggleAnimation.bind(this);
            this.checkCookie          = this.checkCookie.bind(this);
            this.searchMyFriend       = this.searchMyFriend.bind(this);
            this.fetchMyFriend        = this.fetchMyFriend.bind(this);
            this.searchNewFriend      = this.searchNewFriend.bind(this);
            this.fetchBlockedFriend   = this.fetchBlockedFriend.bind(this);
            this.searchBlockedUser    = this.searchBlockedUser.bind(this);
            this.clearTimer           = this.clearTimer.bind(this);
            this.unfriendedMethod     = this.unfriendedMethod.bind(this);
            this.popsUpConfirmation   = this.popsUpConfirmation.bind(this);
            this.closeConfirmation    = this.closeConfirmation.bind(this);
            this.addfriendMethod      = this.addfriendMethod.bind(this);
            this.fetchRequestsFriend  = this.fetchRequestsFriend.bind(this);
            this.searchFriendRequest  = this.searchFriendRequest.bind(this);
            this.friendRequestBtn     = this.friendRequestBtn.bind(this);
            this.sentRequestBtn       = this.sentRequestBtn.bind(this);
            this.fetchSentRequest     = this.fetchSentRequest.bind(this);
            this.searchSentRequest    = this.searchSentRequest.bind(this);
            this.cancelRequestMethod  = this.cancelRequestMethod.bind(this);
            this.confirmRequestMethod = this.confirmRequestMethod.bind(this);
            this.blockedMethod        = this.blockedMethod.bind(this);
            this.unBlockedMethod      = this.unBlockedMethod.bind(this);

            this.confirmationObject = { fId: undefined, index: undefined, name: undefined, type: undefined };
        }

        clearTimer(): void 
        {
            if(this.timerMyFriend !== undefined)
            {
                clearInterval(this.timerMyFriend);

            } else if(this.timerNewFriend !== undefined)
            {
                clearInterval(this.timerNewFriend);

            } else if(this.timerBlockedFriend !== undefined)
            {
                clearInterval(this.timerBlockedFriend);

            } else if(this.timerRequest !== undefined)
            {
                clearInterval(this.timerRequest);
            }
        }

        toggleAnimation(e: any, type: string) : void 
        {
            if(e.button !== 2)
            {
                if(type === "friends")
                {
                    this.setState(() => 
                    ({ 
                        animationContainer: "friends", 
                        requestsFriend: undefined,
                        requestsFriendLoader: false,
                        newFriends: undefined,
                        newFriendLoader: false,
                        blockedUsers: undefined,
                        blockUsersLoader: false, 
                    }));
                    
                    this.clearTimer();
                    this.fetchMyFriend();

                } else if(type === "request")
                {
                    this.setState(() => 
                    ({ 
                        animationContainer: "request", 
                        myFriends: undefined,
                        myFriendsLoader: false,
                        newFriends: undefined,
                        newFriendLoader: false,
                        blockedUsers: undefined,
                        blockUsersLoader: false,
                    }));

                    this.clearTimer();
                    this.fetchSentRequestNum();
                    this.fetchRequestsFriend();

                } else if(type === "new")
                {
                    this.setState(() => 
                    ({ 
                        animationContainer: "new", 
                        myFriends: undefined,
                        myFriendsLoader: false,
                        requestsFriend: undefined,
                        requestsFriendLoader: false,
                        blockedUsers: undefined,
                        blockUsersLoader: false,
                    }));

                    this.clearTimer();

                } else if(type === "blocked")
                {
                    this.setState(() => 
                    ({ 
                        animationContainer: "blocked", 
                        myFriends: undefined ,
                        myFriendsLoader: false,
                        requestsFriend: undefined,
                        requestsFriendLoader: false,
                        newFriendLoader: false,
                        newFriends: undefined,
                    }));

                    this.clearTimer();  
                    this.fetchBlockedFriend();
                }
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

        webSocket(): void 
        {
            // this.props.clientSocket.on();
        }

        async fetchMyFriend(): Promise<void> 
        {
            this.checkCookie();

            if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
            {
                const CSRF = async (): Promise<void> => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL!}/friends?u=${key}`);

                    this.setState(() => ({ myFriendsLoader : true }))

                    if(promise.ok)
                    {
                        const p: { status: string, friends: Array<any>, totalFriends: number } = await promise.json();
                                    
                        if(p.status === "success")
                        {
                            this.setState(() => ({ myFriendsLoader : false, totalFriends: p.totalFriends }));

                            if(p.friends.length > 0)
                            {
                                this.setState(() => 
                                ({
                                        myFriends: p.friends,
                                }));
                            }

                        } else 
                        {
                            console.log(p.status);
                        }


                    } else 
                    {
                        CSRF();
                        console.log("status network error");
                    }
                }

                CSRF();

            }
  
        }

        async fetchRequestsFriend(): Promise<void>
        {
            this.checkCookie();

            if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
            {
                if(this.sentRequestSearchBar.current !== null)
                {
                    this.sentRequestSearchBar.current!.value = "";
                }

                const CSRF = async (): Promise<void> => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL!}/frequest?u=${key}`);

                    this.setState(() => ({ requestsFriendLoader : true, friendRequestAnimate: true, friendSentAnimate: false, requestsFriend: undefined }));

                    if(promise.ok)
                    {
                        const p: { result: string, data: Array<any>, success: boolean, totalFriendRequest: number } = await promise.json();
                                    
                        if(p.success)
                        {
                            this.setState(() => ({ totalFriendRequests: p.totalFriendRequest }));

                            if(p.data.length > 0)
                            {
                                this.setState(() => ({ requestsFriend: p.data }));
                            }

                        } else 
                        {
                            console.log(p.result);
                        }

                        this.setState(() => ({ requestsFriendLoader: false }));

                    } else 
                    {
                        CSRF();
                        console.log("status network error");
                    }
                }

                CSRF();

            }
        } 

        async fetchSentRequestNum()
        {
            this.checkCookie();

            if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
            {
                if(this.friendRequestSearchBar.current !== null)
                {
                    this.friendRequestSearchBar.current!.value = "";
                }
                
                const CSRF = async (): Promise<void> => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL!}/srequest?u=${key}`);

                    // this.setState(() => ({ requestsFriendLoader : true, friendSentAnimate: true, friendRequestAnimate: false, requestsFriend: undefined }));

                    if(promise.ok)
                    {
                        const p: { result: string, data: Array<any>, success: boolean, totalSentRequests: number } = await promise.json();
                                    
                        if(p.success)
                        {
                            this.setState(() => ({ totalSentRequests: p.totalSentRequests }));

                            // if(p.data.length > 0)
                            // {
                            //     this.setState(() => ({ requestsFriend: p.data }))
                            // }

                        } else 
                        {
                            console.log(p.result);
                        }

                        // this.setState(() => ({ requestsFriendLoader: false }));

                    } else 
                    {
                        CSRF();
                        console.log("status network error");
                    }
                }

                CSRF();

            }
        }

        async fetchSentRequest(): Promise<void> 
        {
            this.checkCookie();

            if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
            {
                if(this.friendRequestSearchBar.current !== null)
                {
                    this.friendRequestSearchBar.current!.value = "";
                }
                
                const CSRF = async (): Promise<void> => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL!}/srequest?u=${key}`);

                    this.setState(() => ({ requestsFriendLoader : true, friendSentAnimate: true, friendRequestAnimate: false, requestsFriend: undefined }));

                    if(promise.ok)
                    {
                        const p: { result: string, data: Array<any>, success: boolean, totalSentRequests: number } = await promise.json();
                                    
                        if(p.success)
                        {
                            this.setState(() => ({ totalSentRequests: p.totalSentRequests }));

                            if(p.data.length > 0)
                            {
                                this.setState(() => ({ requestsFriend: p.data }))
                            }

                        } else 
                        {
                            console.log(p.result);
                        }

                        this.setState(() => ({ requestsFriendLoader: false }));

                    } else 
                    {
                        CSRF();
                        console.log("status network error");
                    }
                }

                CSRF();

            }
        } 

        async fetchBlockedFriend(): Promise<void> 
        {
            this.checkCookie();

            if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
            {
                const CSRF = async (): Promise<void> => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL!}/blocked?u=${key}`);

                    this.setState(() => ({ blockUsersLoader : true }))

                    if(promise.ok)
                    {
                        const result: { status: string, users: Array<any>, totalBlocked: number } = await promise.json();
                                    
                        if(result.status === "success")
                        {
                            this.setState(() => ({ blockUsersLoader : false, totalBlockedUsers: result.totalBlocked }));

                            if(result.users.length > 0)
                            {
                                this.setState(() => 
                                ({
                                    blockedUsers: result.users
                                }));
                            }

                        } else 
                        {
                            console.log(result.status);
                        }


                    } else 
                    {
                        CSRF();
                        console.log("status network error");
                    }
                }

                CSRF();
            }
        }

        searchBlockedUser(): void 
        {
            this.checkCookie();

            if(this.timerBlockedFriend !== undefined)
            {
                clearInterval(this.timerBlockedFriend);
            }

            if(this.blockedSearchBar?.current?.value.trim() !== "")
            {
                this.setState(() => ({ blockUsersLoader: true }));

                this.timerBlockedFriend = setTimeout(async (): Promise<void> => 
                {
                    if(this.blockedSearchBar?.current?.value.trim() !== "")
                    {
                        const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/fbu?u=${key}&user=${this.blockedSearchBar?.current?.value.trim()}`);

                        if(promise.ok)
                        {
                            const result: { status: string, users: Array<any> } = await promise.json();

                            if(result.status === "success")
                            {
                                this.setState(() => ({ blockedUsers: result.users }));

                            } else 
                            {
                                console.log(result.status);
                            }

                            this.setState(() => ({ blockUsersLoader: false }));
                        }

                    } else 
                    {
                        this.setState(() => ({ blockUsersLoader: false }));
                    }
                    

                }, 2000);

            } else 
            {
                if(this.blockedSearchBar?.current?.value.length === 0)
                {
                    this.setState(() => ({ blockedUsers: undefined }));
                    this.fetchBlockedFriend();
                }
                
            }
        }

        searchMyFriend(): void
        {   
            this.checkCookie();

            if(this.timerMyFriend !== undefined)
            {
                clearInterval(this.timerMyFriend);
            }

            if(this.myFriendSearchBar?.current?.value.trim() !== "")
            {
                this.setState(() => ({ myFriendsLoader: true }));

                this.timerMyFriend = setTimeout(async (): Promise<void> => 
                {
                    if(this.myFriendSearchBar?.current?.value.trim() !== "")
                    {
                        const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/smf?u=${key}&friend=${this.myFriendSearchBar?.current?.value.trim()}`);

                        if(promise.ok)
                        {
                            const result: { status: string, friends: Array<any> } = await promise.json();

                            if(result.status === "success")
                            {
                                this.setState(() => ({ myFriends: result.friends }));

                            } else 
                            {
                                console.log(result.status);
                            }

                            this.setState(() => ({ myFriendsLoader: false }));
                        }

                    } else 
                    {
                        this.setState(() => ({ myFriendsLoader: false }));
                    }
                    

                }, 2000);

            } else 
            {
                if(this.myFriendSearchBar?.current?.value.length === 0)
                {
                    this.setState(() => ({ myFriends: undefined }));
                    this.fetchMyFriend();
                }
                
            }

        }

        searchFriendRequest(): void 
        {
            this.checkCookie();

            if(this.timerRequest !== undefined)
            {
                clearInterval(this.timerRequest);
            }

            if(this.friendRequestSearchBar?.current?.value.trim() !== "")
            {
                this.setState(() => ({ requestsFriendLoader: true }));

                this.timerRequest = setTimeout(async (): Promise<void> => 
                {
                    if(this.friendRequestSearchBar?.current?.value.trim() !== "")
                    {
                        const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/sfr?u=${key}&user=${this.friendRequestSearchBar?.current?.value.trim()}`);

                        if(promise.ok)
                        {
                            const result: { success: boolean, users: Array<any>, status: string } = await promise.json();

                            if(result.success)
                            {
                                this.setState(() => ({ requestsFriend: result.users }));

                            } else 
                            {
                                console.log(result.status);
                            }

                            this.setState(() => ({ requestsFriendLoader: false }));
                        }

                    } else 
                    {
                        this.setState(() => ({ requestsFriendLoader: false }));
                    }
                    

                }, 2000);

            } else 
            {
                if(this.friendRequestSearchBar?.current?.value.length === 0)
                {
                    this.setState(() => ({ requestsFriend: undefined }));
                    this.fetchRequestsFriend();
                }
                
            }
        }

        searchSentRequest(): void 
        {
            this.checkCookie();

            if(this.timerRequest !== undefined)
            {
                clearInterval(this.timerRequest);
            }

            if(this.sentRequestSearchBar?.current?.value.trim() !== "")
            {
                this.setState(() => ({ requestsFriendLoader: true }));

                this.timerRequest = setTimeout(async (): Promise<void> => 
                {
                    if(this.sentRequestSearchBar?.current?.value.trim() !== "")
                    {
                        const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/ssr?u=${key}&user=${this.sentRequestSearchBar?.current?.value.trim()}`);

                        if(promise.ok)
                        {
                            const result: { success: boolean, users: Array<any>, status: string } = await promise.json();

                            if(result.success)
                            {
                                this.setState(() => ({ requestsFriend: result.users }));

                            } else 
                            {
                                console.log(result.status);
                            }

                            this.setState(() => ({ requestsFriendLoader: false }));
                        }

                    } else 
                    {
                        this.setState(() => ({ requestsFriendLoader: false }));
                    }
                    

                }, 2000);

            } else 
            {
                if(this.sentRequestSearchBar?.current?.value.length === 0)
                {
                    this.setState(() => ({ requestsFriend: undefined }));
                    this.fetchSentRequest();
                }
                
            }
        }

        searchNewFriend(): void 
        {
            this.checkCookie();

            if(this.timerNewFriend !== undefined)
            {
                clearInterval(this.timerNewFriend);
            }

            if(this.newFriendSearchBar?.current?.value.trim() !== "")
            {
                this.setState(() => ({ newFriendLoader: true }));

                this.timerNewFriend = setTimeout(async (): Promise<void> => 
                {
                    if(this.newFriendSearchBar?.current?.value.trim() !== "")
                    {
                        const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/fnf?u=${key}&friend=${this.newFriendSearchBar?.current?.value.trim()}`);

                        if(promise.ok)
                        {
                            const result: { status: string, friends: Array<any> } = await promise.json();

                            if(result.status === "success")
                            {
                                this.setState(() => ({ newFriends: result.friends }));

                            } else 
                            {
                                console.log(result.status);
                            }

                            this.setState(() => ({ newFriendLoader: false }));
                        }

                    } else 
                    {
                        this.setState(() => ({ newFriendLoader: false }));
                    }

                }, 2000);

            } else 
            {
                this.setState(() => ({ newFriends: undefined, newFriendLoader: false }))
                
            }

        }

        popsUpConfirmation(e: any,fId: string, index: number, type: string, name: string): void 
        {
            if(e.button !== 2)
            {
                if(type === "unfriend")
                {
                    this.setState(() => 
                    ({
                        confirmationType: "unfriend", 
                        confirmationBlock: true,
                    }));

                    this.confirmationObject = { fId: fId, name: name, index: index, type: undefined };

                } else if(type === "friends" || type === "friendRequest" || type === "findFriend")
                {
                    this.setState(() => 
                    ({
                        confirmationType: "blocked",
                        confirmationBlock: true
                    }));

                    this.confirmationObject = { fId: fId, name: name, index: index, type: type }
                }
            }
        }

        closeConfirmation(): void 
        {
            this.setState(() => ({ confirmationBlock: false, confirmationType: "" }));
            this.confirmationObject = { fId: undefined, index: undefined, name: undefined, type: undefined };
        }

        async unfriendedMethod(fId: string | undefined, index: number | undefined): Promise<void> 
        {
            this.checkCookie();

            if(fId !== "" && fId !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/unfriended`, 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: key, fId: fId })
                });


                if(promise.ok)
                {
                    const result: { success: boolean, status: string } = await promise.json();

                    if(result.success)
                    {
                        const myFriend: Array<any> | null | undefined = this.state.myFriends;

                        if(index !== undefined)
                        {
                            myFriend?.splice(index, 1);
                        }
                        
                        this.setState((e) => ({ myFriends: myFriend, confirmationBlock: false, confirmationType: "", totalFriends: e.totalFriends - 1 }));

                        this.confirmationObject = { fId: undefined, index: undefined, name: undefined, type: undefined };

                    } else if(!result.success)
                    {
                        console.log(result.status);
                    }

                } else 
                {
                    console.log("network error");
                }

            } else 
            {
                console.log("404");
            }
        }

        async addfriendMethod(id: string, index: number): Promise<void> 
        {
            this.checkCookie();

            if(id !== "" && id !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/addfriend`, {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: key, fId: id  })
                });

                if(promise.ok)
                {
                    const result: { success: boolean, status: string } = await promise.json();

                    if(result.success)
                    {
                        const newFriendData: Array<any> | undefined = (this.state.newFriends === undefined) ? [] : this.state.newFriends;

                        newFriendData.splice(index, 1);

                        this.setState(() => ({ newFriends: newFriendData }));
        
                    } else 
                    {
                        console.log(result.status);
                    }

                } else 
                {
                    console.log("network error")
                }
            }
        }

        friendRequestBtn(): void
        {
            this.checkCookie();
            this.setState(() => ({ requestsFriend: undefined }))
            this.fetchRequestsFriend();
        }

        sentRequestBtn(): void
        {
            this.checkCookie();
            this.setState(() => ({ requestsFriend: undefined }))
            this.fetchSentRequest();
        }

        async cancelRequestMethod(userId: string, index: number, action: string): Promise<void> 
        {
            this.checkCookie();

            if(userId !== "" && userId !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/crequest`, {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: userId, user: key })
                });

                if(promise.ok)
                {
                    const result: { success: boolean, status: string } = await promise.json();

                    if(result.success)
                    {
                        const requestData: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                        requestData.splice(index, 1);

                        if(action === "delete")
                        {
                            this.setState((e) => ({ requestsFriend: requestData, totalFriendRequests: e.totalFriendRequests - 1 }));
                            
                        } else 
                        {
                            this.setState((e) => ({ requestsFriend: requestData, totalSentRequests: e.totalSentRequests - 1 }));
                        }
                        

                    } else 
                    {
                        console.log(result.status);
                    }

                } else 
                {
                    console.log("network error");
                }
            }
        }

        async confirmRequestMethod(userId: string, index: number): Promise<void>
        {
            this.checkCookie();

            if(userId !== "" && userId !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/confrimrequest`, {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: userId, user: key })
                });

                if(promise.ok)
                {
                    const result: { success: boolean, status: string } = await promise.json();

                    if(result.success)
                    {
                        const requestData: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                        requestData.splice(index, 1);
                        this.setState((e) => ({ requestsFriend: requestData, totalFriendRequests: e.totalFriendRequests - 1 }));

                        

                    } else 
                    {
                        console.log(result.status);
                    }

                } else 
                {
                    console.log("network error");
                }
            }
        }

        async blockedMethod(userId: string | undefined, index: number | undefined, action: string | undefined): Promise<void>
        {
            this.checkCookie();

            if(userId !== "" && userId !== undefined && index !== undefined && action !== "" && action !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/blocked`, {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: userId, user: key })
                });

                if(promise.ok)
                {
                    const result: { success: boolean, result: string } = await promise.json();

                    if(result.success)
                    {
                        if(action === "friends")
                        {
                            const data: Array<any> = (this.state.myFriends !== undefined) ? this.state.myFriends : [];

                            data.splice(index, 1);
                            this.setState((e) => ({ totalFriends: e.totalFriends - 1, myFriends: data }));

                        } else if(action === "friendRequest") 
                        {
                            const data: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                            data.splice(index, 1);
                            this.setState((e) => ({ totalSentRequests: e.totalSentRequests - 1, requestsFriend: data }));

                        } else if(action === "findFriend")
                        {
                            const data: Array<any> = (this.state.newFriends !== undefined) ? this.state.newFriends : [];

                            data.splice(index, 1);
                            this.setState((e) => ({ newFriends: data }));
                        }

                        this.setState(() => ({ confirmationBlock: false, confirmationType: "" }));
                        this.confirmationObject = { fId: undefined, index: undefined, name: undefined, type: undefined };

                    } else 
                    {
                        console.log(result.result);
                    }

                } else {
                    console.log("Network Error");
                }
            }
        }

        async unBlockedMethod(fId: string, index: number): Promise<void> 
        {
            this.checkCookie();

            if(fId !== "" && fId !== undefined && index !== undefined)
            {
                const key: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/unblock`, {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ userId: fId, user: key })
                });

                if(promise.ok)
                {
                    const result: { success: boolean, result: string } = await promise.json();

                    if(result.success)
                    {
                        const data: Array<any> = (this.state.blockedUsers !== undefined) ? this.state.blockedUsers : [];

                        data.splice(index, 1);

                        this.setState((e) => 
                        ({
                            totalBlockedUsers: e.totalBlockedUsers - 1,
                            blockedUsers: data
                        }));

                    } else 
                    {
                        console.log(result.result);
                    }

                } else 
                {
                    console.log("Network Error");
                }
            }
        }

        componentDidMount(): void 
        {
            if(!this.LOAD)
            {
                this.LOAD = true;
                document.title = "Friends";

                if(this.state.animationContainer === "friends")
                {
                    this.fetchMyFriend();
                    this.webSocket();
                }
            }
        }

        render(): JSX.Element 
        {
            return (
                <div className="friend-main-container">
                    <div className="friend-container">
                        <div className="friend-control-bar-container">
                            <div className={(this.state.animationContainer === "friends") ? "border-active-contaniner friends" :
                                             this.state.animationContainer === "new" ? "border-active-contaniner find" : 
                                             this.state.animationContainer === "request" ? "border-active-contaniner request" :
                                             "border-active-contaniner blocked"}></div>
                            <div className="friend-icon-title" onPointerUp={(e: any): void => this.toggleAnimation(e, "friends")}>
                                <div>
                                    <span>My Friends</span>
                                </div>
                            </div>
                            <div className="friend-icon-title" onPointerUp={(e: any): void => this.toggleAnimation(e, "request")}>
                               <div>
                                    <span>Friend Requests</span>
                                </div>
                            </div>
                            <div className="friend-icon-title" onPointerUp={(e: any): void => this.toggleAnimation(e, "new")}>
                                <div>
                                    <span>Find New Friend</span>
                                </div>
                            </div>
                            <div className="friend-icon-title" onPointerUp={(e: any): void => this.toggleAnimation(e, "blocked")}>
                               <div>
                                    <span>Blocked Users</span>
                                </div>
                            </div>
                        </div>

                        {/* my friend container */}
                        {this.state.animationContainer === "friends" ?
                        <div className="friends-container">
                            <div className="friends-block-search-bar friends">
                                <div>{this.state.totalFriends} Friends</div>
                                <input type="text" autoComplete="off" placeholder="Search my friend..." ref={this.myFriendSearchBar} onInput={this.searchMyFriend}/>
                            </div>

                            <div className="friends-block">
                                
                                {this.state.myFriends !== undefined ?
                                    this.state.myFriends.length > 0 ?
                                        this.state.myFriends.map((friend, index, array) => (
                                        <div className="friend-card-pad-container" key={index}>
                                            <div className="friend-card-container">
                                                <div className="friends-user-border">
                                                    <img src={`${process.env.REACT_APP_API_URL}/media/${friend.f_background}`} />
                                                    <Link to={`/user/${friend.friendId}`} style={{display: "flex"}}>
                                                        <svg viewBox="0 0 100 100" width="100" height="100">
                                                            <title>{friend.f_name}</title>
                                                            <defs>
                                                                <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                                <clipPath id="circle-clip">
                                                                <use xlinkHref="#circle"/>
                                                                </clipPath>
                                                            </defs>
                                                            <g clipPath="url(#circle-clip)">
                                                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${friend.f_profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                            </g>
                                                        </svg>
                                                    </Link>
                                                    <div className="friends-username-block">
                                                        <Link to={`/user/${friend.friendId}`} className="link-text">
                                                            <span title={friend.f_name}>{friend.f_name}</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="friends-action-block-unfriend">
                                                    <button onPointerUp={(e) => this.popsUpConfirmation(e, friend.friendId, index, "unfriend", friend.f_name)}>Unfriend</button>
                                                </div>
                                                <div className="friends-action-block-block">
                                                    <button onClick={(e) => this.popsUpConfirmation(e, friend.friendId, index, "friends", friend.f_name)}>Block</button>
                                                </div>
                                            </div>
                                        </div>
                                        ))
                                    :
                                    (!this.state.myFriendsLoader) ? 
                                    <div className="no-result-friend-user-container">
                                        <span>Oh no... no existed user...</span>
                                    </div>
                                    :
                                    null
                                :
                                this.state.myFriendsLoader ? 
                                null
                                :
                                <div className="no-result-friend-user-container">
                                    <span>No have any friends...</span>
                                </div>
                                }
                                
                            </div>
                             
                            {this.state.myFriendsLoader ? 
                            <div className="load-search-friend-user-container">
                                <div></div>
                            </div>
                            :
                            null
                            }

                        </div>
                        :
                        null
                        }


                        {/* friend requests container */}
                        {this.state.animationContainer === "request" ?
                        <div className="friends-container">
                            <div className="friends-block-search-bar request">
                                <div className="request-btn-container">
                                    <div className={this.state.friendRequestAnimate ? "animation-request-block friend-request" :
                                                    this.state.friendSentAnimate ? "animation-request-block sent-request" : "animation-request-block"}></div>
                                    <div className="request-btn-block" onPointerUp={this.friendRequestBtn}>
                                        Friend Request
                                        {this.state.totalFriendRequests > 0 ?
                                        <div>{this.state.totalFriendRequests}</div>
                                        :
                                        null
                                        }
                                    </div>
                                    <div className="request-btn-block" onPointerUp={this.sentRequestBtn}>
                                        Sent Request
                                        {this.state.totalSentRequests > 0 ?
                                        <div>{this.state.totalSentRequests}</div>
                                        :
                                        null
                                        }
                                    </div>
                                </div>
                                {this.state.friendRequestAnimate ? 
                                <input type="text" autoComplete="off" placeholder="Search friend requests..." ref={this.friendRequestSearchBar} onInput={this.searchFriendRequest}/>
                                :
                                this.state.friendSentAnimate ? 
                                <input type="text" autoComplete="off" placeholder="Search sent requests..." ref={this.sentRequestSearchBar} onInput={this.searchSentRequest }/>
                                :
                                null
                                }
                            </div>

                            <div className="friends-block">
                                
                                {this.state.requestsFriend !== undefined ?
                                    this.state.requestsFriend.length > 0 ?
                                        this.state.requestsFriend.map((friend, index, array) => (
                                        <div className="friend-card-pad-container" key={index}>
                                            <div className="friend-card-container">
                                                <div className="friends-user-border">
                                                    <img src={`${process.env.REACT_APP_API_URL}/media/${friend.background}`} />
                                                    <Link to={`/user/${friend.userId}`} style={{display: "flex"}}>
                                                        <svg viewBox="0 0 100 100" width="100" height="100">
                                                            <title>{friend.name}</title>
                                                            <defs>
                                                                <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                                <clipPath id="circle-clip">
                                                                <use xlinkHref="#circle"/>
                                                                </clipPath>
                                                            </defs>
                                                            <g clipPath="url(#circle-clip)">
                                                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${friend.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                            </g>
                                                        </svg>
                                                    </Link>
                                                    <div className="friends-username-block">
                                                        <Link to={`/user/${friend.userId}`} className="link-text">
                                                            <span title={friend.name}>{friend.name}</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="friends-action-block-unfriend">
                                                    {this.state.friendRequestAnimate ?
                                                    <button onPointerUp={() => this.confirmRequestMethod(friend.userId, index)}>Confirm</button>
                                                    :
                                                    <button onPointerUp={() => this.cancelRequestMethod(friend.userId, index, "cancel")}>Cancel Requests</button>
                                                    }
                                                </div>
                                                <div className="friends-action-block-block">
                                                    {this.state.friendRequestAnimate ?
                                                    <button onPointerUp={() => this.cancelRequestMethod(friend.userId, index, "delete")}>Delete</button>
                                                    :
                                                    <button onClick={(e) => this.popsUpConfirmation(e, friend.userId, index, "friendRequest", friend.f_name)}>Block</button>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        ))
                                    :
                                    (!this.state.requestsFriendLoader) ? 
                                    <div className="no-result-friend-user-container">
                                        <span>Oh no... no existed user...</span>
                                    </div>
                                    :
                                    null
                                :
                                this.state.requestsFriendLoader ? 
                                null
                                :
                                <div className="no-result-friend-user-container">
                                    {this.state.friendRequestAnimate ?
                                    <span>No have any friend requests...</span>
                                    :
                                    <span>No have any sent requests...</span>
                                    }
                                </div>
                                }
                                
                            </div>
                             
                            {this.state.requestsFriendLoader ? 
                            <div className="load-search-friend-user-container">
                                <div></div>
                            </div>
                            :
                            null
                            }

                        </div>
                        :
                        null
                        }


                        {/* find friend container */}
                        {this.state.animationContainer === "new" ?
                        <div className="friends-container">
                            <div className="friends-block-search-bar">
                                <input type="text" autoComplete="off" placeholder="Search friend..." onInput={this.searchNewFriend} ref={this.newFriendSearchBar}/>
                            </div>

                            <div className="friends-block">

                                {this.state.newFriends !== undefined ?
                                 this.state.newFriends.length > 0 ?
                                    this.state.newFriends.map((friend, index, array) => 
                                    (
                                        <div className="friend-card-pad-container" key={index}>
                                            <div className="friend-card-container">
                                                <div className="friends-user-border">
                                                    <img src={`${process.env.REACT_APP_API_URL}/media/${friend.f_background}`} />
                                                    <Link to={`/user/${friend.friendId}`} style={{display: "flex"}}>
                                                        <svg viewBox="0 0 100 100" width="100" height="100">
                                                            <title>{friend.f_name}</title>
                                                            <defs>
                                                                <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                                <clipPath id="circle-clip">
                                                                <use xlinkHref="#circle"/>
                                                                </clipPath>
                                                            </defs>
                                                            <g clipPath="url(#circle-clip)">
                                                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${friend.f_profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                            </g>
                                                        </svg>
                                                    </Link>
                                                    <div className="friends-username-block">
                                                        <Link to={`/user/${friend.friendId}`} className="link-text">
                                                            <span title={friend.f_name}>{friend.f_name}</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="friends-action-block-add">
                                                    <button onPointerUp={(e) => this.addfriendMethod(friend.friendId, index)}>Add Friend</button>
                                                </div>
                                                <div className="friends-action-block-block">
                                                    <button onClick={(e) => this.popsUpConfirmation(e, friend.friendId, index, "findFriend", friend.f_name)}>Block</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    :
                                    this.state.newFriendLoader ?
                                    null
                                    :
                                    <div className="no-result-friend-user-container">
                                        <span>Oh no... no existed user...</span>
                                    </div>
                                    :
                                    this.state.newFriendLoader ?
                                    null:
                                    <div className="no-result-friend-user-container">
                                        <span>Find new friend, Make some friends</span>
                                    </div>
                                }
                                               
                            </div>

                                {this.state.newFriendLoader ?
                                    <div className="load-search-friend-user-container">
                                        <div></div>
                                    </div>
                                    :
                                    null
                                }
                        </div>
                        :
                        null
                        }



                        {/* blocked user container */}
                        {this.state.animationContainer === "blocked" ?
                        <div className="friends-container">
                            <div className="friends-block-search-bar block">
                                <div>{this.state.totalBlockedUsers} Users</div>
                                <input type="text" autoComplete="off" placeholder="Search blocked user..." ref={this.blockedSearchBar} onInput={this.searchBlockedUser}/>
                            </div>

                            <div className="friends-block">

                                {this.state.blockedUsers !== undefined ?
                                    this.state.blockedUsers.length > 0 ?
                                    this.state.blockedUsers.map((user, index, array) => 
                                    (
                                    <div className="friend-card-pad-container" key={index}>
                                        <div className="friend-card-container">
                                            <div className="friends-user-border">
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${user.f_background}`} />
                                                <Link to={`/user/${user.friendId}`} style={{display: "flex"}}>
                                                    <svg viewBox="0 0 100 100" width="100" height="100">
                                                        <title>{user.f_name}</title>
                                                        <defs>
                                                            <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                            <clipPath id="circle-clip">
                                                            <use xlinkHref="#circle"/>
                                                            </clipPath>
                                                        </defs>
                                                        <g clipPath="url(#circle-clip)">
                                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${user.f_profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                        </g>
                                                    </svg>
                                                </Link>
                                                <div className="friends-username-block">
                                                    <Link to={`/user/${user.friendId}`} className="link-text">
                                                        <span title={user.f_name}>{user.f_name}</span>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="friends-action-block-unblock">
                                                <button onClick={() => this.unBlockedMethod(user.friendId, index)}>Unblock</button>
                                            </div>
                                        </div>
                                    </div>
                                    ))
                                    :
                                    this.state.blockUsersLoader ?
                                    null
                                    :
                                    <div className="no-result-friend-user-container">
                                        <span>Oh no... no existed user...</span>
                                    </div>
                                    :
                                    this.state.blockUsersLoader ?
                                    null 
                                    :
                                    <div className="no-result-friend-user-container">
                                        <span>No users in blocked list</span>
                                    </div>
                                }
                                
                            </div>

                            {this.state.blockUsersLoader ?
                            <div className="load-search-friend-user-container">
                                <div></div>
                            </div>
                            :
                            null
                            }

                        </div>
                        :
                        null
                        }

                    </div>

                    {this.state.confirmationBlock ?
                        this.state.confirmationType === "unfriend" ?
                            <div className="pops-confirmation-container">
                                <div className="pops-confirmation-block">
                                    <div className="pops-confirmation-header">
                                        <span>Are you Sure?</span>
                                    </div>
                                    <div className="pops-confirmation-content">
                                        <span>Unfriend with</span>
                                        <div>
                                            <span>{this.confirmationObject.name}</span>
                                        </div>
                                    </div>
                                    <div className="pops-confirmation-footer">
                                        <div onPointerUp={() => this.unfriendedMethod(this.confirmationObject.fId, this.confirmationObject.index)}>Yes</div>
                                        <div onPointerUp={this.closeConfirmation}>No</div>
                                    </div>
                                </div>
                            </div>
                        :
                        this.state.confirmationType === "blocked" ?
                            <div className="pops-confirmation-container">
                                <div className="pops-confirmation-block">
                                    <div className="pops-confirmation-header">
                                        <span>Are you Sure?</span>
                                    </div>
                                    <div className="pops-confirmation-content">
                                        <span>To block the user</span>
                                        <div>
                                            <span>{this.confirmationObject.name}</span>
                                        </div>
                                    </div>
                                    <div className="pops-confirmation-footer">
                                        <div onClick={() => this.blockedMethod(this.confirmationObject.fId, this.confirmationObject.index, this.confirmationObject.type)}>Yes</div>
                                        <div onPointerUp={this.closeConfirmation}>No</div>
                                    </div>
                                </div>
                            </div>
                        :
                        null
                    :
                    null
                    }
                </div>
            );
        }
    }

    export function Container({ clientSocket, userId }): JSX.Element
    {
        let LOAD: boolean = false;
        const location: Location = useLocation();
        const [cookie, setCookies, removeCookie] = useCookies();
        const navigate: NavigateFunction = useNavigate();

        return (
            <Block Navigate={navigate} cookie={cookie} setCookie={setCookies} removeCookie={removeCookie} Location={location} clientSocket={clientSocket} userId={userId}/>
        );
    }
}