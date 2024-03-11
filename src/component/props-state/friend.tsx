import { NavigateFunction } from "react-router-dom"

export namespace FriendPropState
{
    export interface Props
    {
        Navigate    : NavigateFunction,
        cookie      : any,
        setCookie   : any,
        removeCookie: any,
        Location    : any,
        clientSocket: any,
        userId      : undefined | string
    }

    export interface State 
    {
        animationContainer  : string,
        myFriends           : Array<any> | undefined,
        myFriendsLoader     : boolean,
        requestsFriend      : Array<any> | undefined,
        requestsFriendLoader: boolean,
        newFriends          : Array<any> | undefined,
        newFriendLoader     : boolean,
        blockedUsers        : Array<any> | undefined,
        blockUsersLoader    : boolean,
        confirmationBlock   : boolean,
        confirmationType    : string, 
        friendRequestAnimate: boolean,
        friendSentAnimate   : boolean,
        totalFriends        : number,
        totalFriendRequests : number,
        totalSentRequests   : number,
        totalBlockedUsers   : number
    }
}