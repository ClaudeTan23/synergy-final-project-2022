import React, { createRef } from "react";
import { Link } from "react-router-dom";
import "../css/dark-message.css";
import { MessagePropsState } from "./props-state/message";
import { TimeDate } from "./method/time-config-function.tsx";

export namespace Message 
{
    export class Container extends React.Component<MessagePropsState.Props, MessagePropsState.State>
    {
        private textBox: React.RefObject<HTMLTextAreaElement>;
        private fileInput: React.RefObject<HTMLInputElement>;
        private GroupName: React.RefObject<HTMLInputElement>;
        private GroupSearch: React.RefObject<HTMLInputElement>;
        private FriendSearch: React.RefObject<HTMLInputElement>;
        private chatListTimer: ReturnType<typeof setTimeout>;
        private memberListTimer: ReturnType<typeof setTimeout>;
        private groupTimer: ReturnType<typeof setTimeout>;
        private friendTimer: ReturnType<typeof setTimeout>;
        private clientSocket: any;
        private LOADED: boolean = false;
        private chatScroll: React.RefObject<HTMLDivElement>;
        private totalMessage: number = 0;
        private searchMemberInput: React.RefObject<HTMLInputElement>;
        private memberNum: number = 0;

        constructor(props)
        {
            super(props);

            this.state = 
            {
                createNewChat        : false,
                chatList             : [],
                createFriend         : false,
                createGroup          : false,
                groupMembers         : false,
                groupMemberList      : [],
                groupSeletedMembers  : [],
                friendMembers        : false,
                friendMemberList     : [],
                friendSelectedMembers: [],
                membersLoader        : false,
                checkGroup           : false,
                checkFriend          : false,
                checkGroupMember     : false,
                chatIntro            : true,
                chatListLoader       : false,
                chatContainer        : undefined,
                fetchOldChatloader   : false,
                noMoreOldChat        : false,
                DeleteFriendMsgList  : false,
                DeleteGroupMsgList   : false,
                viewMembersContainer : false,
                cancelViewMembers    : false,
                MembersContainer     : undefined,
                BlobImageUploader    : undefined,
                BlobType             : undefined,
                imgString            : undefined,
                addMembersContainer  : false,
                addGroupMembers      : undefined,
                addMembersLoader     : false,
                removeConfirmation   : undefined,
                disbandConfirmation  : false,
                exitConfirmation     : false,
                messagePath          : false,
                recallWarning        : false,
                hideWarning          : undefined,
                uploadingMedia       : false,
                overSize             : false,
            }

            this.textBox           = createRef();
            this.GroupName         = createRef();
            this.GroupSearch       = createRef();
            this.FriendSearch      = createRef();
            this.chatScroll        = createRef();
            this.fileInput         = createRef();
            this.searchMemberInput = createRef();

            this.textBoxExpand         = this.textBoxExpand.bind(this);
            this.createChat            = this.createChat.bind(this);
            this.createGroupChat       = this.createGroupChat.bind(this);
            this.createFriendChat      = this.createFriendChat.bind(this);
            this.searchGroupMembers    = this.searchGroupMembers.bind(this);
            this.searchFriendMember    = this.searchFriendMember.bind(this);
            this.checkCookie           = this.checkCookie.bind(this);
            this.selectedGroupMember   = this.selectedGroupMember.bind(this);
            this.deleteSelectedGroup   = this.deleteSelectedGroup.bind(this);
            this.createGroup           = this.createGroup.bind(this);
            this.cancelCreateChatModel = this.cancelCreateChatModel.bind(this);
            this.webSocket             = this.webSocket.bind(this);
            this.selectedFriendMember  = this.selectedFriendMember.bind(this);
            this.createFriend          = this.createFriend.bind(this);
            this.fetchChatList         = this.fetchChatList.bind(this);
            this.chatContainer         = this.chatContainer.bind(this);
            this.userChatControl       = this.userChatControl.bind(this);
            this.deleteChat            = this.deleteChat.bind(this);
            this.unClickContainer      = this.unClickContainer.bind(this);
            this.deleteChatList        = this.deleteChatList.bind(this);
            this.deleteChatListMsg     = this.deleteChatListMsg.bind(this);
            this.viewMembers           = this.viewMembers.bind(this);
            this.cancelViewMembers     = this.cancelViewMembers.bind(this);
            this.removeMembers         = this.removeMembers.bind(this);
            this.buttonMessage         = this.buttonMessage.bind(this);
            this.blobFile              = this.blobFile.bind(this);
            this.cancelBlobFile        = this.cancelBlobFile.bind(this); 
            this.postMedia             = this.postMedia.bind(this);
            this.viewImgContainer      = this.viewImgContainer.bind(this);
            this.addMembers            = this.addMembers.bind(this);
            this.searchMembers         = this.searchMembers.bind(this);
            this.removeMembersConfirm  = this.removeMembersConfirm.bind(this);
            this.confirmRemoveMember   = this.confirmRemoveMember.bind(this);
            this.groupDisband          = this.groupDisband.bind(this);
            this.disbandConfirmation   = this.disbandConfirmation.bind(this);
            this.exitGroupConfirmation = this.exitGroupConfirmation.bind(this);
            this.exitGroup             = this.exitGroup.bind(this);
            this.hideMessage           = this.hideMessage.bind(this);
            this.hideMessageConfirm    = this.hideMessageConfirm.bind(this);
        }

        checkCookie(): void 
        {
            if(this.props.cookie.sconnecti === undefined && this.props.cookie.sconnecti === "")
            {
                this.props.removeCookie("sconnecti", { path: "/" });
                this.props.Navigate("/login");
            }

        }

        componentDidMount(): void 
        {
            if(!this.LOADED)
            {
                this.checkCookie();
                this.LOADED = true;

                this.fetchChatList();
                this.clientSocket = this.props.clientSocket;

                this.webSocket();

                document.title = "Message";

            }   
        }

        componentDidUpdate(prevProps: Readonly<MessagePropsState.Props>, prevState: Readonly<MessagePropsState.State>, snapshot?: any): void
        {
            if(this.props.Location.pathname === "/message")
            {
                if(this.state.messagePath !== true)
                {
                    this.setState(() => ({ messagePath: true }));
                    document.title = "Message";
                }
  
            } else if(prevProps.Location.pathname !== "/message" && this.props.Location.pathname === "/message")
            {
                if(this.state.messagePath !== true)
                {
                    this.setState(() => ({ messagePath: true }));
                    document.title = "Message";
                
                }

            } else if(this.props.Location.pathname !== "/message")
            {
                if(this.state.messagePath !== false)
                {
                    this.setState(() => ({ messagePath: false, chatContainer: undefined }));
                    
                }

            }
            
        }

        webSocket(): void 
        {

            this.clientSocket.on("new-group-chat", (data: any): void =>
            {
                this.clientSocket.emit("join-new-group", { userId: data.userId, roomId: data.roomId });
                this.fetchChatList();

            })

            this.clientSocket.on("new-friend-chat", (data: any): void =>
            {
                this.clientSocket.emit("join-new-friend-chat", { roomId: data.roomId });
                this.fetchChatList();
            });

            this.clientSocket.on("add-group-new-member", (data: any): void =>
            {
                if(this.state.chatContainer !== undefined)
                {
                    if(this.state.chatContainer.chat_id.toString() === data.roomId)
                    {
                        this.setState(() => ({ chatContainer: undefined }));
                    }
                }

                this.clientSocket.emit("join-group-room", data);
                this.fetchChatList();
            });

            this.clientSocket.on("online-status", (data: any): void =>
            {
                this.fetchChatList();

                const currentChatContainer: any = this.state.chatContainer;

                const onlineGroup: Array<string> = data.group.map(e => e.e.um_roomId);

                if(currentChatContainer !== undefined)
                {
                    if(onlineGroup.includes(currentChatContainer.chat_id.toString()))
                    {
                        // console.log(data);
                        // if(currentChatContainer.room_name === data.name)
                        // {
                            currentChatContainer.online_status = "on";
                        // }

                        this.setState(() => ({ chatContainer: currentChatContainer}));
                    }
                }

            });

            this.clientSocket.on("group-message", async (data: any, groupControl: any): Promise<void> =>
            {
                const nowChatContainer: any = this.state.chatContainer;

                if(nowChatContainer !== undefined)
                {
                    if(nowChatContainer.chat_id.toString() === data.m_room_id)
                    {
                        const roomId: string = data.m_room_id;
                        const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                        if(data.message_type === "removed" && data.me.toString() === this.props.userId?.toString())
                        {
                            nowChatContainer.userRoomStatus = "removed";

                            this.setState(() => ({ chatContainer: nowChatContainer }));

                        } else if(data.message_type === "disband")
                        {
                            nowChatContainer.userRoomStatus = "disband";

                            this.setState(() => ({ chatContainer: nowChatContainer }));

                        } else if(data.message_type === "exit group" && data.user_id.toString() === this.props.userId?.toString())
                        {
                            nowChatContainer.userRoomStatus = "exit group";

                            this.setState(() => ({ chatContainer: nowChatContainer }));
                        }

                        const promise = await fetch(`${process.env.REACT_APP_API_URL}/update/unseen`, 
                        {
                            method: "POST",
                            headers:
                            {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ user: user, roomId: roomId })
                        });

                        if(promise.ok)
                        {
                            const result = await promise.json();

                            if(result.success)
                            {
                                this.fetchChatList();
                                nowChatContainer.msg.push(data);

                                this.totalMessage++;

                                this.setState(() => ({ chatContainer: nowChatContainer }));

                                this.msgScrollDown();

                            }
                        }

                    } else 
                    {
                        this.fetchChatList();
                    }

                } else 
                {
                    this.fetchChatList();
                }

                if(groupControl !== undefined)
                {
                    if(groupControl.memberId.toString() === this.props.userId?.toString() && groupControl.type === "removed")
                    {
                        this.clientSocket.emit("leave-room", groupControl.roomId.toString());
                                        
                    } else if(groupControl.memberId.toString() === this.props.userId?.toString() && groupControl.type === "exitGroup")
                    {
                        this.clientSocket.emit("exit-room", groupControl.roomId.toString());
                    }
                }
        
            });

            this.clientSocket.on("recall-message", (data: any): void =>
            {
                const recallContainer: any | undefined = this.state.chatContainer;

                if(this.state.chatContainer !== undefined)
                {
                    if(recallContainer.chat_id.toString() === data.roomId.toString())
                    {
                        const sortRecallMessage: any = recallContainer.msg.map(e => 
                        {
                            if(e.message_id.toString() === data.messageId.toString())
                            {
                                e.deleted = true;
                                return e;

                            } else 
                            {
                                return e;
                            }

                        });

                        recallContainer.msg = sortRecallMessage;

                        this.setState(() => ({ chatContainer: recallContainer }));

                        this.fetchChatList();

                    } else 
                    {
                        this.fetchChatList();
                    }

                } else 
                {
                    this.fetchChatList();
                }

            });

            this.clientSocket.on("group-off", (data: Array<any>): void =>
            {
                const chatContainer: any | undefined = this.state.chatContainer;
                const chatList: any = this.state.chatList;

                if(chatList.length > 0)
                {

                    if(chatList.filter((e: any) => data.includes(e.chat_id)))
                    {
                        let targetRoom: any = chatList;

                        targetRoom.forEach((e: any): void =>
                        {
                            if(data.includes(e.um_roomId))
                            {
                                if(e.chat_type === "friend")
                                {
                                    e.friendInfo[0].online_status = "off";
                               
                                }
                            }
                        });

                        // console.log(targetRoom)

                        this.setState(() => ({ chatList: targetRoom }));
                    }
                }

                if(chatContainer !== undefined)
                {
                    if(chatContainer.chat_type === "friend")
                    {
                        chatContainer.online_status = "off";

                        this.setState(() => ({ chatContainer: chatContainer }));
                    }
                }

            });

        }

        deleteChatList(): void 
        {
            const nowContainer: any = this.state.chatContainer;

            if(nowContainer.chat_type === "friend")
            {
                this.setState(() => ({ DeleteFriendMsgList : true }));

            } else if(nowContainer.chat_type === "group")
            {
                this.setState(() => ({ DeleteGroupMsgList: true }));
            }
        }

        searchMembers(): void 
        {
            this.checkCookie();
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            if(this.memberListTimer !== undefined)
            {
                clearInterval(this.memberListTimer);
            }

            if(this.searchMemberInput.current?.value.trim() !== "" && this.searchMemberInput.current?.value.trim() !== undefined)
            {

                this.setState(() => ({ addMembersLoader: true }));

                this.memberListTimer = setTimeout((): void =>
                {
                    const queryFriend = this.searchMemberInput.current?.value.trim();
                    this.memberNum = 0;
                    const roomId: string = this.state.chatContainer.chat_id.toString();

                    fetch(`${process.env.REACT_APP_API_URL}/group/search/friend?u=${key}&friend=${queryFriend}&num=${this.memberNum}&roomId=${roomId}`)
                    .then(response => response.json())
                    .then(result => 
                    {
                        this.setState(() => ({ addMembersLoader: false, addGroupMembers: result.friends }));
                    });

                }, 1500);

            } else 
            {
                this.setState(() => ({ addMembersLoader: false }));
                this.addMembers();
            }
        }

        updateUnseenMsg(): void
        {

        }

        confirmRemoveMember(userId: string, index: number): void 
        {
            this.removeMembers(userId, index);

            
        }

        removeMembersConfirm(userId: string, name: string, index: number): void 
        {
            this.setState(() => ({ removeConfirmation: { userId: userId, name: name, i: index } }))
        }

        async removeMembers(userId: string, index: number): Promise<void>
        {
            this.checkCookie();
            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const groupId: string = this.state.chatContainer.chat_id.toString();

            const removeMaxChatId: string = this.state.chatContainer.msg[this.state.chatContainer.msg.length - 1].message_id.toString();

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/remove/group/member`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, memberId: userId, groupId: groupId, maxChatId: removeMaxChatId })

            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    const members: any = this.state.MembersContainer;
                    members.splice(index, 1);

                    this.setState(() => ({ MembersContainer: members, removeConfirmation: undefined }));
                }
            }
        }

        addMembers(): void
        {
            this.checkCookie();
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            this.setState(() => ({ addMembersLoader: true }));
            this.memberNum = 0;
            const roomId: string = this.state.chatContainer.chat_id.toString();

            fetch(`${process.env.REACT_APP_API_URL}/group/friend?u=${key}&num=${this.memberNum}&roomId=${roomId}`)
            .then(response => response.json())
            .then(result =>
                {
                    if(result.status === "success")
                    {
                        this.setState(() => ({ addMembersContainer: true, addGroupMembers: result.friends, addMembersLoader: false, DeleteGroupMsgList: false }));

                        this.memberNum = 0;
                        this.memberNum += result.friends.length;

                    }
                    
                });
        }

        viewMembers(): void
        {
            this.checkCookie();
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
            const groupId: string = this.state.chatContainer.chat_id.toString();
            const adminId: string = this.state.chatContainer.chat_adminId.toString();

            this.setState(() => ({ viewMembersContainer: true, DeleteFriendMsgList: false, DeleteGroupMsgList: false }));

            fetch(`${process.env.REACT_APP_API_URL}/fetch/group/members?u=${key}&r=${groupId}`)
            .then(response => response.json())
            .then((result: any): void =>
            {
                if(result.success)
                {
                    // this.setState(() => ({ MembersContainer: result.data }));
                    const sortMembers: Array<any> = result.data;
                    const admin: Array<any> = [];

                    result.data.map((e, i, array) => 
                    {
                        if(e.userId.toString() === this.state.chatContainer.chat_adminId.toString())
                        {
                            admin.push(e);
                            sortMembers.splice(i, 1);

                        }
                    });

                    sortMembers.unshift(admin[0]);
                    
                    this.setState(() => ({ MembersContainer: sortMembers }));
                } 

            });
        }

        viewImgContainer(imgUrl: string): void 
        {
            this.setState(() => ({ imgString: imgUrl }));
        }

        userChatControl(index: number): void 
        {
            const controlContainer: any = this.state.chatContainer;

            controlContainer.msg[index].control = true;

            this.setState(() => ({ chatContainer: controlContainer }));
        }

        fetchChatList(): void
        {
            this.checkCookie();
            this.setState(() => ({ chatListLoader: true }));
            let num: number = 0;
            
            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            fetch(`${process.env.REACT_APP_API_URL}/messagelist?u=${key}`)
            .then(response => response.json())
            .then(result => 
            {
                this.setState(() => ({ chatListLoader: false, chatList: result }));

                this.clientSocket.emit("fetchMsgNum", true);
                // setTimeout(() => {
                //     console.log(this.state.chatList)
                    
                // }, 2000);
            });
            
            
        }

        async deleteChat(msgId: string, index: number, time: string, roomId: string): Promise<void> 
        {   

            if(time.length === 2 && time[1] === "m")
            {
                if(Number(time[0]) < 5)
                {
                    this.checkCookie();
            
                    const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                    const promise = await fetch(`${process.env.REACT_APP_API_URL}/delete/msg`, 
                    {
                        method: "POST",
                        headers:
                        {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ user: user, msgId: msgId, roomId: roomId })
                    });

                    if(promise.ok)
                    {
                        const result: any = await promise.json();

                        if(result.success)
                        {
                            const currentContainer: any = this.state.chatContainer;

                            currentContainer.msg[index].deleted = true;
                            currentContainer.msg[index].control = false;
                            
                            // this.totalMessage--;

                            this.setState(() => ({ chatContainer: currentContainer }));
                            this.fetchChatList();

                        } else
                        {
                            console.log("delete failed");
                        }
                    }

                } else 
                {
                    const currentContainerRecall: any = this.state.chatContainer;

                    currentContainerRecall.msg[index].control = false;

                    this.setState(() => ({ recallWarning: true, chatContainer: currentContainerRecall }));

                    setTimeout(() => {
                        this.setState(() => ({ recallWarning: false }));
                    }, 2000);

                }

            } else 
            {
                const currentContainerRecall: any = this.state.chatContainer;

                currentContainerRecall.msg[index].control = false;

                this.setState(() => ({ recallWarning: true, chatContainer: currentContainerRecall }));

                setTimeout(() => {
                    this.setState(() => ({ recallWarning: false }));
                }, 2000);

            }
            
        }

        cancelBlobFile(blob: string): void 
        {
            URL.revokeObjectURL(blob);
            this.fileInput.current!.value = "";

            this.setState(() => ({ BlobImageUploader: undefined, BlobType: undefined }));
        }

        buttonMessage(textBox: React.RefObject<HTMLTextAreaElement>, roomId: string): void 
        {

            if(textBox.current?.value.trim() !== "" && textBox.current?.value.trim() !== undefined)
            {
                this.postMsg(roomId, textBox.current?.value.trim());
            }
        }

        async blobFile(): Promise<void> 
        {
            if(this.fileInput.current!.files?.length !== 0)
            {
                // this.checkCookie();
                // const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const blobURL: any = URL.createObjectURL(this.fileInput.current!.files[0]);

                const blobType: string = this.fileInput.current!.files[0].type.split("/")[0];

                this.setState(() => ({ BlobImageUploader: blobURL, BlobType: blobType }));
            }
        }

        disbandConfirmation(): void 
        {
            this.setState(() => ({ disbandConfirmation: true, DeleteFriendMsgList: false, DeleteGroupMsgList: false}))
        }

        unClickContainer(): void 
        {
            const container: any = this.state.chatContainer;

            container.msg.forEach((e: any): void => 
            {
                e.control = false;
            });

            this.setState(() => ({ chatContainer: container }));
        } 

        cancelViewMembers(): void
        {
            this.setState(() => ({ viewMembersContainer: false, MembersContainer: undefined }));
        }

        async deleteChatListMsg(): Promise<void> 
        {
            this.checkCookie();
            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const nowChat: any = this.state.chatContainer;
            const latestMsgId: string = nowChat.msg[nowChat.msg.length - 1].message_id;
            const groupId: string = nowChat.chat_id.toString()


            const promise = await fetch(`${process.env.REACT_APP_API_URL}/delete/chat`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, latestMsgId: latestMsgId, groupId: groupId })
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    this.fetchChatList();
                    this.setState(() => ({ chatContainer: undefined, DeleteFriendMsgList: false, DeleteGroupMsgList: false }));
                }
            }

        }

        setScrollEvent(): void
        {
            if(this.chatScroll.current !== null)
            {
                this.chatScroll.current!.onscroll = (): void =>
                {
                    const currentChat: any = this.state.chatContainer;

                    if(currentChat !== undefined && !this.state.noMoreOldChat)
                    {
                        const elmTop: number = this.chatScroll.current!.scrollTop;
                        const elmHeight: number =  this.chatScroll.current!.scrollHeight;
                        const elmClientHeight: number = this.chatScroll.current!.clientHeight;

                        const heightPercentage: number = Math.round((elmTop / (elmHeight - elmClientHeight)) * 100);

                        if(heightPercentage === 0)
                        {
                            if(this.state.fetchOldChatloader === false)
                            {
                                this.checkCookie();
                                this.setState(() => ({ fetchOldChatloader: true }));

                                const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                                const chatNum: number = this.state.chatContainer.msg.length;
                                const roomId: string = currentChat.chat_id.toString();

                                fetch(`${process.env.REACT_APP_API_URL}/fetcholdchat?u=${key}&n=${this.totalMessage}&r=${roomId}`)
                                .then(response => response.json())
                                .then(result => 
                                {
                                    if(result.success)
                                    {
                                        if(result.data.length <= 0)
                                        {
                                            setTimeout(() => {
                                                this.setState(() => ({ fetchOldChatloader: false, noMoreOldChat: true }));
                                            }, 2000);

                                        } else 
                                        {
                                            const currentMsg: any = this.state.chatContainer;

                                            result.data.map(e => 
                                            {
                                                if(!result.deleteMsg.includes(e.message_id.toString()))
                                                {
                                                    e.deleted = false;
                                                    return e;

                                                } else 
                                                {
                                                    e.deleted = true;
                                                    return e;
                                                }
                                                
                                            });

                                            result.data.map(e => e.control = false);

                                            // console.log(result.data);

                                            this.totalMessage += result.data.length;

                                            const currentChatId: Array<string> = currentMsg.msg.map(e => e.message_id.toString());

                                            const sortOldMsg: Array<any> = result.data.filter(e => !currentChatId.includes(e.message_id.toString()));

                                            let oldMsg: any = result.data.filter(e => !currentChatId.includes(e.message_id.toString())).reverse().concat(currentMsg.msg);
                                            
                                            

                                            // oldMsg = oldMsg.filter(e => !result.deleteMsg.includes(e.message_id.toString()));

                                            currentMsg.msg = oldMsg;

                                            setTimeout(() => {
                                                this.setState(() => ({ fetchOldChatloader: false, chatContainer: currentMsg, noMoreOldChat: sortOldMsg.length > 0 ? false : true}));
                                            }, 2000);
                                        }
                                    }

                                });
                            }
                        }
                    }
                }
            }
        }

        textBoxExpand(textBox: React.RefObject<HTMLTextAreaElement>, event: any, roomId: string): void 
        {
            textBox.current!.style.height = "";

            const limit: number = Math.min(45, Number(textBox.current!.scrollHeight) - 20);

            textBox.current!.style.height = `${limit}px`;

            if(event.shiftKey === false && event.code === "Enter" && textBox.current?.value.trim() !== "" && textBox.current?.value.trim() !== undefined)
            {
                this.postMsg(roomId, textBox.current?.value.trim());
            }

        }

        async postMsg(roomId: string, chatText: string): Promise<void>
        {
            this.checkCookie();
            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/post/msg`, 
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({user: user, rId: roomId, msg: chatText})
            });

            if(promise.ok)
            {
                const result: { success: boolean | string, data: any } = await promise.json();

                if(result.success === true)
                {
                    console.log("msg post success");

                    this.textBox.current!.value = "";
                    this.textBox.current!.style.height = "";
                    
                    this.msgScrollDown();

                } else if(result.success === "blocked")
                {
                    this.setState(() => ({ chatContainer: undefined }));
                    this.fetchChatList();
                }

  
            }

            this.fileInput.current.value = "";

        }

        async groupDisband(): Promise<void>
        {
            this.checkCookie();
            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const roomId: string = this.state.chatContainer.chat_id.toString();
            
            const promise = await fetch(`${process.env.REACT_APP_API_URL}/disband/group`,
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, roomId: roomId })
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    this.setState(() => ({ disbandConfirmation: false }));
                }
            }
        }

        async postMedia(): Promise<void> 
        {
            this.checkCookie();
            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

            const mediaFile: File = this.fileInput.current?.files[0];

            const form = new FormData();

            form.append("file", mediaFile);
            form.append("user", user);
            form.append("roomId", this.state.chatContainer.chat_id.toString())

            this.setState(() => ({ uploadingMedia: true }));

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/group/file`, 
            {
                method: "POST",
                body: form
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    if(this.state.BlobImageUploader !== undefined)
                    {
                        URL.revokeObjectURL(this.state.BlobImageUploader);

                    }

                    this.setState(() => ({ BlobImageUploader: undefined, BlobType: undefined }));
                }

                if(result.status === true && result.result === "oversize")
                {
                    this.setState(() => ({ overSize: true }));

                    setTimeout(() => {
                        this.setState(() => ({ overSize: false }));
                    }, 2000);

                    if(this.state.BlobImageUploader !== undefined)
                    {
                        URL.revokeObjectURL(this.state.BlobImageUploader);

                    }

                    this.setState(() => ({ BlobImageUploader: undefined, BlobType: undefined }));

                }

                this.setState(() => ({ uploadingMedia: false }));
            }
            
            this.fileInput.current.value = "";
        }

        msgScrollDown(): void 
        {
            setTimeout(() => 
            {
                this.chatScroll.current!.scrollTop = this.chatScroll.current!.scrollHeight;

            }, 220);
        }

        chatContainer(room_id: string, index: number): void
        {
            this.checkCookie();

            const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

            fetch(`${process.env.REACT_APP_API_URL}/fetch/chat?u=${key}&rid=${room_id}`)
            .then(response => response.json())
            .then(result => 
            {
                if(result.success)
                {
                    result.data[0].msg.map(e => e.control = false);
                    const totalMsg: number = result.data[0].msg.length

                    this.totalMessage = 0;
                    this.totalMessage += result.data[0].msg.length;

                    // console.log(result.deleteMsg);

                    const sortMsg: any = result.data[0].msg;

                    const sortDeleteMsg: any = result.data[0].msg.map(e => 
                    {
                        // console.log(e.message_id);
                        if(result.deleteMsg.includes(e.message_id.toString()))
                        {
                            e.deleted = true;
                            return e;

                        } else 
                        {
                            e.deleted = false;
                            return e;
                        }

                    });

                    result.data[0].msg = sortDeleteMsg;

                    const deletedMsg: number = sortMsg.length;
                    
                    const newChatList: Array<any> = this.state.chatList;

                    newChatList[index].unseen_msg = 0;
                    // console.log(sortDeleteMsg);

                    this.setState(() => ({ chatContainer: result.data[0], fetchOldChatloader: false, noMoreOldChat: false, chatList: newChatList }));
                    this.fetchChatList();
                    
                    this.msgScrollDown();

                    if(totalMsg >= 20 && deletedMsg < 10)
                    {
                        setTimeout(() => {
                                this.checkCookie();
                                this.setState(() => ({ fetchOldChatloader: true }));

                                const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());
                                const chatNum: number = this.state.chatContainer.msg.length;
                                const roomId: string = this.state.chatContainer.chat_id.toString();

                                fetch(`${process.env.REACT_APP_API_URL}/fetcholdchat?u=${key}&n=${this.totalMessage}&r=${roomId}`)
                                .then(response => response.json())
                                .then(result => 
                                {
                                    if(result.success)
                                    {
     
                                        if(result.data.length <= 0)
                                        {
                                            setTimeout(() => {
                                                this.setState(() => ({ fetchOldChatloader: false, noMoreOldChat: true }));
                                            }, 2000);

                                        } else 
                                        {
                                            const currentMsg: any = this.state.chatContainer;

                                            result.data.map(e => e.control = false);

                                            this.totalMessage += result.data.length;

                                            const currentChatId: Array<string> = currentMsg.msg.map(e => e.message_id.toString());

                                            const sortOldMsg: Array<any> = result.data.filter(e => !currentChatId.includes(e.message_id.toString()));

                                            // console.log(sortOldMsg.length)

                                            let oldMsg: any = result.data.filter(e => !currentChatId.includes(e.message_id.toString())).reverse().concat(currentMsg.msg);

                                            oldMsg = oldMsg.filter(e => !result.deleteMsg.includes(e.message_id.toString()));

                                            currentMsg.msg = oldMsg;

                                            setTimeout(() => {
                                                this.setState(() => ({ fetchOldChatloader: false, chatContainer: currentMsg, noMoreOldChat: sortOldMsg.length > 0 ? false : true}));
                                                this.msgScrollDown();
                                            }, 1000);
                                        }
                                    }

                                });

                        }, 1000);
                                
                    }
                }
                
                setTimeout(() => {
                    console.log(this.state.chatContainer);
                    this.chatScroll.current!.style.height = `${window.outerHeight - 300}px`;
                    this.setScrollEvent();

                }, 100);

            });

        }

        hideMessageConfirm(messageId: string, index: number, roomId: string): void
        {
            this.setState(() => ({ hideWarning: { messageId: messageId, index: index, roomId: roomId } }));
        }

        async hideMessage(messageId: string, index: number, roomId: string): Promise<void> 
        {
            this.checkCookie();
            
                    const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                    const promise = await fetch(`${process.env.REACT_APP_API_URL}/hide/msg`, 
                    {
                        method: "POST",
                        headers:
                        {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ user: user, msgId: messageId, roomId: roomId })
                    });

                    if(promise.ok)
                    {
                        const result: any = await promise.json();

                        if(result.success)
                        {
                            const currentContainer: any = this.state.chatContainer;

                            currentContainer.msg[index].hidden = true;
                            currentContainer.msg[index].control = false;
                            
                            // this.totalMessage--;

                            this.setState(() => ({ chatContainer: currentContainer, hideWarning: undefined }));
                            this.fetchChatList();

                        } else
                        {
                            console.log("delete failed");
                        }
                    }
        }

        cancelCreateChatModel(): void
        {
            this.setState(() => ({ createNewChat: false, createFriend: false, createGroup: false,groupMembers: false, groupMemberList: [], groupSeletedMembers: [], friendMembers: false, friendMemberList: [],
                                   friendSelectedMembers: [], membersLoader: false, checkGroup: false, checkFriend: false, checkGroupMember: false }));
        }

        createChat(): void 
        {
            this.setState((s) => ({ createNewChat: true }));
        }

        createGroupChat(): void 
        {
            this.setState(() => ({ createGroup: true }));
        }

        createFriendChat(): void 
        {
            this.setState(() => ({ createFriend: true }));
        }

        searchGroupMembers(): void 
        {
            this.checkCookie();

            const searchQuery: string | undefined = this.GroupSearch.current?.value.trim();

            if(this.groupTimer !== undefined)
            {
                clearInterval(this.groupTimer);
            }

            if(searchQuery !== "" && searchQuery !== undefined)
            {
                this.setState(() => ({ groupMembers: true, membersLoader: true }));

                this.groupTimer = setTimeout(() => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                    // fetch(`${process.env.REACT_APP_API_URL}/chatfriend?u=${key}&n=0&s=${searchQuery}`)
                    fetch(`${process.env.REACT_APP_API_URL}/chatfriend?u=${key}&s=${searchQuery}`)
                    .then(response => response.json())
                    .then(result => 
                        {
                            const currentMemberList: Array<any> = this.state.groupSeletedMembers.map((e) => e.userId);
                            const sortArray: Array<any> = result.filter((e: any) => !currentMemberList.includes(e.userId));

                            this.setState(() => ({ groupMemberList: sortArray, membersLoader: false }));
                        });

                }, 1500);

            } else 
            {
                this.setState(() => ({ groupMembers: false, membersLoader: false, groupMemberList: [] }));
            }
            
        }

        selectedGroupMember(userId: string, name: string, profile: string): void 
        {
            const currentSelectedMembers: Array<any> = this.state.groupSeletedMembers;
            const searchGroupArray: Array<any> = this.state.groupMemberList;

            const sortArray: Array<any> = searchGroupArray.filter((e) => e.userId !== userId);

            currentSelectedMembers.push({ userId: userId, name: name, profile: profile });

            this.setState(() => ({ groupSeletedMembers: currentSelectedMembers, groupMemberList: sortArray }));
        }

        deleteSelectedGroup(userId: string): void 
        {
            const selectedGroup = this.state.groupSeletedMembers.filter((e) => e.userId !== userId);

            this.setState(() => ({ groupSeletedMembers: selectedGroup }));
        }

        async AddMember(userId: string, index: number): Promise<void> 
        {
            this.checkCookie();

            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());
            const roomId: string = this.state.chatContainer.chat_id.toString();

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/group/add/member`, 
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, memberId: userId, roomId: roomId })
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    this.searchMembers();
                }
            }

        }

        exitGroupConfirmation(): void 
        {
            this.setState(() => ({ exitConfirmation: true, DeleteFriendMsgList: false, DeleteGroupMsgList: false }));
        }

        async exitGroup(): Promise<void> 
        {
            this.checkCookie();

            const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());
            const roomId: string = this.state.chatContainer.chat_id.toString();

            const promise = await fetch(`${process.env.REACT_APP_API_URL}/exit/group`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ user: user, roomId: roomId })
            });

            if(promise.ok)
            {
                const result = await promise.json();

                if(result.success)
                {
                    this.setState(() => ({ exitConfirmation: false }));
                }
            }

        }

        async createGroup(): Promise<void> 
        {
            this.checkCookie();

            const groupName: string | undefined = this.GroupName.current?.value.trim();
            const userIds: Array<string> = this.state.groupSeletedMembers.map((e) => e.userId);

            if(groupName !== "" && groupName !== undefined && this.state.groupSeletedMembers.length > 0)
            {
                const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/create/chat/group`, 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: user, groupName: groupName, members: userIds })
                });

                if(promise.ok)
                {
                    const result = await promise.json();

                    if(result.success)
                    {
                        this.cancelCreateChatModel();
                    }
                }

            } else 
            {
                if(groupName === "" || groupName === undefined)
                {
                    this.setState(() => ({ checkGroup: true }));

                } else 
                {
                    this.setState(() => ({ checkGroup: false }));
                }

                if(this.state.groupSeletedMembers.length <= 0)
                {
                    this.setState(() => ({ checkGroupMember: true }));

                } else 
                {
                    this.setState(() => ({ checkGroupMember: false }));
                }
            }
        }

        searchFriendMember(): void 
        {
            this.checkCookie();

            const searchQuery: string | undefined = this.FriendSearch.current?.value.trim();

            if(this.friendTimer !== undefined)
            {
                clearInterval(this.friendTimer);
            }

            if(searchQuery !== "" && searchQuery !== undefined)
            {
                this.setState(() => ({ friendMembers: true, membersLoader: true }));

                this.friendTimer = setTimeout(() => 
                {
                    const key: string = encodeURIComponent(this.props.cookie.sconnecti.toString());

                    // fetch(`${process.env.REACT_APP_API_URL}/chatfriend?u=${key}&n=0&s=${searchQuery}`)
                    fetch(`${process.env.REACT_APP_API_URL}/chatfriendnonexist?u=${key}&s=${searchQuery}`)
                    .then(response => response.json())
                    .then(result => 
                        {
                            const currentMemberList: Array<any> = this.state.groupSeletedMembers.map((e) => e.userId);
                            const sortArray: Array<any> = result.filter((e: any) => !currentMemberList.includes(e.userId));

                            this.setState(() => ({ friendMemberList: sortArray, membersLoader: false }));
                        });   
                         
                }, 1500);

            } else 
            {
                this.setState(() => ({ friendMembers: false, membersLoader: false, friendMemberList: [] }));
            }
        }

        selectedFriendMember(userId: string, name: string): void 
        {
            const searchArray: Array<any> = this.state.friendMemberList.filter(e => e.userId !== userId);
            this.setState(() => ({ friendSelectedMembers: [{ userId: userId, name: name }], friendMemberList: searchArray }));
        }

        async createFriend(): Promise<void> 
        {
            this.checkCookie();

            if(this.state.friendSelectedMembers.length === 1)
            {
                const user: string  = decodeURIComponent(this.props.cookie.sconnecti.toString());
                const friendId: string = this.state.friendSelectedMembers[0].userId;

                const promise = await fetch(`${process.env.REACT_APP_API_URL}/create/chat/friend`, 
                {
                    method: "POST",
                    headers: 
                    {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ user: user, friendId: friendId})
                });

                if(promise.ok)
                {
                    const result = await promise.json();

                    if(result.success)
                    {
                        this.cancelCreateChatModel();
                    }
                }

            } else 
            {
                this.setState(() => ({ checkFriend: true }))
            }
  
        }

        render(): JSX.Element 
        {
            return (
                <div className="message-main-container" hidden={!this.state.messagePath}>

                    {this.state.overSize ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block" style={{ padding: "20px" }}>
                            <span>Please choose a file size less than 50 megebyte</span>
                            <span>For each of the image/video file</span>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.uploadingMedia ?
                    <div className="uploader-post-container">
                        <div className="uploader-post-block">
                            <span>Uploading file...</span>
                            <div className="search-post-loader" style={{ width: "auto" }}>
                                <div></div>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.recallWarning ?
                    <div className="third-fixed-container">
                        <div className="third-fixed-block">
                            <div className="third-fixed-header">
                                <div>Message cannot be recall after five minutes</div>
                            </div>
                        </div>
                    </div>
                    :
                    <></>
                    }

                    {this.state.hideWarning !== undefined ?
                    <div className="delete-post-confrim-block">
                        <div className="delete-post-block">
                            <div>
                                <span>Hide this post?</span>
                            </div>
                            <div>
                                <div onClick={() => this.hideMessage(this.state.hideWarning.messageId, this.state.hideWarning.index, this.state.hideWarning.roomId)}>
                                    Hide
                                </div>
                                <div onClick={() => this.setState(() => ({ hideWarning: undefined }))}>Cancel</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.addMembersContainer ?
                    <div className="add-member-container">
                        <div className="add-member-block">
                            <div className="add-member-block-close-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="close-add-member" viewBox="0 0 16 16" onClick={() => this.setState(() => ({ addMembersContainer: false, addGroupMembers: undefined }))}>
                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </div>
                            <div className="add-member-header">
                                <span>Add Members</span>
                            </div>
                            <div className="add-member-search-block">
                                <input type="text" autoComplete="off" placeholder="Search friend..." onInput={this.searchMembers} ref={this.searchMemberInput}/>
                            </div>
                            <div className="add-member-body-container">
                                {this.state.addGroupMembers !== undefined ?
                                    !this.state.addMembersLoader ? 
                                        this.state.addGroupMembers.length > 0 ?
                                            this.state.addGroupMembers.map((m, i, a) => 
                                            (
                                            <div key={`add-members-block-${i}`}>
                                                <svg viewBox="0 0 100 100" width="40" height="40">
                                                    <title>{m.f_name}</title>
                                                    <defs>
                                                        <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                        <clipPath id="circle-clip">
                                                        <use xlinkHref="#circle"/>
                                                        </clipPath>
                                                    </defs>
                                                    <g clipPath="url(#circle-clip)">
                                                        <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${m.f_profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                        <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                    </g>
                                                </svg>
                                                <div className="add-members-username">
                                                    <span>{m.f_name}</span>
                                                </div>
                                                <div className="add-member-btn">
                                                    <div onClick={() => this.AddMember(m.friendId, i)}>Add</div>
                                                </div>
                                            </div>
                                            ))
                                            :
                                        <div>Empty non exist group friends...</div>
                                        :
                                        null
                                    :
                                    null
                                }

                                {this.state.addMembersLoader ?
                                <div className="add-members-loader-container">
                                    <div></div>
                                </div>
                                :
                                null
                                }
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {this.state.imgString !== undefined ?
                    <div className="view-img-chat-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="chat-view-img-close" viewBox="0 0 16 16" onClick={() => this.setState(() => ({ imgString: undefined }))}>
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        <div className="view-img-chat-block">
                            <img src={this.state.imgString} alt={this.state.imgString}/>
                        </div>
                    </div>
                    :
                    null
                    }

                {(this.state.DeleteGroupMsgList || this.state.DeleteFriendMsgList) ?
                <div className="delete-message-list-container" onClick={() => this.setState(() => ({ DeleteGroupMsgList: false, DeleteFriendMsgList: false }))}>
                </div>
                :
                null
                }

                    {this.state.DeleteFriendMsgList ?
                    <div className="room-option-container">
                        <div onClick={this.deleteChatListMsg}>Delete</div>
                    </div>
                    :
                    null
                    }

                    {this.state.chatContainer !== undefined ?
                    this.state.chatContainer.userRoomStatus !== "disband" ?
                    this.state.DeleteGroupMsgList ?
                    <div className="room-option-container">
                        {/* <div onClick={this.deleteChatListMsg}>Delete</div> */}
                        <div onClick={this.viewMembers}>Members</div>

                        {this.state.chatContainer.chat_adminId.toString() === this.props.userId?.toString() ?
                        <div onClick={this.addMembers}>Add Members</div>
                        :
                        null
                        }

                        {this.state.chatContainer.chat_adminId.toString() === this.props.userId?.toString() ?
                        <div onClick={this.disbandConfirmation}>Disband group</div>
                        :
                        <div onClick={this.exitGroupConfirmation}>Exit group</div>
                        }
                    </div>
                    :
                    null
                    :
                    this.state.DeleteGroupMsgList ?
                    <div className="room-option-container">
                        <div onClick={this.deleteChatListMsg}>Delete</div>
                    </div>
                    :
                    null
                    :
                    null
                    }

                    {/* exit group confirmation container */}
                    {this.state.exitConfirmation ? 
                    <div className="third-fixed-container">
                        <div className="third-fixed-block">
                            <div className="third-fixed-header">
                                <div>Are you sure to exit the group?</div>
                            </div>
                            <div className="third-fixed-footer">
                                <div onClick={() => this.setState(() => ({ exitConfirmation: false }))}>Cancel</div>
                                <div onClick={this.exitGroup}>Exit Group</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {/* disband confirmation container */}
                    {this.state.disbandConfirmation ?
                    <div className="third-fixed-container">
                        <div className="third-fixed-block">
                            <div className="third-fixed-header">
                                <div>Are you sure to disband the group?</div>
                            </div>
                            <div className="third-fixed-footer">
                                <div onClick={() => this.setState(() => ({ disbandConfirmation: false }))}>Cancel</div>
                                <div onClick={this.groupDisband}>Disband</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {/* remove member confirmation container */}
                    {this.state.removeConfirmation !== undefined ?
                    <div className="third-fixed-container">
                        <div className="third-fixed-block">
                            <div className="third-fixed-header">
                                <div>Are you sure to remove</div>
                                <div title={this.state.removeConfirmation.name}>
                                    {this.state.removeConfirmation.name}
                                </div>
                                <div>from the group?</div>
                            </div>
                            <div className="third-fixed-footer">
                                <div onClick={() => this.setState(() => ({ removeConfirmation: undefined }))}>Cancel</div>
                                <div onClick={() => this.confirmRemoveMember(this.state.removeConfirmation.userId, this.state.removeConfirmation.i)}>Remove</div>
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {/* view members container */}
                    {this.state.viewMembersContainer ? 
                    <div className="view-members-container">
                        <div className="view-members-block">
                            <div className="view-members-header">
                                <div>
                                    <span>{this.state.MembersContainer === undefined ? 0 : this.state.MembersContainer.length}</span>
                                    <span>Members</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="close-btn" viewBox="0 0 16 16" onClick={this.cancelViewMembers}>
                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </div>
                            <div className="view-members-body">
                                {this.state.MembersContainer !== undefined ?
                                    this.state.MembersContainer.length > 0 ?
                                    this.state.MembersContainer.map((member, index, array) => 
                                    (
                                        <div key={`member-${member.userId}`} style={{ position: "relative" }}>
                                            {index === 0 ?
                                            <span className="admin-label">Admin</span>
                                            :
                                            null
                                            }
                                            <svg viewBox="0 0 100 100" width="40" height="40">
                                                <title>{member.name}</title>
                                                <defs>
                                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                    <clipPath id="circle-clip">
                                                    <use xlinkHref="#circle"/>
                                                    </clipPath>
                                                </defs>
                                                <g clipPath="url(#circle-clip)">
                                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${member.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                </g>
                                            </svg>
                                            <div className="view-members-title">
                                                <span>{member.name}</span>
                                            </div>
                                            {(this.state.chatContainer.chat_adminId.toString() === this.props.userId?.toString()) && (this.state.chatContainer.chat_adminId.toString() !== member.userId.toString()) ?
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="member-close" viewBox="0 0 16 16" onClick={() => this.removeMembersConfirm(member.userId, member.name, index)} >
                                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                            </svg>
                                            :
                                            null
                                            }
                                        </div>
                                    ))
                                :
                                <div>0</div>
                                :
                                null
                                }
                                
                            </div>
                        </div>
                    </div>
                    :
                    null
                    }

                    {/* create chat/group container */}
                    {this.state.createNewChat ?
                    <div className="create-container">
                        <div className="create-block">
                            <div className="create-header-block">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="close-btn" viewBox="0 0 16 16" onClick={this.cancelCreateChatModel}>
                                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </div>
                            
                            {!this.state.createFriend && !this.state.createGroup ?
                            <div className="create-body-block">
                                <div onClick={this.createGroupChat}>
                                    <span>Create Group Chat</span>
                                </div>
                                <div onClick={this.createFriendChat}>
                                    <span>Create Friend Chat</span>
                                </div>
                            </div>
                            :
                            null
                            }

                            {this.state.createGroup ?
                            <div className="create-body-block-group" style={{position: "relative"}}>
                                <div className="create-group-header">
                                    <span>Create Group Chat</span>
                                </div>
                                <div className="signin-block">
                                    <input className="input-box" type="text" id="g-name" autoComplete="off" required style={(this.state.checkGroup) ? {backgroundColor: "#202020", border: "1px solid #E3583A"} : {backgroundColor: "#202020", border: "1px solid #E1E4EC"}} ref={this.GroupName}/>
                                    <label className="label-input" htmlFor="g-name" style={(this.state.checkGroup) ? {color: "#E3583A"} : {color: "#E1E4EC"}}>Group name</label>
                                </div>
                                <div className="signin-block">
                                    <input className="input-box" type="text" id="g-member" autoComplete="off" required ref={this.GroupSearch} onInput={this.searchGroupMembers} style={{backgroundColor: "#202020", border: "1px solid #E1E4EC"}}/>
                                    <label className="label-input" htmlFor="g-member">Search Members</label>
                                </div>
                                    
                                    {this.state.groupMembers ?
                                    <div className="members">
                                        {this.state.groupMemberList.map((m, i, a) => 
                                        (
                                        <div className="members-block" key={`serach-block-${m.userId}`} onClick={() => this.selectedGroupMember(m.userId, m.name, m.profile)}>
                                            <svg viewBox="0 0 100 100" width="40" height="40">
                                                <title>{m.name}</title>
                                                <defs>
                                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                    <clipPath id="circle-clip">
                                                    <use xlinkHref="#circle"/>
                                                    </clipPath>
                                                </defs>
                                                <g clipPath="url(#circle-clip)">
                                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${m.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                </g>
                                            </svg>
                                            <div className="members-container">{m.name}</div>
                                        </div>
                                        ))}

                                        {this.state.membersLoader ?
                                        <div className="members-loader-container">
                                            <div></div>
                                        </div>
                                        :
                                        this.state.groupMemberList.length <= 0 ?
                                        <div className="members-non-exist-block">User not exist...</div>
                                        :
                                        null
                                        }
                                        
                                    </div>
                                    :
                                    null
                                    }

                                <div className="group-member-container">
                                    <div className="members-title">
                                        <span style={(this.state.checkGroupMember) ? {color: "#E3583A"} : {color: "#E1E4EC"}}>Group members</span>
                                    </div>
                                    <div className="group-block" style={(this.state.checkGroupMember) ? {border: "1px solid #E3583A"} : {border: "1px solid #E1E4EC"}}>
                                        {this.state.groupSeletedMembers.map((member, index, array) => 
                                        (
                                            <div className="member-block" style={{height: "30px", maxWidth: "370px"}} key={member.userId}>
                                                <div style={{maxWidth: "340px"}}>
                                                    <span>{member.name}</span>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="member-close" viewBox="0 0 16 16" onClick={() => this.deleteSelectedGroup(member.userId)}>
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="group-option-container">
                                    <div onClick={() => this.setState({ createFriend: false, createGroup: false, groupMembers: false, groupMemberList: [], groupSeletedMembers: [], friendMembers: false, friendMemberList: [],
                                   friendSelectedMembers: [], membersLoader: false, checkGroup: false, checkFriend: false, checkGroupMember: false })}>
                                        <span>Back</span>
                                    </div>
                                    <div onClick={this.createGroup}>
                                        <span>Create Group</span>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                            }


                                    {this.state.friendMembers ?
                                    <div className="members" style={{marginTop: "145px"}}>
                                        {this.state.friendMemberList.map((member, index, array) => 
                                        (
                                        <div className="members-block" key={`friend-member-${member.userId}`} onClick={() => this.selectedFriendMember(member.userId, member.name)}>
                                            <svg viewBox="0 0 100 100" width="40" height="40">
                                                <title>{member.name}</title>
                                                <defs>
                                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                    <clipPath id="circle-clip">
                                                    <use xlinkHref="#circle"/>
                                                    </clipPath>
                                                </defs>
                                                <g clipPath="url(#circle-clip)">
                                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${member.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                </g>
                                            </svg>
                                            <div className="members-container">{member.name}</div>
                                        </div>
                                        ))}

                                        {this.state.membersLoader ?
                                        <div className="members-loader-container">
                                            <div></div>
                                        </div>
                                        :
                                        this.state.friendMemberList.length <= 0 ?
                                        <div className="members-non-exist-block">User not exist...</div>
                                        :
                                        null  
                                        }
                                        
                                    </div>
                                    :
                                    null
                                    }

                            {this.state.createFriend ?
                            <div className="create-friend-chat-container">
                                <div className="create-group-header">
                                    <span>Create Friend Chat</span>
                                </div>
                                <div className="signin-block">
                                    <input className="input-box" type="text" id="g-name" autoComplete="off" required style={{backgroundColor: "#202020", border: "1px solid #E1E4EC"}} onInput={this.searchFriendMember} ref={this.FriendSearch}/>
                                    <label className="label-input" htmlFor="g-name">Non exist friend chat</label>
                                </div>
                                <div className="group-member-container" style={{padding: "20px 0"}}>
                                    <div className="group-block" style={this.state.checkFriend ? {border: "1px solid #E3583A", justifyContent: "left", height: "40px"} : {justifyContent: "left", height: "40px"}}>
                                        {this.state.friendSelectedMembers.length === 1 ?
                                        <div className="member-block" style={{ maxWidth: "400px"}}>
                                            <div style={{ maxWidth: "350px"}}>
                                                <span>{this.state.friendSelectedMembers[0].name}</span>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="member-close" viewBox="0 0 16 16" onClick={() => this.setState(() => ({ friendSelectedMembers: [] }))}>
                                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                            </svg>
                                        </div>
                                        :
                                        null
                                        }
                                    </div>
                                    <div className="members-title" style={this.state.checkFriend ? {color: "#E3583A", top: "5px", left: "25px", padding: "0 10px"} : {top: "5px", left: "25px", padding: "0 10px"}}>Conversation Friend</div>
                                </div>
                                <div className="create-friend-option-container">
                                    <div onClick={() => this.setState(() => ({ createFriend: false, createGroup: false, groupMembers: false, groupMemberList: [], groupSeletedMembers: [], friendMembers: false, friendMemberList: [],
                                   friendSelectedMembers: [], membersLoader: false, checkGroup: false, checkFriend: false, checkGroupMember: false }))}>
                                        <span>Back</span>
                                    </div>
                                    <div onClick={this.createFriend}>
                                        <span>Create Conversation</span>
                                    </div>
                                </div>
                            </div>
                            :
                            null
                            }
                            
                        </div>
                    </div>
                    :
                    null 
                    }

                    <div className="message-list-container">
                        {/* <div className="message-search-list-block">
                            <input type="text" autoComplete="off" placeholder="Search friend/group..."/>
                        </div> */}
                        <div className="add-chat-container" style={{top:"0", backgroundColor: "#202020", zIndex: 1}}>
                            <span>Create Group/Friend Chat</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="add-chat" viewBox="0 0 16 16" onClick={this.createChat}>
                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                        </div>
                        {this.state.chatList.length > 0 ?
                            this.state.chatList.map((chatList, index, array) => 
                            (
                                (chatList.um_friend_id === "none" ?
                                <div className="message-list-block" key={`chat-list-${chatList.um_id}`} onClick={() => this.chatContainer(chatList.um_roomId, index)}>
                                    <div className="message-user-icon-block">
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "60px", height: "60px", border: "1px solid #E1E4EC", borderRadius: "50%", padding: "0 0", fontWeight: "600"}}>
                                            <span style={{marginTop: "-2px"}}>Group</span>
                                        </div>
                                        {chatList.unseen_msg > 0 ?
                                        <div className="chat-unread-amount-block">{chatList.unseen_msg}</div>
                                        :
                                        null
                                        }
                                    </div>
                                    <div className="message-content-block">
                                        <div className="message-content-block-username">
                                            <span>{chatList.room_name}</span>
                                        </div>
                                        <div className="message-user-content-block">
                                            <div>
                                                <span>
                                                    {chatList.msg[0].message_type === "message" ? chatList.msg[0].message_content : chatList.msg[0].message_type === "media" ? 
                                                    chatList.msg[0].message_content === "User recalled message" ? "User recalled message" :
                                                    chatList.msg[0].message_content === "You hidden this message" ? "You hidden this message":
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="media-chat-icon" viewBox="0 0 16 16">
                                                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                                                    </svg>
                                                    : 
                                                    chatList.msg[0].message_type === "removed" ?
                                                    "User have been removed"
                                                    :
                                                    chatList.msg[0].message_type === "disband" ?
                                                    "Group disbanded"
                                                    :
                                                    chatList.msg[0].message_type === "group created" ?
                                                    "Group created" :
                                                    chatList.msg[0].message_type === "member join" ?
                                                    "User join the group"
                                                    :
                                                    chatList.msg[0].message_type === "exit group" ?
                                                    "User have leave the group"
                                                    :
                                                    "Conversation created"
                                                    }
                                                 </span>
                                            </div>
                                            <div  title={TimeDate.Run(chatList.msg[0].message_time).totalDate}>
                                                <span>{TimeDate.Run(chatList.msg[0].message_time).calculatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="message-list-block" key={`chat-list-${chatList.um_id}`} onClick={() => this.chatContainer(chatList.um_roomId, index)}>
                                    <div className="message-user-icon-block">
                                        <svg viewBox="0 0 100 100" width="60" height="60">
                                            <title>{chatList.friendInfo[0].name}</title>
                                            <defs>
                                                <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                <clipPath id="circle-clip">
                                                <use xlinkHref="#circle"/>
                                                </clipPath>
                                            </defs>
                                            <g clipPath="url(#circle-clip)">
                                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${chatList.friendInfo[0].profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                            </g>
                                        </svg>
                                        {chatList.friendInfo[0].online_status === "on" ? <div className="message-online-status-block active"></div> : <div className="message-online-status-block"></div>}
                                        {chatList.unseen_msg > 0 ? <div className="chat-unread-amount-block">{chatList.unseen_msg}</div> : null}
                                    </div>
                                    <div className="message-content-block">
                                        <div className="message-content-block-username">
                                            <span>{chatList.friendInfo[0].name}</span>
                                        </div>

                                        <div className="message-user-content-block">
                                            <div>
                                                <span>{chatList.msg[0].message_type === "message" ? chatList.msg[0].message_content : chatList.msg[0].message_type === "media" ? 
                                                chatList.msg[0].message_content === "User recalled message" ? "User recalled message" :
                                                    chatList.msg[0].message_content === "You hidden this message" ? "You hidden this message":
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="media-chat-icon" viewBox="0 0 16 16">
                                                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                                                    </svg>
                                                 : chatList.msg[0].message_type}</span>
                                            </div>
                                            <div title={TimeDate.Run(chatList.msg[0].message_time).totalDate}>
                                                <span>{TimeDate.Run(chatList.msg[0].message_time).calculatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )
        
                            ))
                        :
                        <div className="no-user-message-container">
                            <span>Empty chat history</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="clock-history" viewBox="0 0 16 16">
                                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                        </div>
                        }
                        
                        {this.state.chatListLoader ? 
                        <div className="chat-list-loader">
                            <div></div>
                        </div>
                        :
                        null
                        }

                    </div>

                    {this.state.chatContainer === undefined ?
                    <div className="message-container">
                        {/* intro container mean havent message someone yet */}
                        <div className="intro-message-block">
                            <span>Write message to someone</span>
                            <div className="intro-message-icon-block">
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="intro-message" viewBox="0 0 16 16">
                                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z"/>
                                    <path d="M8 3.993c1.664-1.711 5.825 1.283 0 5.132-5.825-3.85-1.664-6.843 0-5.132Z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="message-container-active">

                        {/* upload image confirmation in message */}
                        {this.state.BlobImageUploader !== undefined ?
                        <div className="message-media-image-container">
                            <div className="message-image-view-block">
                                <div className="message-media-image-header">
                                    <span>Media/Photo</span>
                                </div>
                                {this.state.BlobType === "image" ?
                                <img src={this.state.BlobImageUploader} alt={this.state.BlobImageUploader}/>
                                :
                                <video src={this.state.BlobImageUploader} controls></video>
                                }
                                
                                <div className="message-image-view-btn-block">
                                    <button onClick={this.postMedia}>Upload</button>
                                    <button onClick={() => this.cancelBlobFile(this.state.BlobImageUploader)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                        :
                        null
                        }

                        <div className="message-container-header">
                                
                                {this.state.chatContainer.chat_type === "friend" ?
                                <div className="message-header-block">
                                    <div className="chat-user-icon-block">
                                        <svg viewBox="0 0 100 100" width="40" height="40">
                                            <title>{this.state.chatContainer.name}</title>
                                            <defs>
                                                <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                <clipPath id="circle-clip">
                                                <use xlinkHref="#circle"/>
                                                </clipPath>
                                            </defs>
                                            <g clipPath="url(#circle-clip)">
                                                <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${this.state.chatContainer.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                            </g>
                                        </svg>
                                        {this.state.chatContainer.online_status === "on" ? <div className="online-status-block active"></div> : <div className="online-status-block"></div>}
                                    </div>
                                    <div className="user-chat-container">
                                        <div className="chat-title-container">
                                            <span>{this.state.chatContainer.room_name}</span>              
                                        </div>
                                        <div className="chat-status-block">
                                            {this.state.chatContainer.online_status === "on" ? <span>Online</span> : <span>Offline</span>}
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="message-header-block">
                                    <div className="user-chat-container">
                                        <div className="chat-title-container">
                                            <span>{this.state.chatContainer.room_name}</span>              
                                        </div>
                                        <div className="chat-status-block">
                                            <span>Group</span>
                                        </div>
                                    </div>
                                </div>
                                }

                                {this.state.chatContainer.chat_type === "friend" ?
                                <></>
                                :
                                this.state.chatContainer.userRoomStatus === "Active" ?
                                <div style={{position: "relative"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="three-dots-vertical" viewBox="0 0 16 16" onClick={this.deleteChatList}>
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                    </svg>
                                </div>
                                :
                                <></>
                                }

                            </div>

                        <div className="scroll-chat-container" ref={this.chatScroll}>
                            {this.state.fetchOldChatloader ?
                            <div className="old-chat-loader-container">
                                <div></div>
                            </div>
                            :
                            this.state.noMoreOldChat ?
                            <div className="notice-nomore-chat-block">
                                <span>No more old messages...</span>
                            </div>
                            :
                            null
                            }

                            {this.state.chatContainer.msg.map((msg, index, array) => 
                            (
                                (msg.message_type === "group created" || msg.message_type === "conversation created") || msg.message_type === "removed" || msg.message_type === "disband" || msg.message_type === "member join" || msg.message_type === "exit group" ?
                                    msg.message_type === "removed" ?
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>
                                                    {`${(this.props.userId?.toString() === msg.me.toString()) ? "You" : msg.name} have been removed`}
                                                </span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    msg.message_type === "disband" ?
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>Group disbanded</span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    msg.message_type === "group created" ?
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>
                                                    {`Group created by ${msg.name}`}
                                                </span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    msg.message_type === "member join" ?
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>
                                                    {`${msg.name} join the group`}
                                                </span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    msg.message_type === "exit group" ?
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>
                                                    {`${(this.props.userId?.toString() === msg.me.toString()) ? "You" : msg.name} have leave the group`}
                                                </span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div className="message-block-user" key={`chat-message-${msg.message_id}`} style={{justifyContent: "center"}}>
                                        <div className="user-message-block" style={{height: "auto", justifyContent: "center"}}>
                                            <div className="message-content-title" style={{height: "auto"}}>
                                                <span style={{fontWeight: "700"}}>
                                                    {`Conversation created by ${msg.name}`}
                                                </span>
                                                <div className="message-time-block">
                                                    <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).totalDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                :
                                (msg.me === this.props.userId) ? 
                                <div className="message-block-user" key={`chat-message-${msg.message_id}`}>
                                    <div className="user-message-block">
                                        {msg.deleted || msg.hidden ?
                                        <></>
                                        :
                                        <div className="option-control-chat-block">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="chat-user-three-dots" viewBox="0 0 16 16" onClick={() => this.userChatControl(index)}>
                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                            </svg>
                                            {msg.control ?
                                            msg.deleted ?
                                            <div className="option-control-chat-block-me">
                                                Recalled
                                            </div>
                                            :
                                            <div className="option-control-chat-block-me" onClick={() => this.deleteChat(msg.message_id.toString(), index, TimeDate.Run(msg.message_time).calculatedTime, msg.m_room_id)}>
                                                Recall
                                            </div>
                                            :
                                            <></>
                                            }
                                        </div>
                                        }

                                        {msg.control ? 
                                        <div className="unclick-control-container" onClick={this.unClickContainer}></div>
                                        :
                                        null
                                        }
                                        
                                        <div className="message-content-title" style={{ alignItems: "flex-end", display: "flex", flexDirection: "column" }}>
                                            <div className="name-chat-block" title={msg.name} style={{ padding: "5px 0" }}>
                                                {msg.name}
                                            </div>
                                            {msg.deleted === true ?
                                            <div style={{ backgroundColor: "#202020", padding: "5px 10px", borderRadius: "4px", fontWeight: "600" }}>Message recalled</div>
                                            :
                                            msg.message_type === "media" ?
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "jpg" ||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "png" ||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "jpeg"||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "gif" ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} alt={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} style={{ padding: "5px 0" }} onClick={() => this.viewImgContainer(`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`)} />
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} controls></video>
                                            :
                                            <span>
                                                {msg.message_content}
                                            </span>
                                            
                                            }
                                            <div className="message-time-block">
                                                <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).calculatedTime}</span>
                                            </div>
                                        </div>
                                        <div className="message-user-icon-box">
                                            <svg viewBox="0 0 100 100" width="35" height="35">
                                                <title>{msg.name}</title>
                                                <defs>
                                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                    <clipPath id="circle-clip">
                                                    <use xlinkHref="#circle"/>
                                                    </clipPath>
                                                </defs>
                                                <g clipPath="url(#circle-clip)">
                                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${msg.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="message-block-user-friend" key={`chat-message-${msg.message_id}`}>
                                    <div className="user-friend-message-block">
                                        <div className="message-user-icon-box">
                                            <svg viewBox="0 0 100 100" width="35" height="35">
                                                <title>{msg.name}</title>
                                                <defs>
                                                    <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                                    <clipPath id="circle-clip">
                                                    <use xlinkHref="#circle"/>
                                                    </clipPath>
                                                </defs>
                                                <g clipPath="url(#circle-clip)">
                                                    <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/${msg.profile}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                                    <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                                </g>
                                            </svg>
                                        </div>
                                        <div className="message-content-title">
                                            <div className="name-chat-block" title={msg.name} style={{ padding: "5px 0" }}>
                                                {msg.name}
                                            </div>
                                            {msg.hidden === true ?
                                            <div style={{ backgroundColor: "#202020", padding: "5px 10px", borderRadius: "4px", fontWeight: "600" }}>You hidden this message</div>
                                            :
                                            msg.deleted === true ?
                                            <div style={{ backgroundColor: "#202020", padding: "5px 10px", borderRadius: "4px", fontWeight: "600" }}>Message recalled</div>
                                            :
                                            msg.message_type === "media" ?
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "jpg" ||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "png" ||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "jpeg"||
                                                msg.message_content.split(".")[msg.message_content.split(".").length - 1] === "gif" ?
                                                <img src={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} alt={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} style={{ padding: "5px 0" }} onClick={() => this.viewImgContainer(`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`)} />
                                                :
                                                <video src={`${process.env.REACT_APP_API_URL}/media/${msg.message_content}`} controls></video>
                                            :
                                            <span>
                                                {msg.message_content}
                                            </span>
                                            
                                            
                                            }
                                            <div className="message-time-block-friend">
                                                <span title={TimeDate.Run(msg.message_time).totalDate}>{TimeDate.Run(msg.message_time).calculatedTime}</span>
                                            </div>
                                        </div>
                                        {msg.hidden || msg.deleted ?
                                        <></>
                                        :
                                        <div className="option-control-chat-block">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="chat-user-three-dots" viewBox="0 0 16 16" onClick={() => this.userChatControl(index)}>
                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                            </svg>
                                            {msg.control ?
                                            <div className="option-control-chat-block-friend" onClick={() => this.hideMessageConfirm(msg.message_id.toString(), index, msg.m_room_id.toString())}>
                                                Hide
                                            </div>
                                            :
                                            null
                                            }
                                        </div>
                                        }
                                    </div>
                                    {msg.control ? 
                                    <div className="unclick-control-container" onClick={this.unClickContainer}></div>
                                    :
                                    null
                                    }
                                </div>
                            ))}    
                            
                        </div>

                        {this.state.chatContainer.userRoomStatus === "Active" || this.state.chatContainer.userRoomStatus === "friended" ?
                        <div className="message-input-container" >
                            <textarea ref={this.textBox} onKeyUp={(e) => this.textBoxExpand(this.textBox, e, this.state.chatContainer.chat_id)}></textarea>
                            <div className="message-option-btn-container">
                                <div className="message-btn" onClick={() => this.buttonMessage(this.textBox, this.state.chatContainer.chat_id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="message-send" viewBox="0 0 16 16">
                                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
                                    </svg>
                                </div>
                                <label style={{display: "flex"}} htmlFor="m-media">
                                    <div className="message-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="message-image" viewBox="0 0 16 16">
                                            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                        </svg>
                                    </div>
                                </label>
                                <input type="file" accept="image/*, video/*" hidden id="m-media" ref={this.fileInput} onChange={this.blobFile}/>
                            </div>
                        </div>
                        :
                        this.state.chatContainer.userRoomStatus === "removed" || this.state.chatContainer.userRoomStatus === "exit group" ?
                        <div className="message-input-container-no-longer">
                            <div className="notice-no-longer-block">
                                <span>You are no longer belong to this group.</span>
                            </div>
                        </div>
                        :
                        this.state.chatContainer.userRoomStatus === "none" || this.state.chatContainer.userRoomStatus === "pending"?
                        <div className="message-input-container-no-longer">
                            <div className="notice-no-longer-block">
                                <span>You are no longer friend with this user.</span>
                            </div>
                        </div>
                        :
                        this.state.chatContainer.userRoomStatus === "blocked" ?
                            this.state.chatContainer.friendAction === "blocking" ?
                            <div className="message-input-container-no-longer">
                                <div className="notice-no-longer-block">
                                    <span>You blocked this user.</span>
                                </div>
                            </div>
                            :
                            <div className="message-input-container-no-longer">
                                <div className="notice-no-longer-block">
                                    <span>You got blocked by this user.</span>
                                </div>
                            </div>
                        :
                        <div className="message-input-container-no-longer">
                            <div className="notice-no-longer-block">
                                <span>This group has disbanded.</span>
                            </div>
                        </div>
                        }

                        
                        
                    </div>
                    }


                </div>
            );
        }
    }
}