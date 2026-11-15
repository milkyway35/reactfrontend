// axios 공통 설정 : 챗봇 대화는 쿠키(wine_thread_id)로 이어지므로 withCredentials 필수
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '', // 기본은 Vite 프록시(/api), 직접 호출이면 http://localhost:8000
  withCredentials: true,
  timeout: 90000, // 챗봇 답변은 수십 초 걸릴 수 있음
})

// 서버의 detail(문자열 또는 422 배열)을 화면에 보여줄 메시지로 바꿈
export function getErrorMessage(error) {
  if (error.response) {
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
    if (error.response.status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    return '요청을 처리하지 못했습니다.'
  }
  return '서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export const getHome = () => client.get('/api/home').then((r) => r.data)

export const searchWines = (params) => client.get('/api/search', { params }).then((r) => r.data)

export const sendChat = (message) => client.post('/api/chat', { message }).then((r) => r.data)

export const getChatHistory = () => client.get('/api/chat/history').then((r) => r.data)

export const clearChatHistory = () => client.delete('/api/chat/history')
