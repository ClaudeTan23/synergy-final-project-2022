export namespace Model 
{
    export interface User 
    {
        id              : string,
        username        : string,
        password        : string,
        forget_password : string,
        name            : string,
        profile         : string,
        background      : string,
        gender          : string,
        email           : string,
        confirmationCode: string,
        status          : string,
        darkmode        : string,
        date_join       : string,
        position        : string,
        online_status   : string,
    }
}