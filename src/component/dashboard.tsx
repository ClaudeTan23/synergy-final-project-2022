import React, { useEffect, createRef, useState, SVGProps, LegacyRef } from "react";
import { useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import * as dotenv from "dotenv";
import  { Cookies, useCookies }  from "react-cookie";
import { Link, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import { DashboardPropsState } from "./props-state/dashboard.tsx";
import "../css/dashboard.css";
import { Chart, registerables} from "chart.js";

class Body extends React.Component<DashboardPropsState.Props, DashboardPropsState.State>
{
    private chartContainer: React.RefObject<HTMLCanvasElement>;
    private textAreaContainer: React.RefObject<HTMLTextAreaElement>;
    private mediaInput: React.RefObject<HTMLInputElement>;
    private LOAD: boolean = false;
    private AdminId: any;
    private socketClient: any = undefined;
    private mediaFile: Array<any> = [];

    constructor(props)
    {
        super(props);

        this.state =
        {
            noEmptyText: false,
            blobMedia  : [],
            uploadActive: false,
        }

        this.chartContainer    = createRef();
        this.textAreaContainer = createRef();
        this.mediaInput        = createRef();
        
        this.mediaInputChanged = this.mediaInputChanged.bind(this);
        this.textAreaEvent     = this.textAreaEvent.bind(this);
        this.deleteBlob        = this.deleteBlob.bind(this);
        this.closeUploadBlock  = this.closeUploadBlock.bind(this);

    }

    componentDidMount(): void 
    {
        if(!this.LOAD) 
        {
            this.LOAD = true;

                if(this.props.cookie.aconnecti !== undefined && this.props.cookie.aconnecti !== "")
                {
                    this.socketClient = io(`${process.env.REACT_APP_API_URL}`, {
                                        withCredentials: true,
                                        extraHeaders: { "cors-socket-headers": "meow" },
                                        transports: ["websocket"],
                                        upgrade: false
                                    });;

                    this.webSocket();

                }
            
        }
    }

    webSocket(): void 
    {
         // when user connect online
            this.socketClient.on("connect", (): void =>
            {
                const CSRF = async (): Promise<void> => 
                    {
                        const key: string = encodeURIComponent(this.props.cookie.aconnecti.toString());
                        const promise = await fetch(`${process.env.REACT_APP_API_URL!}/adminu?u=${key}`);


                        if(promise.ok)
                        {
                            const result: { result: boolean, p: boolean, ct: string | undefined, i: string, name: string, icon: string, username: string } = await promise.json();

                            if(result.result === true && result.ct !== "" && result.ct !== undefined)
                            {

                                // this.setState(() => ({ id: result.i, name: result.name, userIcon: result.icon, username: result.username, onlineStatus: true, homePath: (this.props.Location.pathname === "/") }));
                                // this.fetchNoticeFriend();
                                // this.fetchPost();
                                // this.windowScrollEvent();
                                // this.fetchChatNum();

                                // this.fetchChartData();

                                // this.socketClient.emit("userId", result.i.toString());
                                console.log(this.socketClient.id);
                                // this.homePath = (this.props.Location.pathname === "/");
                                // this.currentPath = this.props.Location.pathname;

                                this.AdminId = result.i.toString();

                            }

                        } else 
                        {
                            CSRF();
                            console.log("status network error");
                        }
                    }

                    CSRF();

                // console.log(this.socketClient.id);
               
            });

            // when user disconnected
            this.socketClient.on("disconnect", (): void => 
            {

                if(this.AdminId !== undefined)
                {
                    this.socketClient.emit("a", this.AdminId);
                }

            });

            this.socketClient.on("auth", (result: string): void => 
            {
                console.log(result);

            });

    
    }

    textAreaEvent(input: React.RefObject<HTMLTextAreaElement>): void 
    {
        input.current!.style.height = "";
        const limit: number = Math.min(150, Number(input.current!.scrollHeight) - 20);
        input.current!.style.height = `${limit}px`;

        if(input.current?.value.trim() !== "" || this.state.blobMedia.length > 0)
        {
            this.setState(() => ({ noEmptyText: true }));

        } else if(input.current?.value.trim() === "" && this.state.blobMedia.length === 0)
        {
            this.setState(() => ({ noEmptyText: false }));
        }
    }

    mediaInputChanged(input: React.RefObject<HTMLInputElement>): void
    {
        const files: any = input.current?.files;
        const blobFiles: any = this.state.blobMedia;

        if(files.length !== 0)
        {
            for(let i = 0; i < files.length; i++)
            {
                blobFiles.push({ blob: URL.createObjectURL(files[i]), file: files[i], type: files[i].type.split("/")[0] });
            }

            this.setState(() => ({ blobMedia: blobFiles }));
        }

        if(this.textAreaContainer.current?.value.trim() !== "" || this.state.blobMedia.length > 0)
        {
            this.setState(() => ({ noEmptyText: true }));

        } else if(this.textAreaContainer.current?.value.trim() === "" && this.state.blobMedia.length === 0)
        {
            this.setState(() => ({ noEmptyText: false }));
        }

        input.current!.value = "";
    }

    deleteBlob(index: number): void 
    {
        const blobUrl: string = this.state.blobMedia[index].blob;
        const blobArray: Array<any> = this.state.blobMedia;

        URL.revokeObjectURL(blobUrl);

        blobArray.splice(index, 1);

        if(this.textAreaContainer.current?.value.trim() !== "" || this.state.blobMedia.length > 0)
        {
            this.setState(() => ({ noEmptyText: true }));

        } else if(this.textAreaContainer.current?.value.trim() === "" && this.state.blobMedia.length === 0)
        {
            this.setState(() => ({ noEmptyText: false }));
        }

        this.setState(() => ({ blobMedia: blobArray }));
    }

    closeUploadBlock(): void 
    {
        const blobArray: Array<any> = this.state.blobMedia;

        for(let i = 0; i < blobArray.length; i++)
        {
            URL.revokeObjectURL(blobArray[i].blob);
        }

        this.setState(() => ({ uploadActive: false, blobMedia: [], noEmptyText: false }));
    }

    // fetchChartData(): void 
    // {
    //     const data = [
    //                         { year: 2010, count: 10 },
    //                         { year: 2011, count: 20 },
    //                         { year: 2012, count: 15 },
    //                         { year: 2013, count: 25 },
    //                         { year: 2014, count: 22 },
    //                         { year: 2015, count: 30 },
    //                         { year: 2016, count: 28 },
    //                     ];

    //                     Chart.register(...registerables);

          
    //                         new Chart(this.chartContainer?.current,
    //                         {
    //                             type: "line",
    //                             data: 
    //                             {
    //                                 labels: data.map(e => e.year),
    //                                 datasets: 
    //                                 [
    //                                     {
    //                                         label: "Monthly Total Report",
    //                                         data: data.map(e => e.count),
    //                                         fill: false,
    //                                         borderColor: '#E1E4EC',
    //                                         backgroundColor: "#1334E1",
    //                                         fontColor: "#E1E4EC",
    //                                         tension: 0.1,
    //                                         pointBorderWidth: 10,
    //                                         pointBorderColor: "#1334E1",
    //                                     }
    //                                 ]  
    //                             },
    //                             options: 
    //                             {   
    //                                 plugins:
    //                                 {
    //                                     legend:
    //                                     {
    //                                         labels:
    //                                         {
    //                                             color: "#E1E4EC",
    //                                             font: {
    //                                                 size: 20
    //                                             }
    //                                         }
    //                                     },
    //                                 },
    //                                 scales: 
    //                                 {
    //                                     x: 
    //                                     {
    //                                         grid: 
    //                                         {
    //                                             color: "#E1E4EC",
    //                                         },
    //                                         ticks: 
    //                                         {
    //                                             color: "#E1E4EC",
    //                                             font:
    //                                             {
    //                                                 size: 16
    //                                             }
    //                                         }
    //                                     },
    //                                     y: 
    //                                     {
    //                                         grid: 
    //                                         {
    //                                             color: "#E1E4EC",
    //                                             borderColor: 'green'
    //                                         },
    //                                         ticks: 
    //                                         {
    //                                             color: "#E1E4EC",
    //                                             font:
    //                                             {
    //                                                 size: 16
    //                                             }
    //                                         }
    //                                     }
    //                                 },
    //                                 animations: {
    //                                 tension: {
    //                                     duration: 1000,
    //                                     easing: 'easeInOutElastic',
    //                                     from: 1,
    //                                     to: 0,
    //                                     loop: true
    //                                 }
    //                                 },
    //                             },
    //                         });
    // }

    render(): JSX.Element
    {
        return (
            <div className="main-admin-dashboard-container">
                <div className="dashboard-header-block">
                    <div>
                        Social Connect
                        <span className="admin-logo">Admin</span>
                    </div>
                    <div>
                        <div className="admin-border-container">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="three-dots-vertical" viewBox="0 0 16 16">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            </svg>
                            <div className="dropdown-admin-icon-block">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="gear" viewBox="0 0 16 16">
                                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                                    </svg>
                                    <span>Setting</span>
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="box-arrow-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                    </svg>
                                    <span>Log out</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="modal-all-report-container">
                    <div className="close-modal-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="x-square" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </div>

                    <div className="model-report-block">
                        <div className="model-report-header">
                            <span>Post Reports</span>
                        </div>
                        <div className="select-btn-block">
                            <select>
                                <option>Recently</option>
                                <option>Most Reported</option>
                            </select>
                        </div>

                        <div className="model-report-body">

                            <div className="user-report-block">
                                <svg viewBox="0 0 100 100" width="50" height="50">
                                    <title>asd</title>
                                    <defs>
                                        <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                        <clipPath id="circle-clip">
                                        <use xlinkHref="#circle"/>
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#circle-clip)">
                                        <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/blankpf.jpg`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                        <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                    </g>
                                </svg>

                                <div className="user-report-name-block">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum molestias et atque facere neque similique corporis dolorem minima, sapiente voluptates nihil, nemo esse non sequi eligendi magnam placeat harum reprehenderit?</div>
                                <div className="total-report-block">
                                    <span>99</span>
                                </div>

                            </div>

                            <div className="report-loader">
                                <div></div>
                            </div>
                                            
                                            
                        </div>
                    </div>

                </div> */}

                {/* <div className="modal-all-report-container">
                    <div className="close-modal-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="x-square" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </div>

                    <div className="model-report-block">
                        <div className="model-report-header">
                            <span>Banned Users</span>
                        </div>
                        <div className="select-btn-block">
                            <input type="text" autoComplete="false" placeholder="Search banned user..."/>
                        </div>

                        <div className="model-report-body">

                            <div className="user-report-block">
                                <svg viewBox="0 0 100 100" width="50" height="50">
                                    <title>asd</title>
                                    <defs>
                                        <circle id="circle" cx="50" cy="50" r="49" vectorEffect="non-scaling-stroke"/>
                                        <clipPath id="circle-clip">
                                        <use xlinkHref="#circle"/>
                                        </clipPath>
                                    </defs>
                                    <g clipPath="url(#circle-clip)">
                                        <image xlinkHref={`${process.env.REACT_APP_API_URL}/media/blankpf.jpg`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
                                        <use xlinkHref="#circle" fill="none" stroke="#0F1C3F" strokeWidth="2" opacity="0.25"/>
                                    </g>
                                </svg>

                                <div className="banned-user-report-name-block">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum molestias et atque facere neque similique corporis dolorem minima, sapiente voluptates nihil, nemo esse non sequi eligendi magnam placeat harum reprehenderit?</div>
                                <div className="unban-user-btn">
                                    <span>Unban</span>
                                </div>

                            </div>

                            <div className="report-loader">
                                <div></div>
                            </div>
                                            
                                            
                        </div>
                    </div>

                </div> */}

                {this.state.uploadActive ?
                <div className="modal-all-report-container">
                    <div className="close-modal-btn" onClick={this.closeUploadBlock}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="x-square" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </div>

                    <div className="admin-post-form-container">
                        <div className="admin-post-form-header">
                            <span>Announcement to all users</span>
                        </div>
                        <div className="admin-form-text-area">
                            <textarea placeholder="Write an announcement..." ref={this.textAreaContainer} onInput={() => this.textAreaEvent(this.textAreaContainer)}></textarea>
                        </div>
                        
                        {this.state.blobMedia.length !== 0 ?
                        <div className="admin-form-media-container">
                            {this.state.blobMedia.map((e, i, a) => 
                            (
                            <div key={`blob-${i}`}>
                                {e.type === "image" ?
                                <img src={e.blob} />
                                :
                                <video src={e.blob}></video>
                                }
                                <div onClick={() => this.deleteBlob(i)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="comment-blob" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div>
                            </div>
                            ))}
                            
                        </div>
                        :
                        <></>
                        }

                        <div className="admin-form-media-input-container">
                            <label htmlFor="admin-media-post" className="admin-form-images-input">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="admin-post-images" viewBox="0 0 16 16">
                                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z"/>
                                    </svg>
                                </div>
                            </label>
                            <input id="admin-media-post" type="file" hidden={true} multiple={true} accept="image/*, video/*" ref={this.mediaInput} onChange={() => this.mediaInputChanged(this.mediaInput)}/>
                        </div>

                        <div className="admin-form-submit-container">
                            <div className={this.state.noEmptyText ? "admin-form-submit-btn active" : "admin-form-submit-btn"} >
                                <span>Post</span>
                             </div>
                        </div>
                    </div>


                </div>
                :
                <></>
                }

                <div className="admin-body-container">
                    <div className="user-report-container">
                        <div>Banned Users</div>
                        <div>Post Reports</div>
                        <div>Comment Reports</div>
                    </div>

                    <div className="post-form-submit-admin">
                        <div className="submit-container-admin" onClick={() => this.setState(() => ({ uploadActive: true }))}>
                            <span>Sent Announcement</span>
                        </div>
                    </div>

                    <div className="post-form-admin-media-container">
                        
                    </div>

                    {/* <div className="chart-container">
                        <canvas ref={this.chartContainer}></canvas>
                    </div> */}

                </div>


                {/* <div className="announcement-header-block">
                    <div>Announcement</div>
                </div> */}

                <div className="announcement-post-container">
                    <div className="announcement-header">
                        <span>Announcement</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                        <div className="announcement-control-block">
                            <span>Delete</span>
                            <span>Cancel</span>
                        </div>
                    </div>
                    <div className="announcement-content-block">
                        <div>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident itaque temporibus quidem placeat eius quia, consequatur quas tenetur qui maxime sint sapiente, quae neque fugiat dolorum incidunt amet perspiciatis impedit.
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident itaque temporibus quidem placeat eius quia, consequatur quas tenetur qui maxime sint sapiente, quae neque fugiat dolorum incidunt amet perspiciatis impedit.
                        </div>
                    </div>
                    <div className="admin-media-container">
                        <div className="admin-media-block ">
                            <img src={`${process.env.REACT_APP_API_URL}/media/blankbg.jpg`}/>
                        </div>
                        <div className="admin-media-block-p">
                            <img src={`${process.env.REACT_APP_API_URL}/media/blankbg.jpg`}/>
                        </div>
                        <div className="admin-media-block-p">
                            <img src={`${process.env.REACT_APP_API_URL}/media/blankbg.jpg`}/>
                            <div className="admin-media-block-additional">+1</div>
                        </div>
                    </div>
                    <div className="announcement-footer-time">
                        <span>2w</span>
                    </div>
                </div>

                {/* <div className="no-more-announcement-container">
                    <div>No more previous announcement</div>
                </div> */}
                

                {/* <div className="admin-view-image-container">
                    <div className="admin-close-view-container-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="admin-view-img-cancel" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                        </svg>
                    </div>
                    <div className="admin-view-image-block">
                        <div className="admin-view-container-left-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="admin-arrow-left-view" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z"/>
                            </svg>
                        </div>
                        <img src={`${process.env.REACT_APP_API_URL}/media/blankbg.jpg`}/>
                        <div className="admin-view-container-right-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="admin-arrow-right-view" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8Zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5Z"/>
                            </svg>
                        </div>
                    </div>
                </div> */}

                {/* <div className="admin-delete-post-confrim-block">
                    <div className="admin-delete-post-block">
                        <div>
                            <span>Delete this announcement?</span>
                        </div>
                        <div>
                            <div>Delete</div>
                            <div>Cancel</div>
                        </div>
                    </div>
                </div> */}


                {/* <div className="announcement-post-container-empty">
                    <span>Didn't have any announcement yet</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="cloud" viewBox="0 0 16 16">
                        <path d="M13.405 4.277a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10.25H13a3 3 0 0 0 .405-5.973zM8.5 1.25a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1-.001 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4.002 4.002 0 0 1 8.5 1.25zM2.625 11.5a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25zm2.75 2a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25zm5.5 0a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25zm-2.75-2a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25zm5.5 0a.25.25 0 0 1 .25.25v.57l.501-.287a.25.25 0 0 1 .248.434l-.495.283.495.283a.25.25 0 0 1-.248.434l-.501-.286v.569a.25.25 0 1 1-.5 0v-.57l-.501.287a.25.25 0 0 1-.248-.434l.495-.283-.495-.283a.25.25 0 0 1 .248-.434l.501.286v-.569a.25.25 0 0 1 .25-.25z"/>
                    </svg>
                </div> */}
                
            </div>
        )
    }
}

export function Dashboard(): JSX.Element
{
    let LOAD: boolean = false;
        const location: Location = useLocation();
        const [cookie, setCookies, removeCookie] = useCookies();
        const navigate: NavigateFunction = useNavigate();

        useEffect((): void =>
        {
            if(!LOAD)
            {
                LOAD = true;

                if(cookie.aconnecti !== undefined && cookie.aconnecti !== "")
                {
                    const CSRF = async (): Promise<void> => 
                    {
                        const key: string = encodeURIComponent(cookie.aconnecti.toString());
                        const promise = await fetch(`${process.env.REACT_APP_API_URL!}/adminu?u=${key}&s=s`);

                        if(promise.ok)
                        {
                            const result: { result: boolean, p: boolean, ct: string | undefined } = await promise.json();

                            if(result.result === true && result.ct !== "" && result.ct !== undefined)
                            {
                                console.log(true);

                            } else 
                            {
                                console.log(false);
                                removeCookie("aconnecti", { path: "/" });
                                navigate("/admin/login");
                            }   

                        } else 
                        {
                            CSRF();
                            console.log("status network error");
                        }
                    }

                    CSRF();

                } else 
                {
                    removeCookie("aconnecti", { path: "/" });
                    navigate("/admin/login");
                }

            }
        }, []);

        return (
            <Body Navigate={navigate} cookie={cookie} setCookie={setCookies} removeCookie={removeCookie} Location={location} />
        );
}