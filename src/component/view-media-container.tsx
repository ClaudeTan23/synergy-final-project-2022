import React, { useEffect, useState } from "react";

export namespace ViewContainer
{
    interface ImageProps 
    {
        media: Array<string>,
        index: number,
        s: any
    }

    // export function ImageContainer(containerOpen): JSX.Element
    // {
    //     const [container, setContainer] = useState(containerOpen);
    //     let load = false
    //     useEffect(() => {
    //         if(!load)
    //         {
    //             load = true;
    //             console.log(containerOpen);
    //         }
    //     })
        
    //     return (
    //         <div onClick={() => { setContainer(false); console.log(containerOpen) }}>asd</div>
    //     );
    // }

    export class ImageContainer extends React.Component<{ containerOpen: boolean }, { container: boolean }>
    {
        constructor(props)
        {
            super(props);

            this.state = 
            {
                container: this.props.containerOpen
            }

            console.log(this.props.containerOpen);
        }
        render()
        {
            return (
                <div onClick={() => this.setState(() => ({ container: false }))}>asdd</div>
            );
        }
    }
}