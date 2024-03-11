import { NavigateFunction } from "react-router-dom"

export namespace MessagePropsState 
{
    export interface Props 
    {
        Navigate    : NavigateFunction,
        cookie      : any,
        setCookie   : any,
        removeCookie: any,
        Location    : any,
        clientSocket: any,
        userId      : string | undefined,
        scrollBlock : any
    }

    export interface State 
    {
        createNewChat        : boolean,
        chatList             : Array<any>
        createGroup          : boolean,
        createFriend         : boolean,
        membersLoader        : boolean,
        groupMembers         : boolean,
        groupMemberList      : Array<any>,
        groupSeletedMembers  : Array<any>,
        friendMembers        : boolean,
        friendMemberList     : Array<any>
        friendSelectedMembers: Array<any>,
        checkGroup           : boolean,
        checkGroupMember     : boolean,
        checkFriend          : boolean
        chatIntro            : boolean,
        chatListLoader       : boolean,
        chatContainer        : any,
        fetchOldChatloader   : boolean,
        noMoreOldChat        : boolean,
        DeleteFriendMsgList  : boolean,
        DeleteGroupMsgList   : boolean,
        viewMembersContainer : boolean,
        cancelViewMembers    : boolean,
        MembersContainer     : undefined | Array<any>,
        BlobImageUploader    : undefined | any,
        BlobType             : undefined | string,
        imgString            : undefined | string
        addMembersContainer  : boolean,
        addGroupMembers      : Array<any> | undefined
        addMembersLoader     : boolean,
        removeConfirmation   : undefined | any,
        disbandConfirmation  : boolean,
        exitConfirmation     : boolean,
        messagePath          : boolean,
        recallWarning        : boolean,
        hideWarning          : any,
        uploadingMedia       : boolean,
        overSize             : boolean,
    }
}