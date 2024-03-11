import React, { useEffect, createRef, LegacyRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import  { Cookies, useCookies }  from "react-cookie";
import "../css/home-dark.css";
import { UserContainer } from "./user-container.tsx";
import { PostPropState } from "./props-state/post.tsx";
import { TimeDate } from "./method/time-config-function.tsx";
import "../css/dark-user-setting.css";
import { UserPropState } from "./props-state/user.tsx";
import "../css/dark-friend.css";

export namespace User 
{
    export class Body extends React.Component<UserPropState.Props, UserPropState.State>
    {
        private LOAD: boolean = false;
        private text: React.RefObject<HTMLTextAreaElement>;
        private textPost: React.RefObject<HTMLTextAreaElement>;
        private darkToggleBtn: React.RefObject<HTMLInputElement>;
        private postFileInput: React.RefObject<HTMLInputElement>;
        private searchPost: React.RefObject<HTMLInputElement>;
        private postFormContainer: React.RefObject<HTMLDivElement>;
        private notificationRef: React.RefObject<HTMLDivElement>;
        private noticeFriendRef: React.RefObject<HTMLDivElement>;
        private noticeMessageRef: React.RefObject<HTMLDivElement>;
        private notificationIconRef: React.RefObject<HTMLDivElement>;
        private noticeFriendIconRef: React.RefObject<HTMLDivElement>;
        private noticeMessageIconRef: React.RefObject<HTMLDivElement>;
        private notificationNumRef: React.RefObject<HTMLDivElement>;
        private noticeFriendNumRef: React.RefObject<HTMLDivElement>;
        private noticeMessageNumRef: React.RefObject<HTMLDivElement>;
        private searchPostContainer: React.RefObject<HTMLDivElement>;
        private notificationBorderRef: LegacyRef<SVGSVGElement>;
        private noticeFriendBorderRef: LegacyRef<SVGSVGElement>;
        private noticeMessageBorderRef: LegacyRef<SVGSVGElement>;
        private HomeContainerDiv: React.RefObject<HTMLDivElement>;
        private NoticeCancelContainer: React.RefObject<HTMLDivElement>;
        private searchPostTimer: ReturnType<typeof setTimeout> | undefined;
        private p1: any;
        private p2: any;
        private p3: any;
        private p4: any;
        private notificationTarget: boolean;
        private fetchPostTimer: ReturnType<typeof setTimeout> | undefined;
        private homePath: boolean;
        private currentPath: string;
        private userId: string | undefined = undefined;
        private currentUserId: string | undefined = undefined;
        private confirmationObject: { fId: string | undefined, name: string | undefined, type: string | undefined};
        private userPostScroll: React.RefObject<HTMLDivElement>;

        private socketClient: any = undefined;
 
// {commentId: "1", postId: "7", postUserId: "1", commentUserId: "12", commentUserIcon: "https://uploads.dailydot.com/2018/10/olli-the-polite-cat.jpg?q=65&w=800&ar=2:1&fit=crop", name: "asd asd", content: "yolo", media: "1672725423794-870314175.png".split(",").map(m => `${process.env.REACT_APP_API_URL!}/media/${m}`), time: "3-1-2023/13:57"}
        constructor(props)
        {
            super(props);

            this.state = 
            {
                sideBarButton     : false,
                sideBar           : false,
                // post              : [{ postId: "7", userId: "1", userIcon: "blankpf.jpg", name: "asdasd asd", time: 12, content: "asd \n asd", username: "asdasd",
                //                     media: ["1672735858574-453818646.png", "1672817143255-934147325.png", "1672735858574-453818646.png"] ,
                //                     liked: false ,like: "1000", commentNum: "1000", commentRefs: createRef(), likeBtn: createRef(), commentBtn: createRef(), commentSection: false, commentContainer: false, commentTextArea: createRef(), commentFile: createRef(), blobMedia: { blob: "", type: "" },
                //                     comments: [], noMoreComments: false, loadComments: false},],
                post              : [],
                darkToggle        : false,
                postToggle        : false,
                blobPostMedia     : [],
                postBtnActive     : false,
                overSizeMedia     : false,
                serverErrorPost   : false,
                postSuccess       : false,
                id                : "",
                name              : "",
                userIcon          : "blankpf.jpg",
                userBackground    : "blankbg.jpg",
                viewImageContainer: false,
                viewImageArray    : [],
                viewImgLeftBtn    : false,
                viewImgRightBtn   : false,
                viewIndexImage    : 0,
                username          : "",
                // homePath          : false,
                onlineStatus      : false,
                noticeFriend      : 0,
                noticeMessage     : 0,
                notification      : 0,
                notificationData  : [],
                noticeFriendData  : [],
                noticeMessageData : [],
                toggleNotification: false,
                toggleNoticeFriend: false,
                toggleNoticeMsg   : false,
                postLoader        : false,
                noMorePost        : false,
                fisrtPostLoaded   : false,
                homePath          : false,
                loadMessage       : false,
                fRequestData      : [],
                closePostControl  : undefined,
                closeComment      : undefined,
                deletePostConfirm : undefined,
                reportPostConfrim : undefined,
                deleteConConfirm  : undefined,
                reportConConfirm  : undefined,
                reportNotice      : false,
                searchPostLoader  : false,
                searchPostData    : [],
                searchPostToggle  : false,
                searchPostBlock   : false,
                searchPostEmpty   : false,
                userInfo          : undefined,
                userExist         : undefined,
                me                : true,
                firstLoaded       : false,
                confirmationBlock : false,
                confirmationType  : "",
                viewUserImg       : undefined,
                commentOverSize   : false,
                commentWrongFormat: false,
                commentError      : false,
                postUploadLoader  : false,
                }

            this.text                   = createRef();
            this.textPost               = createRef();
            this.darkToggleBtn          = createRef();
            this.postFileInput          = createRef();
            this.postFormContainer      = createRef();
            this.notificationRef        = createRef();
            this.noticeFriendRef        = createRef();
            this.noticeMessageRef       = createRef();
            this.notificationIconRef    = createRef();
            this.noticeFriendIconRef    = createRef();
            this.noticeMessageIconRef   = createRef();
            this.notificationNumRef     = createRef();
            this.noticeFriendNumRef     = createRef();
            this.noticeMessageNumRef    = createRef();
            this.notificationBorderRef  = createRef();
            this.noticeFriendBorderRef  = createRef();
            this.noticeMessageBorderRef = createRef();
            this.p1                     = createRef();
            this.p2                     = createRef();
            this.p3                     = createRef();
            this.p4                     = createRef();
            this.HomeContainerDiv       = createRef();
            this.NoticeCancelContainer  = createRef();
            this.searchPost             = createRef();
            this.searchPostContainer    = createRef();
            this.userPostScroll         = createRef();

            this.notificationTarget = false;
            this.homePath           = false;

            // this.sideBar           = this.sideBar.bind(this);
            // this.postTextContainer = this.postTextContainer.bind(this);
            // this.postFile          = this.postFile.bind(this);
            // this.postDeleteFile    = this.postDeleteFile.bind(this);
            // this.postUpload        = this.postUpload.bind(this);
            this.checkCookie       = this.checkCookie.bind(this);
            this.like              = this.like.bind(this);
            this.comment           = this.comment.bind(this);
            this.commentSection    = this.commentSection.bind(this);
            this.commentTextArea   = this.commentTextArea.bind(this);
            this.postComment       = this.postComment.bind(this);
            this.commentBlob       = this.commentBlob.bind(this);
            this.cancelBlobComment = this.cancelBlobComment.bind(this);
            this.viewImgContainer  = this.viewImgContainer.bind(this);
            this.viewImgPreBtn     = this.viewImgPreBtn.bind(this);
            this.viewImgNextBtn    = this.viewImgNextBtn.bind(this);
            this.viewImgCancelBtn  = this.viewImgCancelBtn.bind(this);
            // this.logOut            = this.logOut.bind(this);
            this.hiddenToggle      = this.hiddenToggle.bind(this);
            // this.fetchNotification = this.fetchNotification.bind(this);
            // this.fetchNoticeMsg    = this.fetchNoticeMsg.bind(this);
            // this.fetchNoticeFriend = this.fetchNoticeFriend.bind(this);
            this.toggleNotice      = this.toggleNotice.bind(this);
            this.closeToggleNotice = this.closeToggleNotice.bind(this);
            this.targetNotice      = this.targetNotice.bind(this);
            // this.MsgNotice         = this.MsgNotice.bind(this);
            this.FriendNotice      = this.FriendNotice.bind(this);
            this.fetchPost         = this.fetchPost.bind(this);
            // this.windowScrollEvent = this.windowScrollEvent.bind(this);
            // this.cancelNoticeBlock = this.cancelNoticeBlock.bind(this);
            this.postControlOption = this.postControlOption.bind(this);
            this.commentOption     = this.commentOption.bind(this);
            this.deletePost        = this.deletePost.bind(this);
            this.deletedPost       = this.deletedPost .bind(this);
            this.reportPost        = this.reportPost.bind(this);
            this.reportedPost      = this.reportedPost.bind(this);
            this.deleteComment     = this.deleteComment.bind(this);
            this.deletedComment    = this.deletedComment.bind(this);
            this.reportComment     = this.reportComment.bind(this);
            this.reportedComment   = this.reportedComment.bind(this);
            // this.searchPostEvent   = this.searchPostEvent.bind(this);
            // this.searchPostScroll  = this.searchPostScroll.bind(this);
            // this.searchKeyInEvent  = this.searchKeyInEvent.bind(this);
            this.unfriendedMethod     = this.unfriendedMethod.bind(this);
            this.popsUpConfirmation   = this.popsUpConfirmation.bind(this);
            this.closeConfirmation    = this.closeConfirmation.bind(this);
            this.addfriendMethod      = this.addfriendMethod.bind(this);
            this.cancelRequestMethod  = this.cancelRequestMethod.bind(this);
            this.confirmRequestMethod = this.confirmRequestMethod.bind(this);
            this.blockedMethod        = this.blockedMethod.bind(this);
            this.unBlockedMethod      = this.unBlockedMethod.bind(this);
            this.viewUserIcon         = this.viewUserIcon.bind(this);
            this.viewUserBackground   = this.viewUserBackground.bind(this);

        }

        scrollPostEvent()
        {
            setTimeout(() => {
                if(this.userPostScroll.current !== null)
                {
                    this.userPostScroll.current!.onscroll = (): void =>
                    {
                        if(this.state.noMorePost == false)
                        {

                            const elmTop: number = this.userPostScroll.current!.scrollTop;
                            const elmHeight: number =  this.userPostScroll.current!.scrollHeight;
                            const elmClientHeight: number = this.userPostScroll.current!.clientHeight;

                            const heightPercentage: number = Math.round((elmTop / (elmHeight - elmClientHeight)) * 100);

                            if(heightPercentage >= 100)
                            {
                                if(this.fetchPostTimer === undefined)
                                {
                                    this.setState(() => ({ postLoader: true }));

                                    this.fetchPostTimer = setTimeout((): void => 
                                    {
                                        this.fetchPost();
                                        this.fetchPostTimer = undefined;

                                    }, 1000);

                                }
                            }

                        }
                        
                    }

                } else 
                {
                    this.scrollPostEvent();
                }
            }, 1000);
        }

        componentDidMount(): void
        {
            if(!this.LOAD)
            {
                this.LOAD = true;

                if(this.props.cookie.sconnecti !== undefined && this.props.cookie.sconnecti !== "")
                {
                    // this.socketClient = io(`${process.env.REACT_APP_API_URL}`, {
                    //                     withCredentials: true,
                    //                     extraHeaders: { "cors-socket-headers": "meow" }
                    //                 });;

                    // this.webSocket();

                    if(this.currentUserId === undefined)
                    {
                        this.currentUserId= this.props.userId;
                        // this.fetchPost();
                        this.fetchUserInfo();
                        this.scrollPostEvent();
                    }

                    this.setState(() => ({ loadMessage: true }));

                    document.title = "User";

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

        async unfriendedMethod(fId: string | undefined): Promise<void> 
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
                        // const myFriend: Array<any> | null | undefined = this.state.myFriends;

                        // if(index !== undefined)
                        // {
                        //     myFriend?.splice(index, 1);
                        // }
                        
                        this.setState((e) => ({ confirmationBlock: false, confirmationType: ""}));

                        this.refreshUserInfo();

                        this.confirmationObject = { fId: undefined,name: undefined, type: undefined };

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

        popsUpConfirmation(e: any, fId: any, type: string, name: any): void 
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

                    this.confirmationObject = { fId: fId, name: name, type: undefined };

                } else if(type === "friends" || type === "friendRequest" || type === "findFriend")
                {
                    this.setState(() => 
                    ({
                        confirmationType: "blocked",
                        confirmationBlock: true
                    }));

                    this.confirmationObject = { fId: fId, name: name, type: type }
                }
            }
        }

        closeConfirmation(): void 
        {
            this.setState(() => ({ confirmationBlock: false, confirmationType: "" }));
            this.confirmationObject = { fId: undefined, name: undefined, type: undefined };
        }

        async addfriendMethod(id: any): Promise<void> 
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
                        // const newFriendData: Array<any> | undefined = (this.state.newFriends === undefined) ? [] : this.state.newFriends;

                        // newFriendData.splice(index, 1);

                        // this.setState(() => ({ newFriends: newFriendData }));

                        this.refreshUserInfo();
        
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

        async cancelRequestMethod(userId: any, action: string): Promise<void> 
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
                        // const requestData: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                        // requestData.splice(index, 1);

                        // if(action === "delete")
                        // {
                        //     this.setState((e) => ({ requestsFriend: requestData, totalFriendRequests: e.totalFriendRequests - 1 }));
                            
                        // } else 
                        // {
                        //     this.setState((e) => ({ requestsFriend: requestData, totalSentRequests: e.totalSentRequests - 1 }));
                        // }

                        this.refreshUserInfo();
                        

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

        async confirmRequestMethod(userId: any): Promise<void>
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
                        // const requestData: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                        // requestData.splice(index, 1);
                        // this.setState((e) => ({ requestsFriend: requestData, totalFriendRequests: e.totalFriendRequests - 1 }));

                        this.refreshUserInfo();
                        

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

        async blockedMethod(userId: any): Promise<void>
        {
            this.checkCookie();

            if(userId !== "" && userId !== undefined)
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
                        // if(action === "friends")
                        // {
                        //     const data: Array<any> = (this.state.myFriends !== undefined) ? this.state.myFriends : [];

                        //     data.splice(index, 1);
                        //     this.setState((e) => ({ totalFriends: e.totalFriends - 1, myFriends: data }));

                        // } else if(action === "friendRequest") 
                        // {
                        //     const data: Array<any> = (this.state.requestsFriend !== undefined) ? this.state.requestsFriend : [];

                        //     data.splice(index, 1);
                        //     this.setState((e) => ({ totalSentRequests: e.totalSentRequests - 1, requestsFriend: data }));

                        // } else if(action === "findFriend")
                        // {
                        //     const data: Array<any> = (this.state.newFriends !== undefined) ? this.state.newFriends : [];

                        //     data.splice(index, 1);
                        //     this.setState((e) => ({ newFriends: data }));
                        // }

                        // this.setState(() => ({ confirmationBlock: false, confirmationType: "" }));
                        // this.confirmationObject = { fId: undefined, index: undefined, name: undefined, type: undefined };
                        this.fetchUserInfo();

                        this.setState((e) => ({ confirmationBlock: false, confirmationType: ""}));

                        this.confirmationObject = { fId: undefined,name: undefined, type: undefined };



                    } else 
                    {
                        console.log(result.result);
                    }

                } else {
                    console.log("Network Error");
                }
            }
        }

        async unBlockedMethod(fId: any): Promise<void> 
        {
            this.checkCookie();

            if(fId !== "" && fId !== undefined)
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
                        // const data: Array<any> = (this.state.blockedUsers !== undefined) ? this.state.blockedUsers : [];

                        // data.splice(index, 1);

                        // this.setState((e) => 
                        // ({
                        //     totalBlockedUsers: e.totalBlockedUsers - 1,
                        //     blockedUsers: data
                        // }));

                        this.fetchUserInfo();

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

        componentDidUpdate(prevProps: Readonly<UserPropState.Props>, prevState: Readonly<UserPropState.State>, snapshot?: any): void 
        {

            // if(this.props.Location.pathname === "/")
            // {
            //     if(this.state.homePath !== true)
            //     {
            //         this.setState(() => ({ homePath: true }));
            //     }
  
            // } else if(prevProps.Location.pathname !== "/" && this.props.Location.pathname === "/")
            // {
            //     if(this.state.homePath !== true)
            //     {
            //         this.setState(() => ({ homePath: true }));
                
            //     }

            // } else if(this.props.Location.pathname !== "/")
            // {
            //     if(this.state.homePath !== false)
            //     {
            //         this.setState(() => ({ homePath: false }));
                    
            //     }

            // }

            if(this.currentUserId !== undefined && this.currentUserId !== "" && this.props.userId !== undefined && this.props.userId !== "")    
            {
                if(this.currentUserId?.toString() !== this.props.userId.toString())
                {
                    this.setState(() => ({ post: [], noMorePost: false }))
                    this.currentUserId = this.props.userId;
                    this.fetchUserInfo();
                    // this.fetchPost();
                }

            }


        }

        refreshUserInfo(): void
        {
            this.checkCookie();
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            fetch(`${process.env.REACT_APP_API_URL}/user?u=${key}&uid=${this.currentUserId}`)
            .then(response => 
                {
                    if(response.ok)
                    {
                       return response.json();
                    }
                })
            .then((result): void =>
            {
                if(result.success)
                {
                    this.setState(() => ({ firstLoaded: true }));

                    if(result.user === true)
                    {
                        if(result.friendStatus === true)
                        {
    
                            const userInfo: any = { userId: result.userInfo[0].userId, username: result.userInfo[0].username, name: result.userInfo[0].name, profile: result.userInfo[0].profile, background: result.userInfo[0].background, 
                                                    dateJoin: result.userInfo[0].date_join, friendExist: result.friendStatus, friendAction: result.friendInfo[0] };

                            this.setState(() => ({ userInfo: userInfo, userExist: true, me: result.me }));

                        } else 
                        {
                            const userInfo: any = { userId: result.userInfo[0].userId, username: result.userInfo[0].username, name: result.userInfo[0].name, profile: result.userInfo[0].profile, background: result.userInfo[0].background, 
                                                    dateJoin: result.userInfo[0].date_join, friendExist: result.friendStatus };


                            this.setState(() => ({ userInfo: userInfo, userExist: true, me: result.me }));
                        }

                    } else 
                    {
                        this.setState(() => ({ userExist: false }));
                    }
                }
            });
        }

        fetchUserInfo(): void
        {
            this.checkCookie();
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            fetch(`${process.env.REACT_APP_API_URL}/user?u=${key}&uid=${this.currentUserId}`)
            .then(response => 
                {
                    if(response.ok)
                    {
                       return response.json();
                    }
                })
            .then((result): void =>
            {
                if(result.success)
                {
                    this.setState(() => ({ firstLoaded: true }));

                    if(result.user === true)
                    {
                        if(result.friendStatus === true)
                        {
                            console.log(result)
                            const userInfo: any = { userId: result.userInfo[0].userId, username: result.userInfo[0].username, name: result.userInfo[0].name, profile: result.userInfo[0].profile, background: result.userInfo[0].background, 
                                                    dateJoin: result.userInfo[0].date_join, friendExist: result.friendStatus, friendAction: result.friendInfo[0] };

                            console.log(userInfo)
                            this.fetchPost();

                            this.setState(() => ({ userInfo: userInfo, userExist: true, me: result.me }));

                        } else 
                        {
                            const userInfo: any = { userId: result.userInfo[0].userId, username: result.userInfo[0].username, name: result.userInfo[0].name, profile: result.userInfo[0].profile, background: result.userInfo[0].background, 
                                                    dateJoin: result.userInfo[0].date_join, friendExist: result.friendStatus, friendAction: { f_status: "ok", action: "ok" } };

                            console.log(userInfo)
                            this.fetchPost();

                            this.setState(() => ({ userInfo: userInfo, userExist: true, me: result.me }));
                        }

                    } else 
                    {
                        this.setState(() => ({ userExist: false }));
                    }
                }
            });
        }

        // windowScrollEvent(): void 
        // {
        //     this.HomeContainerDiv.current!.onscroll = (e: any) =>
        //     {
        //         if(!this.state.noMorePost && this.props.Location.pathname === "/")
        //         {
        //             const elmTop: number = this.HomeContainerDiv.current!.scrollTop;
        //             const elmHeight: number =  this.HomeContainerDiv.current!.scrollHeight;
        //             const elmClientHeight: number = this.HomeContainerDiv.current!.clientHeight;

        //             const heightPercentage: number = Math.round((elmTop / (elmHeight - elmClientHeight)) * 100);

        //             if(heightPercentage >= 100)
        //             {
        //                 if(this.fetchPostTimer === undefined)
        //                 {
        //                     this.setState(() => ({ postLoader: true }));

        //                     this.fetchPostTimer = setTimeout((): void => 
        //                     {
        //                         this.fetchPost();
        //                         this.fetchPostTimer = undefined;

        //                     }, 1000);

        //                 }
        //             }
        //         }
        //     }
        // }

        // searchPostScroll(): void 
        // {
        //     if(!this.state.searchPostEmpty)
        //     {
        //         const elmTop: number = this.searchPostContainer.current!.scrollTop;
        //         const elmHeight: number =  this.searchPostContainer.current!.scrollHeight;
        //         const elmClientHeight: number = this.searchPostContainer.current!.clientHeight;

        //         const heightPercentage: number = Math.round((elmTop / (elmHeight - elmClientHeight)) * 100);

        //         if(heightPercentage >= 100)
        //         {
        //             if(this.searchPostTimer === undefined)
        //             {
        //                 this.setState(() => ({ searchPostLoader: true }));

        //                 this.searchPostTimer = setTimeout((): void => 
        //                 {
        //                     this.searchPostEvent();
        //                     this.searchPostTimer = undefined;

        //                 }, 1000);

        //             }
        //         }

        //     }
        // }

        // webSocket(): void 
        // {
        //     // when user connect online
        //     this.socketClient.on("connect", (): void =>
        //     {
        //         const CSRF = async (): Promise<void> => 
        //             {
        //                 const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
        //                 const promise = await fetch(`${process.env.REACT_APP_API_URL!}/u?u=${key}`);

        //                 if(promise.ok)
        //                 {
        //                     const result: { result: boolean, p: boolean, ct: string | undefined, i: string, name: string, icon: string, username: string } = await promise.json();

        //                     if(result.result === true && result.ct !== "" && result.ct !== undefined)
        //                     {
        //                         console.log(`p=${result.p}`);
        //                         this.setState(() => ({ id: result.i, name: result.name, userIcon: result.icon, username: result.username, onlineStatus: true, homePath: (this.props.Location.pathname === "/") }));
        //                         this.fetchNoticeFriend();
        //                         this.fetchPost();
        //                         this.windowScrollEvent();
        //                         this.fetchChatNum();

        //                         this.socketClient.emit("userId", result.i.toString());
        //                         console.log(this.socketClient.id);
        //                         // this.homePath = (this.props.Location.pathname === "/");
        //                         this.currentPath = this.props.Location.pathname;

        //                         this.userId = result.i.toString();

        //                     }

        //                 } else 
        //                 {
        //                     CSRF();
        //                     console.log("status network error");
        //                 }
        //             }

        //             CSRF();

        //         console.log(this.socketClient.id);
        //         this.setState(() => 
        //         ({
        //             onlineStatus: true
        //         }));
        //     });

        //     // when user disconnected
        //     this.socketClient.on("disconnect", (): void => 
        //     {
        //         this.setState(() => 
        //         ({ 
        //             onlineStatus: false
        //         }));
                
        //         if(this.userId !== undefined)
        //         {
        //             this.socketClient.emit("t", this.userId);
        //         }

        //     });

        //     this.socketClient.on("auth", (result: string): void => 
        //     {
        //         console.log(result);
        //     });

        //     this.socketClient.on("noticeFriend", (num: number): void =>
        //     {
        //         this.fetchNoticeFriend();
        //     });

        //     this.socketClient.on("new-group-chat", (data: any): void =>
        //     {
        //         this.fetchChatNum();
        //     });

        //     this.socketClient.on("new-friend-chat", (data: any): void =>
        //     {
        //         this.fetchChatNum();
        //     });

        //     this.socketClient.on("refreshMsgNum", (data: any): void =>
        //     {
        //         this.fetchChatNum();
        //     });

        //     this.socketClient.on("group-message", (data: any): void => 
        //     {
        //         this.fetchChatNum();
        //     });

        // }

        // fetchChatNum(): void 
        // {
        //     this.checkCookie();

        //     const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

        //     fetch(`${process.env.REACT_APP_API_URL}/messagelist?u=${key}`)
        //     .then(response => response.json())
        //     .then(result => 
        //     {
        //         let num: number = 0;

        //         result.forEach(e => num += e.unseen_msg);

        //         this.setState(() => ({ noticeMessage: num }));

        //     });
        // }

        // sideBar(): void
        // {
        //     this.setState((s) => ({
        //         sideBarButton: (s.sideBarButton === true ? false : true),
        //         sideBar      : (s.sideBarButton === true ? false : true)
        //     }));

        //     this.socketClient.emit("msg", "hello", "1");
        // }

        // async fetchNoticeFriend(): Promise<void> 
        // {
        //     this.checkCookie();
            
        //     const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
        //     const promise = await fetch(`${process.env.REACT_APP_API_URL}/frequest?u=${key}`);

        //     if(promise.ok)
        //     {
        //         const result: { success: boolean, result: string, data: Array<any> } = await promise.json();

        //         if(result.success)
        //         {
        //             this.setState(() => ({ noticeFriend: result.data.length }));
        //             // console.log(result.data);

        //         } else 
        //         {
        //             console.log(result.result);
        //         }
        //     }
        // }

        toggleNotice(event: any, type: string): void 
        {
            // if(event.button !== 2)
            // {
            //     if(type === "notification")
            //     {
            //         if(this.notificationRef.current !== null)
            //         {
            //             this.setState(() => ({ toggleNotification: false }));

            //         } else 
            //         {
                        
            //             this.setState(() => 
            //             ({ 
            //                 toggleNotification: true,
            //                 toggleNoticeMsg: false,
            //                 toggleNoticeFriend: false
            //             }));
            //         }

            //     } else if(type === "noticeMessage")
            //     {
            //         if(this.noticeMessageRef.current !== null)
            //         {
            //             this.setState(() => ({ toggleNoticeMsg: false }));

            //         } else 
            //         {
            //             this.setState(() => 
            //             ({ 
            //                 toggleNotification: false,
            //                 toggleNoticeMsg: true,
            //                 toggleNoticeFriend: false
            //             }));
            //         }

            //     } else if(type === "noticeFriend")
            //     {
            //         if(this.noticeFriendRef.current !== null)
            //         {
            //             this.setState(() => ({ toggleNoticeFriend: false }));

            //         } else 
            //         {
            //             this.fetchNoticeFriend();

            //             this.setState(() => 
            //             ({ 
            //                 toggleNotification: false,
            //                 toggleNoticeMsg: false,
            //                 toggleNoticeFriend: true
            //             }));
            //         }
            //     }
            // }

        }

        targetNotice(event: any): void
        {
            // if(event.clientX >= event.view.screen.width - 435 && event.clientY >= 60)
            // {
            //     this.notificationTarget = true;
            
            //     setTimeout(() => {
            //         this.notificationTarget = false;
            //     }, 100);
            // }

            this.setState(() => ({ toggleNotification: true }));


        } 

        deletePost(postId: string, postIndex: number, userId: any): void 
        {
            this.setState(() => ({ deletePostConfirm: { postId: postId, postIndex: postIndex, userId: userId }}));
        }

        reportPost(postId: string, postIndex: number): void 
        {
            this.setState(() => ({ reportPostConfrim: { postId: postId, postIndex: postIndex  }}));
        }

        deleteComment(commentId: string, commentIndex: number, postIndex: number, postId: string, userId: any): void 
        {
            this.setState(() => ({ deleteConConfirm: { commentId: commentId, commentIndex: commentIndex, postIndex: postIndex, postId: postId, userId: userId } }));
        }

        reportComment(commentId: string, commentIndex: number, postIndex: number): void 
        {
            this.setState(() => ({ reportConConfirm: { commentId: commentId, commentIndex: commentIndex, postIndex: postIndex } }));
        }

        postControlOption(index: number): void 
        {
            const currentPost: any = this.state.post;
            currentPost[index].controlPost = true;
            
            const controlContainer: any = { index: index };

            this.setState(() => ({ post: currentPost, closePostControl: controlContainer }));
        }

        // MsgNotice(): void 
        // {
        //     this.setState(() => ({ toggleNoticeMsg: true }));
        // }

        async FriendNotice(): Promise<void> 
        {
            // const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
            // const promise = await fetch(`${process.env.REACT_APP_API_URL!}/frequest?u=${key}`);

            //         if(promise.ok)
            //         {
            //             const p: { result: string, data: Array<any>, success: boolean, totalFriendRequest: number } = await promise.json();
                                    
            //             if(p.success)
            //             {

            //                 if(p.data.length > 0)
            //                 {
            //                     this.setState(() => ({ fRequestData: p.data }));
            //                 }

            //             } else 
            //             {
            //                 console.log(p.result);
            //             }

            //         } else 
            //         {
            //             console.log("status network error");
            //         }

            this.setState(() => ({ toggleNoticeFriend: true }));
        }

        // cancelNoticeBlock(): void 
        // {
        //     this.setState(() => 
        //     ({ 
        //         toggleNotification: false,
        //         toggleNoticeMsg: false,
        //         toggleNoticeFriend: false
        //     }));
        // }

        closeToggleNotice(event: any): void 
        {
            // if(event.button !== 2)
            // {
            //     if(event.target !== this.notificationIconRef.current && event.target !== this.noticeMessageIconRef.current && event.target !== this.noticeFriendIconRef.current &&
            //         event.target !== this.notificationNumRef.current && event.target !== this.noticeMessageNumRef.current && event.target !== this.noticeFriendNumRef.current && 
            //         event.target !== this.notificationBorderRef.current && event.target !== this.noticeMessageBorderRef.current && event.target !== this.noticeFriendBorderRef.current &&
            //         event.target !== this.p1.current && event.target !== this.p2.current && event.target !== this.p3.current && event.target !== this.p4.current && !this.notificationTarget &&
            //         event.target !== this.noticeFriendRef.current && event.target !== this.noticeMessageRef.current )
            //     {
            //         console.log(event.target);
            //         if(this.notificationIconRef.current !== null || this.noticeMessageIconRef.current !== null || this.noticeFriendIconRef.current !== null)
            //         {
            //             this.setState(() => 
            //             ({ 
            //                 toggleNotification: false,
            //                 toggleNoticeMsg: false,
            //                 toggleNoticeFriend: false
            //             }));
            //         }
            //     }
            // }
        }

        // searchKeyInEvent(): void
        // {
        //     if(this.searchPostTimer !== undefined)
        //     {
        //         clearInterval(this.searchPostTimer);
        //         this.searchPostTimer = undefined;
        //     }

        //     this.setState(() => ({ searchPostLoader: false, searchPostData: [], searchPostEmpty: false }));

        //     this.searchPostEvent();
        // }

        // searchPostEvent(): void
        // {
        //     this.checkCookie();
        //     const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

        //     if(this.searchPost.current?.value.trim() !== "" && this.searchPost.current !== undefined)
        //     {
        //         this.setState(() => ({ searchPostLoader: true, searchPostBlock: true }));

        //         this.searchPostTimer = setTimeout((): void =>
        //         {
        //             const query: string | undefined = this.searchPost.current?.value.trim();
        //             const num: number = this.state.searchPostData.length;

        //             fetch(`${process.env.REACT_APP_API_URL}/search/post?u=${key}&q=${query}&n=${num}`)
        //             .then(response => response.json())
        //             .then(result =>
        //             {
        //                 if(result.success)
        //                 {
        //                     if(result.posts.length > 0)
        //                     {
        //                         const currentSearch: Array<any> = this.state.searchPostData;
        //                         const newSearchPost: Array<any> = currentSearch.concat(result.posts);

        //                         this.setState(() => ({ searchPostData: newSearchPost, searchPostLoader: false }));   
                                
        //                     } else 
        //                     {
        //                         if(this.state.searchPostData.length > 0)
        //                         {
        //                             this.setState(() => ({ searchPostEmpty: true, searchPostLoader: false }));

        //                         } else 
        //                         {
        //                             this.setState(() => ({ searchPostLoader: false  }));
        //                         }

        //                     }                
        //                 }

        //             });

        //             clearInterval(this.searchPostTimer);
        //             this.searchPostTimer = undefined;

        //         }, 1000);

        //     } else 
        //     {
        //         this.setState(() => ({ searchPostLoader: false, searchPostBlock: false, searchPostData: [], searchPostEmpty: false }));
        //         clearInterval(this.searchPostTimer);
        //         this.searchPostTimer = undefined;

        //     }
        // }

        async fetchPost(): Promise<void> 
        {
            this.checkCookie();

            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
            const userId: string = this.props.userId.toString();

            const num: number = this.state.post.length;

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/upost?u=${key}&uid=${userId}&n=${num}`);

            this.setState(() => ({ postLoader: true }));

            if(promise.ok)
            {
                const result: { success: boolean, data: Array<any>, result: string } = await promise.json();
                this.setState(() => ({ postLoader: false }));

                if(result.success)
                {
                    if(result.data.length !== 0)
                    {
                        const postData: Array<any> = this.state.post;

                        result.data.forEach((e: any): void =>
                        {
                            const sortPostData: any =
                            {
                                postId: e.postId,
                                userId: e.userId,
                                userIcon: e.userIcon,
                                name: e.name,
                                time: e.time,
                                content: e.content,
                                media: e.media,
                                like: e.likes.toString(),
                                commentNum: e.commentNum.toString(),
                                commentRefs: createRef(),
                                likeBtn: createRef(),
                                commentBtn: createRef(),
                                commentSection: false,
                                commentContainer: false,
                                commentTextArea: createRef(),
                                commentFile: createRef(),
                                blobMedia: { blob: "", type: "" },
                                comments: [],
                                noMoreComments: false,
                                loadComments: false,
                                username: e.username,
                                liked: e.liked,
                                deleted: e.deleted,
                                reported: e.reported,  
                                controlPost: false,
                                dateJoin: e.dateJoin
                            }

                            postData.push(sortPostData);
                        }); 

                        const existedPostId: Array<any> = this.state.post.map(e => e.postId);
                        const sortNewPostData: Array<any> = postData.filter(e => !existedPostId.includes(e.postId));
                        // const currentPostData: Array<any> = [];
                        const newPostData: Array<any> = postData.concat(sortNewPostData);
                        

                        this.setState(() => ({ post: newPostData }));

                        if(result.data.filter(e => e.deleted === false).length < 5)
                        {
                            this.fetchPost();
                        }


                    } else 
                    {
                        this.setState(() => ({ noMorePost: true }));
                    }

                    if(this.state.fisrtPostLoaded === false)
                    {
                        this.setState(() => ({ fisrtPostLoaded: true }));
                    }

                } else 
                {
                    console.log(result.result);
                }
            }
        }

        // postTextContainer(textRef: any): void
        // {
        //     // const num = this.state.userInfo.filter(item => item.post.postId == d);
        //     // this.text.current!.style.height = "";
        //     // this.text.current!.style.height = `${this.text.current!.scrollHeight - 20}px`;

        //     textRef.current!.style.height = "";
        //     const limit: number = Math.min(150, Number(textRef.current!.scrollHeight) - 20);
        //     textRef.current!.style.height = `${limit}px`;

        //     if(textRef.current.value.length > 0 || this.state.blobPostMedia.length > 0)
        //     {
        //         this.setState(() => ({ postBtnActive: true }));

        //     } else 
        //     {
        //         this.setState(() => ({ postBtnActive: false }));
        //     }

        // }

        // postFile(): void 
        // {
        //     let files: FileList | null = this.postFileInput.current!.files;
        //     let blobFiles: Array<{ blob: string, type: string, file: File }> = this.state.blobPostMedia;

        //     for(let i = 0; i < files!.length; i++)
        //     {
        //         blobFiles.push({ blob: URL.createObjectURL(files[i]), type: files[i].type.split('/')[0], file: files[i] });
        //     }

        //     this.setState(() => ({ blobPostMedia: blobFiles }));

        //     if(this.textPost.current!.value.length > 0 || this.state.blobPostMedia.length > 0)
        //     {
        //         this.setState(() => ({ postBtnActive: true }));

        //     } else 
        //     {
        //         this.setState(() => ({ postBtnActive: false }));
        //     }

        //     this.postFileInput.current!.value = "";
        // }

        // postDeleteFile(index: number): void
        // {
        //     const blobFile: Array<{ blob: string, type: string, file: File }> = this.state.blobPostMedia;

        //     URL.revokeObjectURL(blobFile[index].blob);

        //     blobFile.splice(index, 1);
        //     this.setState(() => ({ blobPostMedia: blobFile }));

        //     if(this.textPost.current!.value.length > 0 || this.state.blobPostMedia.length > 0)
        //     {
        //         this.setState(() => ({ postBtnActive: true }));

        //     } else 
        //     {
        //         this.setState(() => ({ postBtnActive: false }));
        //     }

        // }

        // async postUpload(): Promise<void>
        // {
        //     if(this.state.postBtnActive)
        //     {
        //         this.checkCookie();

        //         const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());
        //         const textContent: string | undefined = this.textPost.current?.value.trim();
        //         const files: Array<{ blob: string, type: string, file: File }> = this.state.blobPostMedia;
        //         const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;

        //         const form: any = new FormData();
        //         form.append("time", time);

        //         if(textContent !== "" && files.length > 0)
        //         {
        //             files.forEach(e => form.append("files", e.file));

        //             form.append("content", textContent);
        //             form.append("user", user);

        //         } else if (textContent !== "" && files.length <= 0)
        //         {
        //             form.append("content", textContent);
        //             form.append("user", user);

        //         } else if (textContent === "" && files.length > 0)
        //         {
        //             files.forEach(e => form.append("files", e.file));
        //             form.append("user", user);
        //         }

        //         const promise = await fetch(`${process.env.REACT_APP_API_URL!}/post`, {
        //             method: "POST",
        //             body: form
        //         });

        //         if(promise.ok)
        //         {
        //             const p = await promise.json();
                    
        //             if(p.status && p.result === "ok")
        //             {

        //                     const sortPostData: any =
        //                     {
        //                         postId: p.data.postId,
        //                         userId: p.data.userId,
        //                         userIcon: p.data.userIcon,
        //                         name: p.data.name,
        //                         time: p.data.time,
        //                         content: p.data.content,
        //                         media: p.data.media,
        //                         like: p.data.likes.toString(),
        //                         commentNum: p.data.commentNum.toString(),
        //                         commentRefs: createRef(),
        //                         likeBtn: createRef(),
        //                         commentBtn: createRef(),
        //                         commentSection: false,
        //                         commentContainer: false,
        //                         commentTextArea: createRef(),
        //                         commentFile: createRef(),
        //                         blobMedia: { blob: "", type: "" },
        //                         comments: [],
        //                         noMoreComments: false,
        //                         loadComments: false,
        //                         username: p.data.username,
        //                         liked: p.data.liked,
        //                         deleted: p.data.deleted,
        //                         reported: p.data.reported,  
        //                         controlPost: false,
        //                         dateJoin: p.data.dateJoin
        //                     }

        //                 const postArray: Array<any> = this.state.post;

        //                 this.state.blobPostMedia.forEach(blob => URL.revokeObjectURL(blob.blob));
        //                 this.textPost.current!.value = "";

        //                 postArray.unshift(sortPostData);

        //                 this.setState(() => ({ postSuccess: true, postToggle: false, blobPostMedia: [] }));

        //                 setTimeout(() => {
        //                     this.setState(() => ({ post: postArray, postSuccess: false }));
        //                 }, 3000);

        //                 document.body.style.overflow = "auto";
                        
                
        //             } else if(p.status && p.result === "database error")
        //             {
        //                 this.setState(() => ({ serverErrorPost: true }));

        //             } else if(p.status && p.result === "oversize")
        //             {
        //                 this.setState(() => ({ overSizeMedia: true }));
        //             }
        //         }
        //     }
        // }

        like(postId: string, index: number): void 
        {
            const postLike = async () =>
            {
                this.checkCookie();

                const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/like`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: user, postId: postId })
                });

                if(promise.ok)
                {
                    const p: { status: string, likes: number, liked: boolean } = await promise.json();

                    if(p.status === "success")
                    {
                        const statePost: Array<any> = this.state.post;
                        statePost[index].liked = p.liked;
                        statePost[index].like = p.likes.toString();

                        this.setState(() => ({ post: statePost }));
                    }
                }
            }

            postLike();
        }

        async deletedPost(postId: string, postIndex: number): Promise<void>
        {
            this.checkCookie();
            const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/delete/post`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, postId: postId })

            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    if(result.result === "user post deleted")
                    {
                        const currentPost: any = this.state.post;
                        currentPost[postIndex].deleted = true;

                        this.setState(() => ({ post: currentPost, deletePostConfirm: undefined, closePostControl: undefined }));

                    } else if("post deleted")
                    {
                        const currentPost: any = this.state.post;
                        currentPost.splice(postIndex, 1);

                        console.log(currentPost);
                        this.setState(() => ({ post: currentPost, deletePostConfirm: undefined, closePostControl: undefined }));
                    }
                }
            }
        }

        async reportedPost(postId: string, postIndex: number): Promise<void>
        {
            this.checkCookie();
            const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/report/post`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, postId: postId })

            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    const currentPost: any = this.state.post;
                    currentPost[postIndex].reported = true;

                    this.setState(() => ({ post: currentPost, reportPostConfrim: undefined, reportNotice: true }));

                    setTimeout((): void => 
                    {
                        this.setState(() => ({ reportNotice: false }))
                    }, 2500)
                }
            }
        }

        async deletedComment(commentId: string, commentIndex: number, postIndex: number, postId: string): Promise<void>
        {
            this.checkCookie();
            const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/delete/comment`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, commentId: commentId, postId: postId })

            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    if(result.result === "user comment deleted")
                    {
                        const currentPost: any = this.state.post;
                        currentPost[postIndex].comments[commentIndex].deleted = true;
                        currentPost[postIndex].comments[commentIndex].control = false;

                        this.setState(() => ({ post: currentPost, deleteConConfirm: undefined, closeComment: false }));

                    } else if("comment deleted")
                    {
                        const currentPost: any = this.state.post;
                        currentPost[postIndex].comments.splice(commentIndex, 1);
                        currentPost[postIndex].commentNum = (Number(currentPost[postIndex].commentNum) - 1).toString();

                        this.setState(() => ({ post: currentPost, deleteConConfirm: undefined, closeComment: false }));
                    }
                }
            }
        }

        async reportedComment(commentId: string, commentIndex: number, postIndex: number): Promise<void> 
        {
            this.checkCookie();
            const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/report/comment`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, commentId: commentId })

            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    const currentPost: any = this.state.post;
                    currentPost[postIndex].comments[commentIndex].reported = true;

                    this.setState(() => ({ post: currentPost, reportConConfirm: undefined, reportNotice: true }));

                    setTimeout((): void => 
                    {
                        this.setState(() => ({ reportNotice: false }))
                    }, 2500)
                }
            }
        }

        comment(index: number): void 
        {
            const post = this.state.post;
            post[index].commentContainer = true

            this.setState(() => ({ post: post }));
        }

        commentSection(postId: string, index: number): void 
        {
            this.checkCookie();

            const comment: Array<any> = this.state.post;
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
            
            comment[index].commentSection = true;
            comment[index].loadComments = true;

            this.setState(() => ({ post: comment }));

            fetch(`${process.env.REACT_APP_API_URL}/comment?u=${key}&p=${postId}&comment=${comment[index].comments.length}`)
            .then(response => response.json())
            .then(result => 
            {
                if(result.status === "success")
                {
                    const commentState: Array<any> = this.state.post;
                    const data: { status: string, comments: Array<any> } = result;
                    let filterNewComments: Array<any>;

                    if(data.comments.length !== 0)
                    {
                        if(commentState[index].comments.length !== 0)
                        {
                            const currentComments: Array<any> = commentState[index].comments.map((e: any): any => e.commentId );
                            const filterComments: Array<any>  = data.comments.filter((e: any): any => !currentComments.includes(e.commentId));

                            filterNewComments = commentState[index].comments.concat(filterComments);
                            commentState[index].comments = filterNewComments;
                            
                        } else 
                        {
                            commentState[index].comments = data.comments;
                        }

                    } else 
                    {
                        commentState[index].noMoreComments = true;
                    }

                    commentState[index].loadComments = false;
                    this.setState(() => ({ post: commentState }));
                }
            });
        }

        commentOption(postIndex: number, commentIndex: number): void 
        {
            const currentPost: any = this.state.post;
            currentPost[postIndex].comments[commentIndex].control = true;

            this.setState(() => ({ post: currentPost, closeComment: { postIndex: postIndex, commentIndex: commentIndex } }));
        }

        commentTextArea(textArea: React.RefObject<HTMLDivElement>): void 
        {
            textArea.current!.style.height = "";
            const limit: number = Math.min(150, Number(textArea.current!.scrollHeight) - 20);
            textArea.current!.style.height = `${limit}px`;
        }

        async postComment(postId: string, postUserId: string, postContent: React.RefObject<HTMLTextAreaElement>, fileInput: React.RefObject<HTMLInputElement>, i: number): Promise<void> 
        {
            this.checkCookie();

            const user: string = decodeURIComponent(this.props.cookie.sconnecti.toString());
            const form: any       = new FormData();
            const content: string = postContent.current!.value.trim(); 
            const file: any       = fileInput.current!.files;
            const time: string = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}/${new Date().getHours()}:${new Date().getMinutes()}`;
            

            const fetchPost = async (formData: any) =>
            {
                form.append("postId", postId);
                form.append("postUserId", postUserId)
                form.append("user", user);
                form.append("time", time);

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/comment`, {
                    method: "POST",
                    // headers: 
                    // {
                    //     "Content-Type": "application/x-www-form-urlencoded"
                    // },
                    body: formData
                });

                if(promise.ok)
                {
                    const p: { status: boolean, result: string, comment: any, totalComments: string } = await promise.json();

                    if(p.status && p.result === "ok")
                    {
                        const postState: Array<any> = this.state.post;
   
                        postState[i].comments.unshift(p.comment);

                        URL.revokeObjectURL(postState[i].blobMedia.blob);
                        postState[i].blobMedia.blob = "";
                        postState[i].blobMedia.type = "";
                        postState[i].commentNum = p.totalComments;
                        this.setState(() => ({ post: postState }));

                        fileInput.current!.value   = "";
                        postContent.current!.value = "";

                    } else if(p.status && p.result === "database error")
                    {
                        this.setState(() => ({ commentError: true, postUploadLoader: false }));

                        setTimeout(() => {
                            this.setState(() => ({ commentError: false}));
                        }, 2000);

                    } else if(p.status && p.result === "oversize")
                    {
                        this.setState(() => ({ commentOverSize: true, postUploadLoader: false }));

                        setTimeout(() => {
                            this.setState(() => ({ commentOverSize: false}));
                        }, 2000);
                         
                    } else if(p.status && p.result === "invalid") {
                        this.setState(() => ({ commentWrongFormat: true, postUploadLoader: false }));

                        setTimeout(() => {
                            this.setState(() => ({ commentWrongFormat: false}));
                        }, 2000);
                    }

                    this.setState(() => ({ postUploadLoader: false }));
                    
                }
            };
            
            if(file.length !== 0 || content !== "")
            {
                if(file.length !== 0 && content !== "")
                {
                    form.append("content", content);
                    form.append("file", file[0]);

                    fetchPost(form);

                } else if(file.length === 0 && content !== "")
                {
                    form.append("content", content);
                    fetchPost(form);

                } else if(file.length !== 0 && content === "")
                {
                    form.append("file", file[0]);
                    fetchPost(form);
                }

            }

        }

        commentBlob(fileRef: React.RefObject<HTMLInputElement>, index: number): void 
        {
            const file : File      = fileRef.current.files[0];
            const fileType: string = fileRef.current.files[0].type.split("/")[0]; 
            const fileSize: number = fileRef.current.files[0].size; 

            // fileRef.current.value = "";

            if(fileType === "image" || fileType === "video")
            {
                if(fileSize < 50000000)
                {
                    const blobObject: string = URL.createObjectURL(file);
                    let statePost: Array<any> = this.state.post; 
                    statePost[index].blobMedia.blob = blobObject;
                    statePost[index].blobMedia.type = fileType;

                    this.setState(() => ({ post: statePost }));

                } else 
                {
                    fileRef.current.value = "";
                    let statePost: Array<any> = this.state.post; 

                    URL.revokeObjectURL(statePost[index].blobMedia.blob);

                    statePost[index].blobMedia.blob = "";
                    statePost[index].blobMedia.type = "";

                    this.setState(() => ({ commentOverSize: true, post: statePost }));
                    
                    setTimeout(() => {
                        this.setState(() => ({ commentOverSize: false }));
                    }, 2000);

                }
            }
        }

        cancelBlobComment(blob: string, index: number, fileRef: React.RefObject<HTMLInputElement>): void
        {
            fileRef.current!.value = "";

            const postState: Array<any> = this.state.post;
            URL.revokeObjectURL(postState[index].blobMedia.blob);
            postState[index].blobMedia.blob = ""; 
            postState[index].blobMedia.type = ""; 

            this.setState(() => ({ post: postState }));
        }

        viewImgContainer(media: Array<any>, index: number): void
        {

            this.setState((v) => 
            ({
                viewImageContainer: (v.viewImageContainer) ? false : true,
                viewIndexImage    : index,
                viewImageArray    : media,
                viewImgLeftBtn    : ((index !== 0) && media.length !== 0 ) ? true : false,
                viewImgRightBtn   : (index !== media.length - 1 && media.length !== 0) ? true : false
            }));

            document.body.style.overflow = "hidden";
        }

        viewImgPreBtn(): void 
        {

            this.setState((s) => 
            ({
                viewImgLeftBtn: (s.viewImageArray.length !== 0 && (s.viewIndexImage - 1) !== 0) ? true : false,
                viewImgRightBtn: (s.viewImageArray.length !== 0) ? true : false,
                viewIndexImage: (s.viewIndexImage !== 0 && s.viewImageArray.length !== 0) ? s.viewIndexImage - 1 : s.viewIndexImage
            }));

        }

        viewImgNextBtn(): void 
        {

            this.setState((s) => 
            ({
                viewImgLeftBtn: (s.viewImageArray.length !== 0) ? true : false,
                viewImgRightBtn: ((s.viewImageArray.length !== 0) && (s.viewIndexImage + 1) !== (s.viewImageArray.length -1)) ? true : false,
                viewIndexImage: (s.viewIndexImage !== (s.viewImageArray.length - 1) && s.viewImageArray.length !== 0) ? s.viewIndexImage + 1 : s.viewIndexImage
            }));

        }

        viewImgCancelBtn(): void 
        {
            this.setState(() => 
            ({
                viewImageContainer: false,
                viewIndexImage: 0,
                viewImageArray: [],
                viewImgLeftBtn: false,
                viewImgRightBtn: false
            }));

            document.body.style.overflow = "auto";
        }

        // logOut(): void 
        // {
        //     this.props.removeCookie("sconnecti", { path: "/" });
        //     this.props.Navigate("/login");
        //     this.socketClient.disconnect();
        // }

        hiddenToggle(e: any, path: string): void 
        {
            if(e.button !== 2)
            {
                this.currentPath = path;
                // this.homePath = false;
                this.setState(() => ({ homePath: false }));
            }
        }

        viewUserIcon(userIcon: string)
        {
            console.log(userIcon);
        }

        viewUserBackground(userBackground: string)
        {
            console.log(userBackground);
        }
        
        render(): JSX.Element
        {
            return (
                this.state.userExist ?
                <div className="body-container" style={{ flexDirection: "column", flex: "auto", height: "92.4vh", overflowY: "auto" }} ref={this.userPostScroll}>

                    {this.state.postUploadLoader ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block">
                            <span>Uploading post...</span>
                            <div className="search-post-loader" style={{ width: "auto" }}>
                                <div></div>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.commentOverSize ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block" style={{ padding: "20px" }}>
                            <span>Please choose a file size less than 50 megebyte</span>
                            <span>For each of the image/video file</span>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.commentWrongFormat ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block" style={{ padding: "20px" }}>
                            <span>Please choose image/video only</span>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.commentError ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block" style={{ padding: "20px" }}>
                            <span>Network System Error/Server Error</span>
                            <span>Please try again or reconnect again</span>
                        </div>
                    </div>
                    :
                    <></>
                    }

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
                                        <div onPointerUp={() => this.unfriendedMethod(this.confirmationObject.fId)}>Yes</div>
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
                                        <div onClick={() => this.blockedMethod(this.confirmationObject.fId)}>Yes</div>
                                        <div onPointerUp={this.closeConfirmation}>No</div>
                                    </div>
                                </div>
                            </div>
                        :
                        null
                    :
                    null
                    }

                    {this.state.reportNotice ?
                    <div className="report-container">
                        <span>Thank you for your report</span>
                        <span>We will handle the rest</span>
                    </div>
                    :
                    null
                    }

                    {this.state.deletePostConfirm ?
                    <div className="delete-post-confrim-block">
                        <div className="delete-post-block">
                            <div>
                                <span>
                                    {this.state.deletePostConfirm.userId.toString() === this.props.myId?.toString() ?
                                    "Delete this post?"
                                    :
                                    "Hide this post?"
                                    }
                                </span>
                            </div>
                            <div>
                                <div onClick={() => this.deletedPost(this.state.deletePostConfirm.postId, this.state.deletePostConfirm.postIndex)}>
                                    {this.state.deletePostConfirm.userId.toString() === this.props.myId?.toString() ?
                                    "Delete"
                                    :
                                    "Hide"
                                    }
                                </div>
                                <div onClick={() => this.setState(() => ({ deletePostConfirm: undefined }))}>Cancel</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.reportPostConfrim ?
                    <div className="delete-post-confrim-block">
                        <div className="delete-post-block">
                            <div>
                                <span>Report this post?</span>
                            </div>
                            <div>
                                <div onClick={() => this.reportedPost(this.state.reportPostConfrim.postId, this.state.reportPostConfrim.postIndex)}>Report</div>
                                <div onClick={() => this.setState(() => ({ reportPostConfrim: undefined }))}>Cancel</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.deleteConConfirm ?
                    <div className="delete-post-confrim-block">
                        <div className="delete-post-block">
                            <div>
                                <span>
                                    {this.state.deleteConConfirm.userId.toString() === this.props.myId?.toString() ?
                                    "Delete this comment?"
                                    :
                                    "Hide this comment?"
                                    }
                                </span>
                            </div>
                            <div>
                                <div onClick={() => this.deletedComment(this.state.deleteConConfirm.commentId, this.state.deleteConConfirm.commentIndex, this.state.deleteConConfirm.postIndex, this.state.deleteConConfirm.postId)}>
                                    {this.state.deleteConConfirm.userId.toString() === this.props.myId?.toString() ?
                                    "Delete"
                                    :
                                    "Hide"
                                    }
                                </div>
                                <div onClick={() => this.setState(() => ({ deleteConConfirm: undefined }))}>Cancel</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.reportConConfirm ?
                    <div className="delete-post-confrim-block">
                        <div className="delete-post-block">
                            <div>
                                <span>Report this comment?</span>
                            </div>
                            <div>
                                <div onClick={() => this.reportedComment(this.state.reportConConfirm.commentId, this.state.reportConConfirm.commentIndex, this.state.reportConConfirm.postIndex)}>Report</div>
                                <div onClick={() => this.setState(() => ({ reportConConfirm: undefined }))}>Cancel</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.closePostControl !== undefined ?
                    <div className="notification-drop-block" onClick={() => 
                    {
                        const currentPost: any = this.state.post;
                        currentPost[this.state.closePostControl.index].controlPost = false;
                        
                        this.setState(() => ({ post: currentPost, closePostControl: undefined }));
                    }}></div>
                    :
                    null
                    }

                    {this.state.closeComment ? 
                    <div className="notification-drop-block" onClick={() => 
                    {
                        const currentPost: any = this.state.post;
                        currentPost[this.state.closeComment.postIndex].comments[this.state.closeComment.commentIndex].control = false;

                        this.setState(() => ({ post: currentPost, closeComment: undefined }));
                    }}></div>
                    :
                    null
                    }

                    <div className="user-setting-container" style={{ marginLeft: "auto", marginRight: "auto" }}>
                        <div className="user-setting-profile-container" onClick={() => this.viewImgContainer([this.state.userInfo.background], 0)}>
                            <img src={this.state.userInfo !== undefined ? `${process.env.REACT_APP_API_URL}/media/${this.state.userInfo.background}` : `${process.env.REACT_APP_API_URL}/media/${this.state.userBackground}` } />
                        </div>
                    </div>
                    <div className="user-setting-icon-username-container" style={{ marginLeft: "auto", marginRight: "auto"}}>
                        {this.state.me !== true ?
                            this.state.userInfo.friendExist === true ?
                            <div className="user-control-container">
                                {/* add friend btn */}
                                {this.state.userInfo.friendAction.f_status === "none" ?
                                <div className="add-friend-btn-user" onClick={() => this.addfriendMethod(this.currentUserId)}>
                                    <span>Add Friend</span>
                                </div>
                                :
                                <></>
                                }

                                {/* unfriend btn */}
                                {this.state.userInfo.friendAction.f_status === "friended" ?
                                <div className="add-friend-btn-user" onPointerUp={(e) => this.popsUpConfirmation(e, this.currentUserId, "unfriend", this.state.userInfo.name)}>
                                    <span>Unfriend</span>
                                </div>
                                :
                                <></>
                                }

                                {this.state.userInfo.friendAction.action === "requesting" && this.state.userInfo.friendAction.f_status === "pending" ?
                                <div className="add-friend-btn-user" style={{ fontSize: "14px", backgroundColor: "#3451C6" }} onPointerUp={() => this.cancelRequestMethod(this.currentUserId, "cancel")}>
                                    <span>Cancel Request</span>
                                </div>
                                :
                                <></>
                                }

                                {this.state.userInfo.friendAction.action === "accepting" ?
                                <div className="add-friend-btn-user" style={{ fontSize: "14px", backgroundColor: "#3451C6" }} onPointerUp={() => this.confirmRequestMethod(this.currentUserId)}>
                                    <span>Accept Request</span>
                                </div>
                                :
                                <></>
                                }

                                {/* block btn */}
                                {this.state.userInfo.friendAction.f_status !== "blocked" ?
                                <div className="block-btn-user" onClick={(e) => this.popsUpConfirmation(e, this.currentUserId, "friends", this.state.userInfo.name)}>
                                    <span>Block</span>
                                </div>
                                :
                                <></>
                                }

                                {/* unblock btn */}
                                {this.state.userInfo.friendAction.action === "blocking" ?
                                <div className="block-btn-user" onClick={() => this.unBlockedMethod(this.currentUserId)}>
                                    <span>Unblock</span>
                                </div>
                                :
                                <></>
                                }

                            </div>
                        :
                        <div className="user-control-container">
                            {/* add friend btn */}
                            <div className="add-friend-btn-user" onClick={() => this.addfriendMethod(this.currentUserId)}>
                                <span>Add Friend</span>
                            </div>

                            {/* block btn */}
                            <div className="block-btn-user" onClick={(e) => this.popsUpConfirmation(e, this.currentUserId, "friends", this.state.userInfo.name)}>
                                <span>Block</span>
                            </div>
                        </div>
                        :
                        null
                        }
                        <div className="user-setting-icon-container">
                            <svg viewBox="0 0 100 100" width="120" height="120" onClick={() => this.viewImgContainer([this.state.userInfo.profile], 0)}>
                                <title>{this.state.userInfo.name}</title>
                                <defs>
                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                    <clipPath id="circle-clip">
                                    <use xlinkHref="#circle"/>
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#circle-clip)">
                                    <image xlinkHref={this.state.userInfo !== undefined ? `${process.env.REACT_APP_API_URL}/media/${this.state.userInfo.profile}` : `${process.env.REACT_APP_API_URL}/media/${this.state.userIcon}` } width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                </g>
                            </svg>
                        </div>
                        <div className="user-setting-username-control-container" style={{ padding: "0 10px", width: "650px" }}>
                            {this.state.userInfo.name.length > 10  ?
                            <div className="user-setting-username-container">
                                <span>
                                    {this.state.userInfo.name !== undefined ? this.state.userInfo.name : ""}
                                </span>
                            </div>
                            :
                            <div className="user-setting-username-container">
                                <div style={{ display: "flex", justifyContent: "center", alignContent: "center", width: "110px" }}>
                                    {this.state.userInfo.name !== undefined ? this.state.userInfo.name : ""}
                                </div>
                            </div>
                            }
                        </div>
                        <div className="user-setting-username-control-container" style={{ fontSize: "12px", justifyContent: "right" }}>
                            <div className="user-setting-username-container">
                                <span style={{ fontSize: "14px" }}>
                                    {this.state.userInfo.dateJoin !== undefined ? `Joined in ${this.state.userInfo.dateJoin.split("/")[0]}` : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                        <div className="content-container">

                            {this.state.viewImageContainer ?
                            <div className="view-image-container">
                                <div className="close-view-container-btn" onPointerUp={this.viewImgCancelBtn}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="view-img-cancel" viewBox="0 0 16 16">
                                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                    </svg>
                                </div>
                                <div className="view-image-block">
                                    {(this.state.viewImgLeftBtn) ?
                                    <div className="view-container-left-arrow" onPointerUp={() => this.viewImgPreBtn()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="arrow-left-view" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z"/>
                                        </svg>
                                    </div>
                                    :
                                    null
                                    }
                                    
                                    {this.state.viewImageArray[this.state.viewIndexImage].split(".")[this.state.viewImageArray[this.state.viewIndexImage].split(".").length - 1] === "jpg" ||
                                     this.state.viewImageArray[this.state.viewIndexImage].split(".")[this.state.viewImageArray[this.state.viewIndexImage].split(".").length - 1] === "png" ||
                                     this.state.viewImageArray[this.state.viewIndexImage].split(".")[this.state.viewImageArray[this.state.viewIndexImage].split(".").length - 1] === "jpeg"||
                                     this.state.viewImageArray[this.state.viewIndexImage].split(".")[this.state.viewImageArray[this.state.viewIndexImage].split(".").length - 1] === "gif" ?
                                     <img src={`${process.env.REACT_APP_API_URL}/media/${this.state.viewImageArray[this.state.viewIndexImage]}`} alt={`${process.env.REACT_APP_API_URL}/media/${this.state.viewImageArray[this.state.viewIndexImage]}`}/>
                                     :
                                     <video src={`${process.env.REACT_APP_API_URL}/media/${this.state.viewImageArray[this.state.viewIndexImage]}`} controls></video>
                                    }

                                    {(this.state.viewImgRightBtn) ?
                                    <div className="view-container-right-arrow" onPointerUp={() => this.viewImgNextBtn()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="arrow-right-view" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8Zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5Z"/>
                                        </svg>
                                    </div>
                                    :
                                    null
                                    }
                                </div>
                            </div>
                            :
                            null
                            }

                            {this.state.userInfo.friendAction.f_status !== "blocked" ?
                            this.state.post.length === 0 && this.state.fisrtPostLoaded ?
                            <div style={{ padding: "20px 0" }}>
                                <div className="no-post-container" style={{ height: "300px" }}>
                                    <span>Don't have any post...</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="balloon" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 9.984C10.403 9.506 12 7.48 12 5a4 4 0 0 0-8 0c0 2.48 1.597 4.506 4 4.984ZM13 5c0 2.837-1.789 5.227-4.52 5.901l.244.487a.25.25 0 1 1-.448.224l-.008-.017c.008.11.02.202.037.29.054.27.161.488.419 1.003.288.578.235 1.15.076 1.629-.157.469-.422.867-.588 1.115l-.004.007a.25.25 0 1 1-.416-.278c.168-.252.4-.6.533-1.003.133-.396.163-.824-.049-1.246l-.013-.028c-.24-.48-.38-.758-.448-1.102a3.177 3.177 0 0 1-.052-.45l-.04.08a.25.25 0 1 1-.447-.224l.244-.487C4.789 10.227 3 7.837 3 5a5 5 0 0 1 10 0Zm-6.938-.495a2.003 2.003 0 0 1 1.443-1.443C7.773 2.994 8 2.776 8 2.5c0-.276-.226-.504-.498-.459a3.003 3.003 0 0 0-2.46 2.461c-.046.272.182.498.458.498s.494-.227.562-.495Z"/>
                                    </svg>
                                </div>
                            </div>
                            :
                            null
                            :
                            <></>
                            }

                            {this.state.userInfo.friendAction.f_status !== "blocked" ?
                            this.state.post.map((post, i, array) => (
                            !post.deleted ?
                            <div className="post-container" key={`post-${post.postId}-${i}`}>
                                <div className="post-block">
                                    <div className="post-header">
                                        <div className="user-block">
                                            <UserContainer.User name={post.name} dateJoin={post.dateJoin} profile={post.userIcon}/>
                                            <Link to={`/user/${post.userId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")} style={{ display: "flex" }}>
                                                <svg viewBox="0 0 100 100" width="50" height="50">
                                                    <title>{post.name}</title>
                                                    <defs>
                                                        <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                        <clipPath id="circle-clip">
                                                        <use xlinkHref="#circle"/>
                                                        </clipPath>
                                                    </defs>
                                                    <g clipPath="url(#circle-clip)">
                                                        <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${post.userIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                        <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                    </g>
                                                </svg>
                                            </Link>
                                        </div>
                                        <div className="post-header-title-container">
                                            <div className="post-header-title-user">
                                                <div>
                                                    <Link to={`/user/${post.userId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")} className="user-title-link">
                                                        {post.name}
                                                    </Link>
                                                    <UserContainer.User name={post.name} dateJoin={post.dateJoin} profile={post.userIcon} />
                                                </div>
                                            </div>
                                            <div className="post-header-title-time">
                                                <b title={TimeDate.Run(post.time).totalDate}>{TimeDate.Run(post.time).calculatedTime}</b>
                                            </div>
                                        </div>
                                        <div className="post-header-option-container">
                                            <div className="post-header-option-btn" onClick={() => this.postControlOption(i)}>
                                                <div className="header-option-btn">
                                                    <div className="dot"></div>
                                                    <div className="dot"></div>
                                                    <div className="dot"></div>
                                                </div>
                                            </div>
                                            {post.controlPost ?
                                            post.userId.toString() === this.props.myId?.toString() ?
                                            <div className="post-control-block-user">
                                                <div onClick={() => this.deletePost(post.postId, i, post.userId)}>Delete</div>
                                            </div>
                                            :
                                            <div className="post-control-block-user">
                                                <div onClick={() => this.deletePost(post.postId, i, post.userId)}>Hide</div>
                                                {/* {post.reported ? 
                                                <div>Reported</div>
                                                :
                                                <div onClick={() => this.reportPost(post.postId, i)}>Report</div>
                                                } */}
                                            </div>
                                            :
                                            null
                                            }
                                        </div>
                                    </div>
                                    {post.content !== "" ?
                                    <div className="post-content-container">
                                        {post.content}
                                    </div>
                                    :
                                    null
                                    }
                                    {post.media.length > 0 ?
                                    <div className="post-media-container">
                                        {post.media.map((media, index, array) => (
                                            ((index === 0 && array.length > 2) || (array.length <= 2)) ?
                                            <div className="post-media-block" key={`${post.postId}-${index}`}>
                                                {(media.split('.')[media.split(".").length - 1] === "png" || media.split('.')[media.split(".").length - 1] === "jpg" || media.split('.')[media.split(".").length - 1] === "jpeg" || media.split('.')[media.split(".").length - 1] === "gif" || media.split('.')[media.split(".").length - 1] === "tiff") ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${media}`} alt={`${process.env.REACT_APP_API_URL}/media/${media}`} onPointerUp={() => this.viewImgContainer(array, index)} />
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${media}`} controls ></video>
                                                }
                                            </div> 
                                            :
                                            (index > 0 && index <= 2 && array.length <= 3) ?
                                            <div className="post-media-block-p" key={`${post.postId}-${index}`}>
                                                {(media.split('.')[media.split(".").length - 1] === "png" || media.split('.')[media.split(".").length - 1] === "jpg" || media.split('.')[media.split(".").length - 1] === "jpeg" || media.split('.')[media.split(".").length - 1] === "gif" || media.split('.')[media.split(".").length - 1] === "tiff") ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${media}`} onPointerUp={() => this.viewImgContainer(array, index)} alt={`${process.env.REACT_APP_API_URL}/media/${media}`}/>
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${media}`} controls ></video>
                                                }
                                            </div>
                                            :
                                            (index > 0 && index <= 1 && array.length > 3) ?
                                            <div className="post-media-block-p" key={`${post.postId}-${index}`}>
                                                {(media.split('.')[media.split(".").length - 1] === "png" ||media.split('.')[media.split(".").length - 1] === "jpg" || media.split('.')[media.split(".").length - 1] === "jpeg" || media.split('.')[media.split(".").length - 1] === "gif" || media.split('.')[media.split(".").length - 1] === "tiff") ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${media}`} onPointerUp={() => this.viewImgContainer(array, index)} alt={`${process.env.REACT_APP_API_URL}/media/${media}`}/>
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${media}`} controls ></video>
                                                }
                                            </div>
                                            :
                                            (index > 0 && index <= 2 && array.length > 3) ?
                                            <div className="post-media-block-p" key={`${post.postId}-${index}`} onPointerUp={() => this.viewImgContainer(array, index)}>
                                                {(media.split('.')[media.split(".").length - 1] === "png" || media.split('.')[media.split(".").length - 1] === "jpg" || media.split('.')[media.split(".").length - 1] === "jpeg" || media.split('.')[media.split(".").length - 1] === "gif" || media.split('.')[media.split(".").length - 1] === "tiff") ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${media}`} alt={`${process.env.REACT_APP_API_URL}/media/${media}`}/>
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${media}`} controls ></video>
                                                }
                                                <div className="post-media-block-additional">
                                                    <span>+{array.length - (index + 1)}</span>
                                                </div>
                                            </div>
                                            :
                                            null

                                        ))}
                                    </div>
                                    :
                                    null
                                    }
                                    <div className="post-content-btn">
                                        <div className={post.liked ? "like-btn-container active" : "like-btn-container"} ref={post.likeBtn} onPointerUp={() => this.like(post.postId, i)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="thumbs" viewBox="0 0 16 16">
                                                <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
                                            </svg>
                                            {post.like === "0" ?
                                            null
                                            :
                                            <span>
                                                {
                                                    (post.like.length > 3) ? 
                                                    (post.like.length > 4) ?
                                                    (post.like.length > 5) ?
                                                    (post.like.length > 6) ?
                                                    `${post.commentNum[0]}m likes`
                                                    :
                                                    `${post.like[0]}${post.like[1]}${post.like[2]}k likes`
                                                    :
                                                    `${post.like[0]}${post.like[1]}k likes`
                                                    :
                                                    `${post.like[0]}.${post.like[1]}k likes`
                                                    :
                                                    `${post.like} likes`
                                                }
                                            </span>
                                            }
                                        </div>
                                        <div className="comment-btn-container" ref={post.commentBtn} onPointerUp={() => this.comment(i)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="comment" viewBox="0 0 16 16">
                                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                            </svg>
                                            {post.commentNum === "0" ?
                                            <span>Comments</span>
                                            :
                                            <span>
                                                {
                                                    (post.commentNum.length > 3) ? 
                                                    (post.commentNum.length > 4) ?
                                                    (post.commentNum.length > 5) ?
                                                    (post.commentNum.length > 6) ?
                                                    `${post.commentNum[0]}m Comments`
                                                    :
                                                    `${post.commentNum[0]}${post.commentNum[1]}${post.commentNum[2]}k Comments`
                                                    :
                                                    `${post.commentNum[0]}${post.commentNum[1]}k Comments`
                                                    :
                                                    `${post.commentNum[0]}.${post.commentNum[1]}k Comments`
                                                    :
                                                    `${post.commentNum} Comments`
                                                }
                                            </span>
                                            }
                                        </div>
                                    </div>
                                    
                                    {post.commentContainer ?
                                    <div className="comment-input-container">
                                        <div className="comment-input-block">
                                            <div className="comment-user-icon-input">
                                                <svg viewBox="0 0 100 100" width="40" height="40">
                                                    <title>{this.state.name}</title>
                                                    <defs>
                                                        <circle id="circle" cx="40" cy="40" r="49" vectorEffect="non-scaling-stroke"/>
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
                                            <div className="input-content-container">
                                                <textarea onInput={() => this.commentTextArea(post.commentTextArea)} ref={post.commentTextArea} placeholder="Write some comment..."></textarea>

                                                {post.blobMedia.blob !== "" && post.blobMedia.type !== "" ?
                                                <div className="comment-input-image">
                                                    <div onPointerUp={() => this.cancelBlobComment(post.blobMedia.blob, i, post.commentFile)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="comment-cancel" viewBox="0 0 16 16">
                                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                                        </svg>
                                                    </div>
                                                    {post.blobMedia.type === "image" ?
                                                    // <img src={post.blobMedia.blob} onPointerUp={() => this.viewImgContainer([post.blobMedia.blob], 0)} alt={post.blobMedia.blob}/>
                                                    <img src={post.blobMedia.blob} />
                                                    :
                                                    <video src={post.blobMedia.blob} controls></video>
                                                    }
                                                </div>
                                                :
                                                null
                                                }

                                                <div className="input-content-option-container">
                                                    <div onPointerUp={() => this.postComment(post.postId, post.userId, post.commentTextArea, post.commentFile, i)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="comment-send" viewBox="0 0 16 16">
                                                            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`commentMedia${i}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="comment-image" viewBox="0 0 16 16">
                                                                <path d="M6.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                                <path d="M14 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5V14zM4 1a1 1 0 0 0-1 1v10l2.224-2.224a.5.5 0 0 1 .61-.075L8 11l2.157-3.02a.5.5 0 0 1 .76-.063L13 10V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4z"/>
                                                            </svg>
                                                        </label>
                                                        <input type="file" hidden={true} id={`commentMedia${i}`} ref={post.commentFile} accept="image/*, video/*" onChange={() => this.commentBlob(post.commentFile ,i)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    null
                                    }
                                    

                                    {(post.comments.length >= 1) ? 
                                    
                                    <div className="comment-section-container">
                                        
                                        {post.comments.map((comments, commentsIndex, commentsArray) => (
                                        comments.deleted === false ?
                                        <div className="comment-block" key={`c-${comments.commentId}-${commentsIndex}`}>
                                            <div className="comment-user-icon">
                                                <UserContainer.User name={comments.name} dateJoin={comments.dateJoin} profile={comments.commentUserIcon} />
                                                <Link to={`/user/${comments.commentUserId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")}>
                                                    <svg viewBox="0 0 100 100" width="40" height="40">
                                                        <title>{comments.name}</title>
                                                        <defs>
                                                            <circle id="circle" cx="40" cy="40" r="49" vectorEffect="non-scaling-stroke"/>
                                                            <clipPath id="circle-clip">
                                                                <use xlinkHref="#circle"/>
                                                            </clipPath>
                                                        </defs>
                                                        <g clipPath="url(#circle-clip)">
                                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${comments.commentUserIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                        </g>
                                                    </svg>
                                                </Link>
                                            </div>
                                            <div className="comment-box">
                                                <div className="comment-user">
                                                    <span>
                                                        <Link to={`/user/${comments.commentUserId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")} className="user-title-link">
                                                            {comments.name}
                                                        </Link>
                                                        <UserContainer.User name={comments.name} dateJoin={comments.dateJoin} profile={comments.commentUserIcon}/>
                                                    </span>
                                                </div>
                                                {comments.content !== "" ?
                                                <div className="comment-text-content">
                                                    {comments.content}
                                                </div>
                                                :
                                                null
                                                }
                                                {(comments.media[0] !== "none") ?
                                                <div className="comment-user-media-block">
                                                    {comments.media.map((m, i, a) => (
                                                        (m.split(".")[m.split(".").length - 1] === "tiff" || m.split(".")[m.split(".").length - 1] === "png" || m.split(".")[m.split(".").length - 1] === "jpg" || m.split(".")[m.split(".").length - 1] === "jpeg" || m.split(".")[m.split(".").length - 1] === "gif") ?
                                                        <img src={`${process.env.REACT_APP_API_URL}/media/${m}`} key={`${comments.id}-${i}`} onPointerUp={() => this.viewImgContainer(a, i)} alt={`${process.env.REACT_APP_API_URL}/media/${m}`}/>
                                                        :
                                                        <video src={`${process.env.REACT_APP_API_URL}/media/${m}`} controls key={`${comments.id}-${i}`}></video>
                                                    ))}
                                                </div>
                                                :
                                                null
                                                }
                                                <div className="comment-text-content-time">
                                                    <span title={TimeDate.Run(comments.time).totalDate}>{TimeDate.Run(comments.time).calculatedTime}</span>
                                                </div>
                                            </div>
                                            <div className="comment-option">
                                                <div className="comment-option-btn" onClick={() => this.commentOption(i, commentsIndex)}>
                                                    <div className="comment-option-dot-line">
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                    </div>
                                                </div>
                                                {comments.control ?
                                                comments.commentUserId.toString() === this.props.myId?.toString() ?
                                                <div className="comment-control-block-user">
                                                    {comments.deleted ?
                                                    <div>Deleted</div>
                                                    :
                                                    <div onClick={() => this.deleteComment(comments.commentId, commentsIndex, i, post.postId, comments.commentUserId)}>Delete</div>
                                                    }
                                                </div>
                                                :
                                                <div className="comment-control-block-user">
                                                    {comments.deleted ?
                                                    <div>Hidden</div>
                                                    :
                                                    <div onClick={() => this.deleteComment(comments.commentId, commentsIndex, i, post.postId, comments.commentUserId)}>Hide</div>
                                                    }
                                
                                                    {/* {comments.reported ?
                                                    <div>Reported</div>
                                                    :
                                                    <div onClick={() => this.reportComment(comments.commentId, commentsIndex, i)}>Report</div>
                                                    } */}
                                                </div>
                                                :
                                                null
                                                }
                                            </div>
                                        </div>
                                        :
                                        <div className="comment-block" key={`c-${comments.commentId}-${commentsIndex}`}>
                                            <div className="comment-user-icon">
                                                <UserContainer.User name={comments.name} dateJoin={comments.dateJoin} profile={comments.commentUserIcon}/>
                                                <Link to={`/user/${comments.commentUserId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")}>
                                                    <svg viewBox="0 0 100 100" width="40" height="40">
                                                        <title>{comments.name}</title>
                                                        <defs>
                                                            <circle id="circle" cx="40" cy="40" r="49" vectorEffect="non-scaling-stroke"/>
                                                            <clipPath id="circle-clip">
                                                                <use xlinkHref="#circle"/>
                                                            </clipPath>
                                                        </defs>
                                                        <g clipPath="url(#circle-clip)">
                                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${comments.commentUserIcon}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                        </g>
                                                    </svg>
                                                </Link>
                                            </div>
                                            <div className="comment-box">
                                                <div className="comment-user">
                                                    <span>
                                                        <Link to={`/user/${comments.commentUserId}`} onPointerUp={(e: any): void => this.hiddenToggle(e, "/user")} className="user-title-link">
                                                            {comments.name}
                                                        </Link>
                                                        <UserContainer.User name={comments.name} dateJoin={comments.dateJoin} profile={comments.commentUserIcon}/>
                                                    </span>
                                                </div>
                                                <div className="comment-text-content">
                                                    <span className="deleted-comment-block">You hidden this comment</span>
                                                </div>
                                                {/* {(comments.media[0] !== "none") ?
                                                <div className="comment-user-media-block">
                                                    {comments.media.map((m, i, a) => (
                                                        (m.split(".")[m.split(".").length - 1] === "tiff" || m.split(".")[m.split(".").length - 1] === "png" || m.split(".")[m.split(".").length - 1] === "jpg" || m.split(".")[m.split(".").length - 1] === "jpeg" || m.split(".")[m.split(".").length - 1] === "gif") ?
                                                        <img src={`${process.env.REACT_APP_API_URL}/media/${m}`} key={`${comments.id}-${i}`} onPointerUp={() => this.viewImgContainer(a, i)} alt={`${process.env.REACT_APP_API_URL}/media/${m}`}/>
                                                        :
                                                        <video src={`${process.env.REACT_APP_API_URL}/media/${m}`} controls key={`${comments.id}-${i}`}></video>
                                                    ))}
                                                </div>
                                                :
                                                null
                                                } */}
                                                <div className="comment-text-content-time">
                                                    <span title={TimeDate.Run(comments.time).totalDate}>{TimeDate.Run(comments.time).calculatedTime}</span>
                                                </div>
                                            </div>
                                            <div className="comment-option">
                                                <div className="comment-option-btn" onClick={() => this.commentOption(i, commentsIndex)}>
                                                    <div className="comment-option-dot-line">
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                    </div>
                                                </div>
                                                {comments.control ?
                                                <div className="comment-control-block-user">
                                                    {comments.deleted ?
                                                    <div>Hidden</div>
                                                    :
                                                    <div>Hide</div>
                                                    }
                                              
                                                    {/* {comments.reported ?
                                                    <div>Reported</div>
                                                    :
                                                    <div onClick={() => this.reportComment(comments.commentId, commentsIndex, i)}>Report</div>
                                                    } */}
                                                </div>
                                                :
                                                null
                                                }
                                            </div>
                                        </div>
                                        ))}
                                        
                                    </div>
                                    
                                    :
                                    null
                                    }                                    

                                    {post.commentContainer ?
                                        (post.loadComments) ?
                                        <div className="comment-loading-container">
                                            <div></div>
                                        </div>
                                        :
                                        (post.noMoreComments) ? 
                                        <div className="view-comments-block">
                                            <span>No more comments</span>
                                        </div>
                                        :
                                        <div className="view-comments-block">
                                            <span onPointerUp={() => this.commentSection(post.postId, i)}>View more comments</span>
                                        </div>
                                    :
                                    null
                                    }
                                </div>
                            </div>
                            :
                            <div style={{ padding: "10px 0 0 0" }} key={`post-${post.postId}-${i}`}>
                                <div className="not-found-post-container" style={{ height: "300px" }} key={`post-${post.postId}-${i}`}>
                                    <span>You have hidden this post</span>
                                </div>
                            </div>
                            ))
                            :
                            <></>
                            }

                            {this.state.postLoader ?
                            <div className="post-loader-container">
                                <div></div>
                            </div>
                            :
                            null
                            }

                            {this.state.userInfo.friendAction.f_status !== "blocked" ? 
                            this.state.noMorePost === true && this.state.post.length !== 0 ? 
                            <div className="no-more-post-container">
                                <span>No more posts...</span>
                            </div>
                            :
                            null
                            :
                            <></>
                            }
        
                            
                                
                        </div>
                </div>
                :
                this.state.firstLoaded ?
                <div className="user-setting-main-container">
                    <div className="not-found-post-container">
                        <span>404 user not found...</span>
                    </div>
                </div>
                :
                <></>
            );
        }
    }

    export function Container(props: any): JSX.Element
    {
        const { userId } = useParams();
        let [checkUserId, setCheckUserId]: any = useState();
        let LOAD: boolean = false;
        const location: Location = useLocation();
        const [cookie, setCookies, removeCookie] = useCookies();
        const navigate: NavigateFunction = useNavigate();

        useEffect((): void =>
        {
            if(!LOAD)
            {
                LOAD = true;

                if(userId !== "" && userId !== undefined)
                {
                    setCheckUserId(checkUserId = userId.toString());

                } else 
                {
                    setCheckUserId(checkUserId = undefined);
                }
            }

        }, []);

        return (
            checkUserId !== undefined && checkUserId !== "" ?
            <Body Navigate={navigate} cookie={cookie} setCookie={undefined} removeCookie={removeCookie} Location={location} userId={userId} myId={props.userId}/>
            :
            LOAD ?
            <div className="user-setting-main-container">
                <div className="not-found-post-container">
                    <span>404 user not found...</span>
                </div>
            </div>
            :
            <></>
        )
    }
}