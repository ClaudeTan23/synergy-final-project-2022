export namespace txtGenerator 
{
    export function Main(): string 
    {
        const txt: string = "abcdefghijklmnopqrstuvwxyz";
        let rText: string = "";

        for(let i = 0; i < txt.length; i++)
        {
            rText += txt[Math.floor(Math.random() * txt.length)];
        }

        return rText;     
    }
}