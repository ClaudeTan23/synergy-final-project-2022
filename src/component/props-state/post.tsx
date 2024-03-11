import { NavigateFunction } from "react-router-dom";

export namespace PostPropState
{
    export interface Props 
    {
        Navigate    : NavigateFunction,
        cookie      : any,
        setCookie   : any,
        removeCookie: any,
        Location    : any,
        postId      : any,
        // MYId      : any,
    }

    export interface State 
    {
        sideBarButton     : boolean,
        sideBar           : boolean,
        post              : Array<any>,
        darkToggle        : boolean,
        postToggle        : boolean,
        blobPostMedia     : Array<{ blob: string, type: string, file: File }>,  
        postBtnActive     : boolean,
        overSizeMedia     : boolean,
        serverErrorPost   : boolean,
        postSuccess       : boolean,
        id                : string,
        name              : string,
        userIcon          : string,
        viewImageContainer: boolean,
        viewImageArray    : Array<string>,
        viewImgLeftBtn    : boolean,
        viewImgRightBtn   : boolean,
        viewIndexImage    : number,
        username          : string,
        homePath          : boolean,
        onlineStatus      : boolean,
        noticeFriend      : number,
        noticeMessage     : number,
        notification      : number,
        notificationData  : Array<any>,
        noticeFriendData  : Array<any>,
        noticeMessageData : Array<any>,
        toggleNotification: boolean,
        toggleNoticeFriend: boolean,
        toggleNoticeMsg   : boolean,
        postLoader        : boolean,
        noMorePost        : boolean,
        fisrtPostLoaded   : boolean,
        loadMessage       : boolean,
        fRequestData      : Array<any>,
        closePostControl  : any,
        closeComment      : any
        deletePostConfirm : any,
        reportPostConfrim : any,
        deleteConConfirm  : any,
        reportConConfirm  : any,
        reportNotice      : boolean
        searchPostLoader  : boolean,
        searchPostData    : Array<any>,
        searchPostToggle  : boolean,
        searchPostBlock   : boolean,
        searchPostEmpty   : boolean,
        friendStatus      : undefined | any,
        friendAction      : undefined | any,
        commentOverSize   : boolean,
        commentWrongFormat: boolean,
        commentError      : boolean,
        postUploadLoader  : boolean,
    }
}