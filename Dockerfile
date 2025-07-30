# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성도 포함하여 빌드 최적화)
RUN npm ci

# 소스 코드 복사
COPY . .

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 파일 소유권 변경
RUN chown -R nodejs:nodejs /app
USER nodejs

# 포트 노출 (기본 포트 4000)
EXPOSE 4000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000
ENV SPRINGBOOT_SERVICE_URL=https:kschost.ddns.net/springboot

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 애플리케이션 실행
CMD ["node", "server.js"] 