# ERP 실시간 채팅 서버 🚀

ERP 시스템을 위한 실시간 채팅 서버입니다. Socket.IO를 사용하여 웹소켓 기반의 실시간 통신을 제공합니다.

## 🛠️ 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 모드로 실행 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드로 실행
```bash
npm start
```

## 📋 주요 기능

- ✅ 실시간 메시지 송수신
- ✅ 사용자 온라인 상태 관리
- ✅ 입장/퇴장 알림
- ✅ 채팅방 관리
- ✅ 타이핑 상태 표시
- ✅ CORS 설정으로 안전한 연결
- ✅ 서버 상태 모니터링 API

## 🌐 API 엔드포인트

### GET /
서버 기본 정보 확인

### GET /status
서버 상태 및 연결된 사용자 정보 확인

## 🔧 환경 설정

`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

## 📡 Socket.IO 이벤트

### 클라이언트 → 서버
- `sendMessage`: 메시지 전송
- `joinRoom`: 특정 채팅방 참여
- `typing`: 타이핑 상태 전송
- `userLeave`: 사용자 퇴장

### 서버 → 클라이언트
- `message`: 새 메시지 수신
- `userJoined`: 새 사용자 입장
- `userLeft`: 사용자 퇴장
- `onlineUsers`: 온라인 사용자 목록 업데이트
- `userTyping`: 다른 사용자 타이핑 상태

## 🚀 배포

### PM2 사용 (권장)
```bash
npm install -g pm2
pm2 start server.js --name "chat-server"
pm2 save
pm2 startup
```

### Docker 사용
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 📞 연결 정보

- **기본 포트**: 4000
- **WebSocket 엔드포인트**: `ws://localhost:4000`
- **HTTP 엔드포인트**: `http://localhost:4000`

## 🐛 문제 해결

### 포트 충돌 시
```bash
# 포트 사용 확인
netstat -tulpn | grep :4000

# 다른 포트로 실행
PORT=5000 npm start
```

### CORS 오류 시
`server.js`의 CORS 설정에서 클라이언트 주소를 확인하세요.

## 📝 로그 확인

서버 실행 시 다음과 같은 로그가 표시됩니다:
- 🚀 사용자 연결
- 👋 사용자 입장/퇴장
- 💬 메시지 전송
- ❌ 에러 발생

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 