import { Server } from "socket.io";
import { ServerOptions } from "http";
import * as env from "dotenv";
import { Pool } from "mysql2";

export namespace HomeSocket
{
    export class Main
    {
        public socket: any;
        public IO: any;
        private conn: Pool;

        constructor(http: any, conn: Pool)
        {
            env.config();

            this.IO = new Server(http, 
            {
              cors: {
                origin: process.env.CORS_URL?.split(","),
                credentials: true,
                allowedHeaders: ["cors-socket-headers"],
              },
            });

            this.IO.on("connection", (socket: any): void => this.RunSocket(socket));
            this.conn = conn;
            
        }

        private RunSocket(socket: any): void 
        {

            this.socket = socket;

            socket.on("userId", (id: string): void => 
            {
            // join own id room
              // socket.join(id);
              
              // console.log(socket.rooms);

              setTimeout((): void => 
              {
                this.IO.to(id).emit("auth", "success");

              }, 2000);
            });

            socket.on("userIdMessage", (userId: any): void =>
            {
                                    this.conn.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?", [userId, "Active"], (e, re, f): void =>
                                    {
                                        if(!e)
                                        {
                                            // clientSocket.IO.in(clientSocket.socket.id).socketsLeave("room41");
                                           
                                                let roomId: Array<any> = JSON.parse(JSON.stringify(re));

                                                const rId: Array<any> = roomId;

                                                roomId = roomId.map(e => `room${e.um_roomId}`);
                                                
                                                socket.join(roomId);

                                                socket.join(userId);

                                                console.log(socket.id + "/")

                                        } else 
                                        {
                                          console.log("error");
                                        }

                                        
                                        
                                    });
            });

            socket.on("msg", (e: any) => console.log(e));

            socket.on("disconnecting", (e: any): void => 
            {
              this.Disconnected(socket.clientUserId);
              // console.log(socket.clientUserId + " + " + socket.id);
            });

            socket.on("a", (clientSideUserId: any): void => 
            {
              console.log("asd")
              // console.log(clientSideUserId + " + " + socket.id);
            });

            socket.on("t", (clientSideUserId: any): void => 
            {
              this.Disconnected(clientSideUserId);
              // console.log(clientSideUserId + " + " + socket.id);
            });

            socket.on("join-new-group", (newGroup: any): void =>
            {
              socket.join(newGroup.roomId);
            });

            socket.on("join-new-friend-chat", (newFriendChat: any): void =>
            {
              socket.join(newFriendChat.roomId);
            });

            socket.on("join-group-room", (joinGroupRoom: any): void =>
            {
              socket.join(`room${joinGroupRoom.roomId}`);
              console.log(`room${joinGroupRoom.roomId}`);
            });

            socket.on("leave-room", (roomId: any): void =>
            {
              socket.leave(`room${roomId}`);
              console.log("leave")
  
            });

            socket.on("exit-room", (roomId: any): void =>
            {
              socket.leave(`room${roomId}`);
              console.log("leave")
  
            });

            socket.on("fetchMsgNum", (bool: any): void =>
            {
              socket.emit("refreshMsgNum", true);
            });
        }

        private Disconnected(userId: string): void 
        {

          if(userId === "" || userId === undefined || userId === null)
          {
            return;
          }
       
                this.conn.execute("UPDATE user SET socket_exist = socket_exist- ? WHERE id = ?", [1, userId], (err, result, field): void =>
                {

                  if(!err)
                  {
                    console.log(userId);
                    this.conn.execute("SELECT * FROM user WHERE id = ?", [userId], (e, r, f): void => 
                    {
                      const socketExist: Array<any> = JSON.parse(JSON.stringify(r));

                      if(socketExist[0].socket_exist <= 0)
                      {
                          this.conn.execute("SELECT um_roomId FROM user_message_room WHERE um_userId = ? AND um_status = ?",[userId, "Active"], (error, results, fields): void =>
                          {
                            if(!error)
                            {
                              const roomOff: Array<any> = JSON.parse(JSON.stringify(results));

                              if(socketExist[0].socket_exist <= 0)
                              {
                                this.conn.execute("UPDATE user SET socket_exist = ?, online_status = ? WHERE id = ?", [0, "off", userId], (ee, rr, ff): void =>
                                {
                                  if(!ee)
                                  {
                                    this.IO.to(roomOff.map(e => `room${e.um_roomId}`)).emit("group-off", roomOff.map(e => e.um_roomId.toString()));

                                  } else 
                                  {
                                    console.log("disconnect socket update offline database error");
                                  }

                                });
                                
                              }

                            } else 
                            {
                              console.log("disconnect socket offline database error");
                            }
                          });
                        

                      }

                    });

                  } else 
                  {
                    console.log("disconnect socket update database error");
                  }

                });
          
        }
    }
}