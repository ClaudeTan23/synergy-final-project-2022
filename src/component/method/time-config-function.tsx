export namespace TimeDate 
{
    export const Run = (date: string): { totalDate: string, calculatedTime: string } => 
    {
        const splitDate: Array<string> = date.split("/");
        const dateArray: Array<string> = splitDate[0].split("-");
        const timeString: string = splitDate[1];
        let hour: string | number = "";
        let min : string | number = "";
        let timeFormat: string = "";
        let distance: string | number = "";
        
        const month: Array<string> = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

        const postTime: any = new Date(`${month[Number(dateArray[1]) - 1]} ${dateArray[0]} ${dateArray[2]} ${timeString}`);

        const timeNow: any = new Date().getTime();
        const timeDistance: any = timeNow - postTime;

        const weeks = Math.floor(timeDistance / (1000 * 60 * 60 * 168));
        const days = Math.floor(timeDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDistance % (1000 * 60 * 60)) / (1000 * 60));

        min  = timeString.split(":")[1].length === 1 ? "0" + timeString.split(":")[1] : timeString.split(":")[1];
        hour = Number(timeString.split(":")[0]) > 12 ? Number(timeString.split(":")[0]) - 12 : timeString.split(":")[0];
        timeFormat = Number(timeString.split(":")[0]) > 12 ? "PM" : "AM"
        
        if(Number(hour) === 0)
        {
            hour = 12;
        }

        if(weeks > 0)
        {
            distance = `${weeks}w`;

        } else if(days > 0)
        {
            distance = `${days}d`;

        } else if(hours > 0)
        {
            distance = `${hours}h`;

        } else if(minutes > 0) 
        {
            distance = `${minutes}m`;
        }
        
        const completedTime: string = `${hour}:${min}${timeFormat}`;

        return { totalDate: `${dateArray.join("-")},${completedTime}`, calculatedTime: (distance !== "" ? distance : "0m") }
    }
}