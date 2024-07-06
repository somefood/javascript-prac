import http from "http";
import {Server} from "socket.io";
import express, {Request, Response} from 'express';
import RoomInfo from "./roomInfo";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

function initRoomMaps() {
    let map = new Map<string, RoomInfo>();
    map.set('10017612', {
        ownerId: "10017612",
        guestId: "",
        roomId: "0c8b6d06-e15f-4ee1-9261-7172e1f1f437",
        roomName: "오목 고수만~~",
        participants: ["10017612", "10017676"],
        status: "playing"
    });
    map.set('10017613', {
        ownerId: "10017613",
        guestId: "",
        roomId: "92315b4d-03f1-4b73-b6ff-4aeea324f626",
        roomName: "오목 초보만~~",
        participants: ["10017613", null],
        status: "ready"
    })

    map.set('10017614', {
        ownerId: "10017614",
        guestId: "",
        roomId: "4516fcf8-b188-409a-ac78-f82cf0860c41",
        roomName: "오목 아무나~@@@",
        participants: ["10017614", null],
        status: "ready"
    })

    map.set('10017615', {
        ownerId: "10017615",
        guestId: "",
        roomId: "2c9d0640-bfd0-4b5b-b084-938dcacc9246",
        roomName: "오목 고수만~~@#@#@#",
        participants: ["10017615", null],
        status: "ready"
    })
    return map;
}

function findRoomInfoByName(roomId: string): RoomInfo | null {
    for (let [key, roomInfo] of roomMap) {
        if(roomInfo.roomId === roomId) {
            return roomInfo;
        }
    }
    return null;
}

const roomMap = initRoomMaps();

const app = express();
app.use(express.json());
app.use(cors());


const port = 9090;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

app.get('/rooms', (req: Request, res: Response) => {
    let roomList = Array.from(roomMap, ([name, roomInfo]) => ({
        roomName: roomInfo.roomName,
        roomId: roomInfo.roomId,
        status: roomInfo.status
    }));
    return res.json(roomList);
});

app.post('/rooms', (req: Request, res: Response) => {

    const {username, roomName} = req.body;
    
    const roomInfo: RoomInfo = {
        ownerId: username,
        roomName: roomName,
        roomId: uuidv4(),
        participants: [username, null],
        status: 'ready'
    }

    roomMap.set(username, roomInfo);

    return res.status(200).json(roomInfo);
});

const httpServer = http.createServer(app);
const ws = new Server(httpServer);

ws.on("connection", (socket) => {
    socket.on("join_room", (roomId, guestId) => {
        console.log(roomId);
        let findRoom = findRoomInfoByName(roomId);
        if (findRoom) {
            findRoom.guestId = guestId;
            findRoom.participants[1] = guestId;
            socket.join(roomId);
            socket.to(roomId).emit("chat", `${socket.id} 님이 접속했습니다.`);
        }
    });

    socket.on('put', (roomId, position) => {
        socket.to(roomId).emit('put', {
            omokX: position.omokX, 
            omokY: position.omokY
        });
    })
    
    socket.on('chat', (message, roomId) => {
       socket.to(roomId).emit('chat', message);
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName)=> {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });

    // socket.on("disconnect", (reason) => {
    //     socket.broadcast.emit("chat", `${socket.id} 님의 연결이 끊어졌습니다.`);
    // });

    socket.on("disconnecting", (reason) => {
        console.log(reason);
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.to(room).emit('chat', `${socket.id} user has left`);
            }
        }
    });
});

httpServer.listen(port, () => {
    console.log(`Server Start Port: ${port}`);
});
