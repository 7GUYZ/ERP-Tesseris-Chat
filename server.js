const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// CORS 설정 - 운영 환경과 개발 환경 모두 허용
const allowedOrigins = [
  // 개발 환경
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  // 운영 환경
  "https://kschost.ddns.net",
  "http://kschost.ddns.net"
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// 🗄️ 메모리 저장소 (실제로는 데이터베이스 사용 권장)
let connectedUsers = new Map(); // userId -> { id, name, socketId, avatar }
let chatRooms = new Map(); // roomId -> { id, name, participants, messages, createdAt }
let globalMessages = []; // 전역 채팅 메시지들
let roomMessages = new Map(); // roomId -> messages[]

// 🏠 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 실시간 채팅 서버가 정상 작동 중입니다!',
    onlineUsers: connectedUsers.size,
    chatRooms: chatRooms.size,
    timestamp: new Date().toISOString()
  });
});

// 서버 상태 확인 API (기존 유지)
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    connectedUsers: Array.from(connectedUsers.values()),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// 🔌 Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log(`🔗 새 연결 시도: ${socket.id}`);
  
  // 사용자 정보 등록
  const { userId, userName } = socket.handshake.query;
  
  if (userId && userName) {
    console.log(`📋 사용자 정보: ${userName} (${userId})`);
    
    // 🛡️ 기존 연결 확인 및 정리 (더 강화)
    let wasExistingUser = false;
    const existingUser = connectedUsers.get(userId);
    if (existingUser) {
      console.log(`⚠️  중복 연결 감지: ${userName}`);
      console.log(`   └ 기존: ${existingUser.socketId} | 새로운: ${socket.id}`);
      
      if (existingUser.socketId !== socket.id) {
        // 기존 소켓 연결 강제 해제
        const existingSocket = io.sockets.sockets.get(existingUser.socketId);
        if (existingSocket && existingSocket.connected) {
          console.log(`🔌 기존 연결 강제 해제: ${existingUser.socketId}`);
          existingSocket.emit('forceDisconnect', '새로운 연결로 인한 기존 연결 해제');
          existingSocket.disconnect(true);
        }
        
        wasExistingUser = true;
        // 기존 사용자 정보 제거
        connectedUsers.delete(userId);
      } else {
        // 같은 소켓 ID로 중복 연결 시도 - 거부
        console.log(`❌ 같은 소켓으로 중복 연결 시도 거부: ${socket.id}`);
        socket.disconnect(true);
        return;
      }
    }

    const user = {
      id: userId,
      name: userName,
      socketId: socket.id,
      avatar: null,
      status: 'online',
      joinTime: new Date().toISOString(),
      room: 'general'
    };
    
    // 🔄 새 사용자 정보 등록
    connectedUsers.set(userId, user);
    
    if (wasExistingUser) {
      console.log(`🔄 사용자 재연결: ${userName} (총 ${connectedUsers.size}명 온라인)`);
    } else {
      console.log(`🚀 새 사용자 연결: ${userName} (총 ${connectedUsers.size}명 온라인)`);
    }
    
    // 🏠 기본 채팅방에 참여
    socket.join('general');
    
    // 📢 모든 클라이언트에게 온라인 사용자 목록 전송
    const onlineUsers = Array.from(connectedUsers.values());
    io.to('general').emit('onlineUsers', onlineUsers);
    io.emit('onlineUsers', onlineUsers);
    
    // 📣 다른 사용자들에게 사용자 입장 알림 (재연결이 아닐 때만)
    if (!wasExistingUser) {
      socket.to('general').emit('userJoined', user);
      socket.broadcast.emit('userJoined', user);
    }
    
    // 🎉 환영 메시지 전송
    socket.emit('message', {
      id: `welcome-${Date.now()}`,
      type: 'system',
      text: `${userName}님, 실시간 채팅에 오신 것을 환영합니다! 🎉`,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log(`❌ 사용자 정보 없이 연결 시도: ${socket.id} - 연결 거부`);
    socket.emit('error', '사용자 정보가 필요합니다.');
    socket.disconnect(true);
  }

  // 📧 전역 메시지 전송 (기존 sendMessage 호환성 유지)
  socket.on('sendMessage', (message) => {
    try {
      console.log('📧 전역 메시지:', message);
      
      // 메시지 저장
      const messageWithTimestamp = {
        ...message,
        id: message.id || Date.now().toString(),
        timestamp: new Date().toISOString(),
        room: 'general' // 기존 호환성
      };
      
      globalMessages.push(messageWithTimestamp);
      
      const user = connectedUsers.get(socket.handshake.query.userId);
      if (user) {
        console.log(`💬 [${user.name}]: ${message.text}`);
      }
      
      // 해당 채팅방의 모든 클라이언트에게 메시지 전송 (기존 호환성)
      io.to('general').emit('message', messageWithTimestamp);
      io.emit('message', messageWithTimestamp); // 새 클라이언트용
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
    }
  });

  // 🏠 채팅방 생성
  socket.on('createRoom', async (roomData) => {
    const roomId = roomData.id || `room_${Date.now()}`;
    const room = {
      id: roomId,
      name: roomData.name,
      type: roomData.type || 'group', // 'group' or 'direct'
      participants: [socket.handshake.query.userId],
      createdBy: socket.handshake.query.userId,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    chatRooms.set(roomId, room);
    roomMessages.set(roomId, []);
    
    socket.join(roomId);
    console.log(`🏠 새 채팅방 생성: ${room.name} (${roomId})`);
    
    // 방 목록 업데이트 전송
    io.emit('roomList', Array.from(chatRooms.values()));
    
    socket.emit('roomCreated', room);
    try {
      const SPRINGBOOT_SERVICE_URL = process.env.SPRINGBOOT_SERVICE_URL || 'http://localhost:19091';
      const response = await axios.post(`${SPRINGBOOT_SERVICE_URL}/api/adminchat/roomcreate`, room);
      console.log('🏠 채팅방 생성 응답:', response.data);
      socket.emit('roomCreated', response.data);
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
    }
  });

  // 🚪 채팅방 입장
  socket.on('joinRoom', ({ roomId, user }) => {
    if (typeof roomId === 'string' && roomId !== 'general') {
      // 새로운 룸 시스템
      console.log(`🚪 채팅방 입장: ${user.name} → ${roomId}`);
      
      socket.join(roomId);
      
      // 채팅방 정보 업데이트
      const room = chatRooms.get(roomId);
      if (room) {
        // 참여자 추가 (중복 방지)
        if (!room.participants.includes(user.id)) {
          room.participants.push(user.id);
          chatRooms.set(roomId, room);
        }
        
        // 채팅방의 기존 메시지 전송
        const messages = roomMessages.get(roomId) || [];
        socket.emit('roomMessages', messages);
        
        // 채팅방 참여자 목록 전송
        const participants = room.participants
          .map(participantId => connectedUsers.get(participantId))
          .filter(Boolean);
        io.to(roomId).emit('roomParticipants', participants);
        
        // 입장 알림 메시지
        const joinMessage = {
          id: Date.now().toString(),
          type: 'system',
          text: `${user.name}님이 입장했습니다.`,
          roomId: roomId,
          timestamp: new Date()
        };
        
        const currentMessages = roomMessages.get(roomId) || [];
        currentMessages.push(joinMessage);
        roomMessages.set(roomId, currentMessages);
        
        io.to(roomId).emit('roomMessage', joinMessage);
      }
    } else {
      // 기존 룸 시스템 호환성 (roomName 문자열)
      const roomName = roomId || 'general';
      socket.leave('general');
      socket.join(roomName);
      
      const user = connectedUsers.get(socket.id);
      if (user) {
        user.room = roomName;
        connectedUsers.set(socket.id, user);
      }

      socket.emit('roomJoined', { room: roomName });
      console.log(`📝 기존 채팅방 참여: ${roomName}`);
    }
  });

  // 💬 채팅방 메시지 전송
  socket.on('sendRoomMessage', (message) => {
    console.log('💬 룸 메시지:', message);
    
    const messageWithId = {
      ...message,
      id: message.id || Date.now().toString(),
      timestamp: new Date()
    };
    
    // 해당 채팅방 메시지 저장
    const roomId = message.roomId;
    const currentMessages = roomMessages.get(roomId) || [];
    currentMessages.push(messageWithId);
    roomMessages.set(roomId, currentMessages);
    
    // 채팅방 마지막 활동 시간 업데이트
    const room = chatRooms.get(roomId);
    if (room) {
      room.lastActivity = new Date();
      room.lastMessage = message.text;
      chatRooms.set(roomId, room);
    }
    
    // 해당 채팅방 참여자들에게만 메시지 전송
    io.to(roomId).emit('roomMessage', messageWithId);
  });

  // 📨 채팅방 메시지 요청
  socket.on('getRoomMessages', (roomId) => {
    const messages = roomMessages.get(roomId) || [];
    socket.emit('roomMessages', messages);
  });

  // 🏃 채팅방 나가기
  socket.on('leaveRoom', ({ roomId, user }) => {
    console.log(`🏃 채팅방 나가기: ${user.name} ← ${roomId}`);
    
    socket.leave(roomId);
    
    // 나가기 알림 메시지
    const leaveMessage = {
      id: Date.now().toString(),
      type: 'system',
      text: `${user.name}님이 퇴장했습니다.`,
      roomId: roomId,
      timestamp: new Date()
    };
    
    const currentMessages = roomMessages.get(roomId) || [];
    currentMessages.push(leaveMessage);
    roomMessages.set(roomId, currentMessages);
    
    io.to(roomId).emit('roomMessage', leaveMessage);
    
    // 참여자 목록에서 제거
    const room = chatRooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(id => id !== user.id);
      chatRooms.set(roomId, room);
      
      // 업데이트된 참여자 목록 전송
      const participants = room.participants
        .map(participantId => connectedUsers.get(participantId))
        .filter(Boolean);
      io.to(roomId).emit('roomParticipants', participants);
    }
  });

  // ⌨️ 타이핑 상태 (기존 호환성 + 새 기능)
  socket.on('typing', (data) => {
    const user = connectedUsers.get(socket.handshake.query.userId);
    if (user) {
      if (data.roomId) {
        // 새로운 룸 시스템
        socket.to(data.roomId).emit('userTyping', { 
          userId: data.userId, 
          userName: data.userName, 
          isTyping: data.isTyping 
        });
      } else {
        // 기존 시스템 호환성
        socket.to('general').emit('userTyping', {
          userId: user.id,
          userName: user.name,
          isTyping: data.isTyping
        });
      }
    }
  });

  // 👥 사용자 목록 요청
  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsers', Array.from(connectedUsers.values()));
  });

  // 🏠 채팅방 목록 요청
  socket.on('getRoomList', () => {
    socket.emit('roomList', Array.from(chatRooms.values()));
  });

  // 사용자 퇴장 처리 (기존 호환성)
  socket.on('userLeave', (user) => {
    handleUserDisconnect(socket);
  });

  // 🔌 연결 해제 처리
  socket.on('disconnect', (reason) => {
    console.log(`🔌 연결 해제: ${socket.id}, 이유: ${reason}`);
    handleUserDisconnect(socket);
  });

  // 🚨 에러 처리
  socket.on('error', (error) => {
    console.error(`❌ 소켓 에러 [${socket.id}]:`, error);
  });
});

function handleUserDisconnect(socket) {
  // 연결 해제된 사용자 찾기
  let disconnectedUser = null;
  for (const [userId, user] of connectedUsers.entries()) {
    if (user.socketId === socket.id) {
      disconnectedUser = user;
      connectedUsers.delete(userId);
      break;
    }
  }
  
  if (disconnectedUser) {
    console.log(`👋 ${disconnectedUser.name}님이 퇴장했습니다. (총 ${connectedUsers.size}명 온라인)`);
    
    // 다른 사용자들에게 퇴장 알림 (기존 호환성)
    socket.to('general').emit('userLeft', disconnectedUser);
    socket.broadcast.emit('userLeft', disconnectedUser); // 새 클라이언트용
    
    // 업데이트된 온라인 사용자 목록 전송
    const onlineUsers = Array.from(connectedUsers.values());
    io.to('general').emit('onlineUsers', onlineUsers);
    io.emit('onlineUsers', onlineUsers); // 새 클라이언트용
  }
}

// 🗄️ API 라우트들
app.get('/api/users', (req, res) => {
  res.json({
    onlineUsers: Array.from(connectedUsers.values()),
    count: connectedUsers.size
  });
});

app.get('/api/rooms', (req, res) => {
  res.json({
    chatRooms: Array.from(chatRooms.values()),
    count: chatRooms.size
  });
});

app.get('/api/messages/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const messages = roomMessages.get(roomId) || [];
  res.json({
    roomId,
    messages,
    count: messages.length
  });
});

// 정리 작업 (기존 유지)
process.on('SIGTERM', () => {
  console.log('🛑 서버 종료 신호 받음...');
  server.close(() => {
    console.log('✅ HTTP 서버 종료됨');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Ctrl+C 감지됨. 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

// 🚀 서버 시작
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
🚀 실시간 채팅 서버가 시작되었습니다!
📍 서버 주소: http://localhost:${PORT}
📊 상태 확인: http://localhost:${PORT}/status
⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}
🔧 새 기능: 채팅방 시스템 + 기존 호환성 유지
  `);
}); 