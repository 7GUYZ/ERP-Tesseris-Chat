import { Client } from "@stomp/stompjs";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

// 서버 URL 설정 - 환경에 따라 변경 가능
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8088";
const WS_URL = `${SERVER_URL}/ws`;

export default function ChatConnect() {
    const clientRef = useRef(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [nickname] = useState(() => prompt("닉네임을 입력하세요") || "익명");
    useEffect(() => {
        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                // ✅ 채팅방 생성 이벤트 구독
                client.subscribe("/topic/rooms", (message) => {
                    if (message.body) {
                        const newRoom = JSON.parse(message.body);
                        setRooms(prev => [...prev, newRoom]);
                        console.log(newRoom)
                    }
                });
            },
            debug: (str) => console.log(str),
        });

        client.activate();
        clientRef.current = client;
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        }
    }, []);
    const connectToRoom = (roomName) => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            // 이전방 연결 해제
        }
        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/${roomName.roomId}`, (messages) => {
                    if (messages.body) {
                        setMessages(prev => [...prev, JSON.parse(messages.body)])
                    }
                });
            },
            debug: (str) => console.log(str),
        });
        client.activate();
        clientRef.current = client;
        setMessages([])
        setCurrentRoom(roomName);
    }
    const addRoom = async () => {
        const roomName = prompt("생성할 채팅방 이름을 입력하세요.");
        try {
            await axios.post(`${SERVER_URL}/chat/room`, { name: roomName });
            getrooms();
        } catch (error) {
            console.log("방생성 실패");
        }
    }
    const sendMessage = () => {
        if (!input.trim() || !clientRef.current?.connected || !currentRoom) return;
        clientRef.current.publish({
            destination: `/app/chat.sendMessage/${currentRoom.roomId}`,
            body: JSON.stringify({ sender: nickname, content: input, }),
        });
        setInput(""); // 메시지 전송 후 입력 필드 초기화
    }
    useEffect(() => {
        getrooms();
    }, []);
    const getrooms = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/chat/rooms`);
            console.log(res)
            setRooms(res.data)
        } catch (error) {
            console.error("방 목록 불러오기 실패", error);
        }
    }
    return (
        <div>
            {/*  방 목록 */}
            <div style={{ width: "200px", marginRight: "20px" }}>
                <button onClick={addRoom}>방 만들기</button>
                <ul>
                    {rooms.map((room, idx) => (
                        <li key={idx} style={{ cursor: "pointer", fontWeight: currentRoom === room ? "bold" : "normal" }} onClick={() => connectToRoom(room)}>
                            {room.name}
                        </li>
                    ))}
                </ul>
            </div>
            {/* 채팅창 */}
            <div>
                <h3>{currentRoom ? `[${currentRoom.name}] 채팅중` : "채팅방을 선택 하세요."}</h3>
                <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px" }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            textAlign: msg.sender === nickname ? "right" : "left",
                            marginBottom: "5px"
                        }}>
                            <strong>{msg.sender}</strong>: {msg.content}
                        </div>
                    ))}
                </div>
                {currentRoom && (<>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }} />
                    <button onClick={sendMessage} disabled={input.length === 0}> 전송 </button>
                </>)}
            </div>
        </div>
    );
}