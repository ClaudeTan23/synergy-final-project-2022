export namespace CommentModel
{
    export interface Comment
    {
        cid          : string,
        post_id      : string,
        postUserId   : string,
        commentUserId: string,
        content      : string,
        media        : string,
        time         : string,
        comment_status       : string
    }
}