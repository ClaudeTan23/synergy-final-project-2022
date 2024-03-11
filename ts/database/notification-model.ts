export namespace NotificationModel
{
    interface Notification 
    {
        n_id          : string,
        request_userId: string,
        receive_userId: string,
        type          : string,
        n_content     : string,
    }
}