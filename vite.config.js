import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    open: true, // 서버 구동시 웹브라우저 자동활성화
    port: 3000, // port 번호를 3000 번으로 수정
    // 브라우저 입장에서 같은 주소가 되어 CORS/쿠키 문제가 없음 (uvicorn은 IPv4로 대기하므로 127.0.0.1)
    proxy: { '/api': { target: 'http://127.0.0.1:8000' } },
  },
})
