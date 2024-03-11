export namespace RegisterPropsState
{
    export interface Props
    {
        Location: string
    }

    export type State =
    {
        // username : string,
        // password : string,
        // rPassword: string,
        // email    : string,
        cUsername : boolean | null | string,
        cPassword : boolean | null,
        cRPassword: boolean | null,
        cEmail    : boolean | null,
        verifying : boolean,
        resent    : boolean,
        invalid   : boolean,
        mailLoader: boolean,
        sendemail : boolean,
    }
}