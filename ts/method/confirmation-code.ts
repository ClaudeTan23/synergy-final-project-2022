export namespace ConfirmationNumber
{
    export class Code 
    {
        private randomString: string = "abcdefghijklmnopqrstuvwxyz";
        private randomInteger: string = "1234567890";
        private confirmCodeLength: number = 16;
        private confirmCode: string = "";
        

        
        Output(): string
        {
            for(let i:number = 0; i < this.confirmCodeLength; i++)
            {
                const gamble: number = Math.floor((Math.random() * 4) + 1);

                if(gamble > 2)
                {
                    const Num = Math.floor((Math.random() * this.randomString.length));
                    this.confirmCode += this.randomString[Num];

                } else 
                {
                    const Num = Math.floor((Math.random() * this.randomInteger.length));
                    this.confirmCode += this.randomInteger[Num];
                }
            }

            return this.confirmCode;
        }
    }
}