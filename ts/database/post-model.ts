export namespace PostModel
{
    export interface Post  
    {
        post_id       : string,
        user_Id       : string,
        content       : string,
        media         : string,
        total_likes   : number,
        total_comments: number,
        date_posted   : string,
        post_status   : string
    }
}