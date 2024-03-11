import React, { forwardRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/dark-notification.css";
import { TimeDate } from "./method/time-config-function.tsx";

export namespace Notification
{
    export const Notice = forwardRef((props: any, refs: any): JSX.Element => 
    {
        let LOAD: boolean = false;

        function checkCookie(): void 
        {
            if(props.cookie.sconnecti === undefined && props.cookie.sconnecti === "")
            {
                props.removeCookie("sconnecti", { path: "/" });
                props.Navigate("/login");
            }
        }

        useEffect((): void => 
        {
            if(!LOAD)
            {
                LOAD = true;
                console.log(props.userId);
                checkCookie();

                const fetchFriend = async ():Promise<void> =>
                {
                    const key: string = encodeURIComponent(props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL}/frequest?u=${key}`);

                    if(promise.ok)
                    {
                        const result: { success: boolean, result: string, data: Array<any> } = await promise.json();

                        if(result.success)
                        {

                            console.log(result.data);

                        } else 
                        {
                            console.log(result.result);
                        }
                    }

                }

                fetchFriend();
            
            }

        }, []);

        return (
            <div className="notice-container" ref={refs}>
                <div className="notice-header">
                    <span>Notification</span>
                </div>

                <Link to="/login" className="link-text">
                    <div className="notice-content-container">
                        <div className="notice-block-user-icon">
                            <svg viewBox="0 0 100 100" width="65" height="65">
                                <title>Cat</title>
                                <defs>
                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                    <clipPath id="circle-clip">
                                    <use xlinkHref="#circle"/>
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#circle-clip)">
                                    <image xlinkHref="https://uploads.dailydot.com/2018/10/olli-the-polite-cat.jpg?q=65&w=800&ar=2:1&fit=crop" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                </g>
                            </svg>
                        </div>
                        <div className="notice-block-content">
                            <div>
                                <span className="user-notice">asdasdsad</span> Like your comment Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum aliquid odio laborum consequatur! In deleniti earum soluta voluptate, corrupti cumque suscipit amet modi, qui magnam temporibus fugit adipisci. Voluptate, ipsa?
                            </div>
                        </div>
                    </div>
                </Link>
                
                {/* <div className="no-notice-container">
                    <span>No Notification</span>
                </div> */}
                
            </div>
        );
    })


    export const Message = forwardRef((props: any, refs: any): JSX.Element =>
    {
        let LOAD: boolean = false;
        let [messageList, setMessageList]: any = useState<any>();

        function checkCookie(): void 
        {
            if(props.cookie.sconnecti === undefined && props.cookie.sconnecti === "")
            {
                props.removeCookie("sconnecti", { path: "/" });
                props.Navigate("/login");
            }
        }

        useEffect((): void => 
        {
            if(!LOAD)
            {
                LOAD = true;
                
                checkCookie();
                
                const key: string = encodeURIComponent(props.cookie.sconnecti.toString());

                fetch(`${process.env.REACT_APP_API_URL}/messagelist?u=${key}`)
                .then(response => response.json())
                .then(result => 
                {
                    setMessageList(messageList = result);
                    // setTimeout(() => {
                    //     console.log(this.state.chatList)
                        
                    // }, 2000);
                });
            }
            
        }, []);

        return (
            <div className="notice-container" ref={refs}>
                <div className="notice-header">
                    <span>Messages</span>
                </div>

                {messageList !== undefined ?
                    messageList.length !== 0 ?
                    messageList.map((e, i, a) => 
                    (
                        <Link to={`/message`} className="link-text" key={`message-${e.um_roomId}`}>
                            <div className="message-content-container">
                                <div className="message-block-user-icon">
                                    {e.room_name === "none" ?
                                    <svg viewBox="0 0 100 100" width="65" height="65">
                                        <title>{e.room_name === "none" ? e.friendInfo[0].name : e.room_name}</title>
                                        <defs>
                                            <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                            <clipPath id="circle-clip">
                                            <use xlinkHref="#circle"/>
                                            </clipPath>
                                        </defs>
                                        <g clipPath="url(#circle-clip)">
                                            <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${e.friendInfo[0].profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                            <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                        </g>
                                    </svg>
                                    :
                                    <div className="message-notice-block">Group</div>
                                    }

                                    {e.unseen_msg > 0 ?
                                    <div className="message-notice-label">{e.unseen_msg > 99 ? "99" : e.unseen_msg}</div>
                                    :
                                    null
                                    }
                                </div>
                                <div className="message-block-content active">
                                    <div>{e.room_name === "none" ? e.friendInfo[0].name : e.room_name}</div>
                                    <div className={e.unseen_msg > 0 ?  "message-notice-content-unread" : "message-notice-content-read" }>
                                    {e.msg[0].message_type === "media" ? 
                                    e.msg[0].message_content === "User recalled message" ? e.msg[0].message_content :
                                    e.msg[0].message_content === "You hidden this message" ? e.msg[0].message_content :
                                    (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="media-chat-icon-notice" viewBox="0 0 16 16">
                                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                                    </svg>)
                                    : 
                                    null}
                                    {e.msg[0].message_type === "removed" ?
                                    "User have been removed"
                                    :
                                    null
                                    }   
                                    {e.msg[0].message_type === "disband" ?
                                    "Group disbanded"
                                    :
                                    null
                                    }
                                    {e.msg[0].message_type === "group created" ?
                                    "Group created" :
                                    null 
                                    }
                                    {e.msg[0].message_type === "member join" ?
                                    "User join the group"
                                    :
                                    null
                                    }
                                    {e.msg[0].message_type === "exit group" ?
                                    "User have leave the group"
                                    :
                                    null
                                    }
                                    {e.msg[0].message_type === "message" ?
                                    e.msg[0].message_content
                                    :
                                    null
                                    }
                                    {e.msg[0].message_type === "conversation created" ?
                                    "Conversation created"
                                    :
                                    null
                                    }
                                    </div>
                                    <div style={{fontSize: "10px"}} title={TimeDate.Run(e.msg[0].message_time).totalDate}>{TimeDate.Run(e.msg[0].message_time).calculatedTime}</div>
                                </div>
                            </div>
                        </Link>
                    ))
                    :
                    <div className="no-notice-message-block">No message...</div>
                :
                null
                }
                
                
                {/* <div className="no-message-container">
                    <span>No Message</span>
                </div> */}
                
            </div>
        );
    });

    export const Friend = forwardRef((props: any, refs: any): JSX.Element => 
    {
        let LOAD: boolean = false;
        let [friendRequest, setFriendRequest]: any = useState([]);

        function checkCookie(): void 
        {
            if(props.cookie.sconnecti === undefined && props.cookie.sconnecti === "")
            {
                props.removeCookie("sconnecti", { path: "/" });
                props.Navigate("/login");
            }
        }

        useEffect((): void => 
        {
            if(!LOAD)
            {
                LOAD = true;
                checkCookie();

                const fetchFriend = async ():Promise<void> =>
                {
                    const key: string = encodeURIComponent(props.cookie.sconnecti.toString());
                    const promise = await fetch(`${process.env.REACT_APP_API_URL}/frequest?u=${key}`);

                    if(promise.ok)
                    {
                        const result: { success: boolean, result: string, data: Array<any> } = await promise.json();

                        if(result.success)
                        {
                            setFriendRequest(friendRequest = result.data);

                            console.log(friendRequest);
                            


                        } else 
                        {
                            console.log(result.result);
                        }
                    }

                }

                fetchFriend();
            
            }

        }, []);

        return (
            <div className="notice-container" ref={refs}>
                <div className="notice-header">
                    <span>Friends Request</span>
                </div>

                {friendRequest.length !== 0 ?
                friendRequest.map((e, i , a) => (
                    <Link to={`/user/${e.userId}`} className="link-text" key={`friend-${e.userId}`}>
                    <div className="notice-content-container">
                        <div className="notice-block-user-icon">
                            <svg viewBox="0 0 100 100" width="65" height="65">
                                <title>{e.name}</title>
                                <defs>
                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                    <clipPath id="circle-clip">
                                    <use xlinkHref="#circle"/>
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#circle-clip)">
                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${e.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                </g>
                            </svg>
                        </div>
                        <div className="notice-block-content">
                            <div>
                                <span className="user-notice">{e.name}</span> sending friend request to you
                            </div>
                        </div>
                    </div>
                </Link>
                ))
                :
                <div className="no-notice-message-block">No have friend request...</div>
                }
                
                
                
                {/* <div className="no-notice-container">
                    <span>No Friend Requesting</span>
                </div> */}
                
            </div>
        );
    })
    
}