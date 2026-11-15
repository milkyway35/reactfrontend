import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { clearChatHistory, getChatHistory, getErrorMessage, sendChat } from '../api/client.js'

const EXAMPLES = [
  '불고기에 어울리는 와인을 추천해줘',
  '샤또 마고 2002 가격과 재고 알려줘',
  '20만원 이하 와인 3개 추천해줘',
  '보르도 와인 입문 영상도 찾아줘',
]
const TOOL_LABELS = { search_wine: '와인 DB 검색', youtube_search: 'YouTube 검색' }

// LLM 답변은 신뢰할 수 없으므로 HTML을 직접 넣지 않고 react-markdown으로만 렌더링
function Markdown({ children }) {
  return (
    <ReactMarkdown components={{ a: ({ href, children: text }) => <a href={href} target="_blank" rel="noopener noreferrer">{text}</a> }}>
      {children}
    </ReactMarkdown>
  )
}

export default function ChatPage() {
  // item: { id, role: 'user' | 'assistant' | 'error', content, tools }
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const nextId = useRef(0)
  const messagesRef = useRef(null)
  const inputRef = useRef(null)
  const lastUserRef = useRef(null)

  const add = (role, content, tools = []) =>
    setMessages((list) => [...list, { id: nextId.current++, role, content, tools }])

  useEffect(() => {
    let ignore = false
    getChatHistory()
      .then((history) => {
        if (ignore) return
        setMessages(history.map((m) => ({ id: nextId.current++, role: m.role, content: m.content, tools: [] })))
      })
      .catch(() => {})
    return () => { ignore = true }
  }, [])

  // 답변이 오면 질문의 시작 부분부터 읽을 수 있게, 그 외에는 맨 아래로 스크롤
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && lastUserRef.current) lastUserRef.current.scrollIntoView({ block: 'start' })
    else el.scrollTop = el.scrollHeight
  }, [messages, busy])

  const resize = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const send = async (text) => {
    add('user', text)
    setBusy(true)
    try {
      const data = await sendChat(text)
      add('assistant', data.answer, data.tools_used)
    } catch (e) {
      add('error', getErrorMessage(e))
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const submit = (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    requestAnimationFrame(resize)
    send(text)
  }

  const onKeyDown = (e) => {
    // 한글 조합 중 Enter는 전송하지 않음
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const reset = async () => {
    setBusy(true)
    try {
      await clearChatHistory()
      setMessages([])
    } catch {
      add('error', '대화를 초기화하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const lastUserId = [...messages].reverse().find((m) => m.role === 'user')?.id

  return (
    <div className="container chat">
      <div className="chat-head">
        <h1 className="page-title">와인 챗봇</h1>
        <button className="button button-line" type="button" onClick={reset} disabled={busy}>새 대화</button>
      </div>

      <div className="chat-messages" aria-live="polite" ref={messagesRef}>
        {messages.length === 0 && !busy && (
          <div className="chat-empty">
            <p className="chat-empty-title">무엇을 도와드릴까요?</p>
            <p>음식, 예산, 취향을 알려주시면 어울리는 와인을 찾아드립니다.</p>
            <div className="chips">
              {EXAMPLES.map((example) => (
                <button key={example} className="chip" type="button" onClick={() => !busy && send(example)}>{example}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          if (m.role === 'user') {
            return <div key={m.id} ref={m.id === lastUserId ? lastUserRef : null} className="bubble bubble-user">{m.content}</div>
          }
          if (m.role === 'error') {
            return <div key={m.id} className="bubble bubble-error" role="alert">{m.content}</div>
          }
          return (
            <div key={m.id} className="bubble bubble-assistant markdown">
              <Markdown>{m.content}</Markdown>
              {m.tools.length > 0 && (
                <div className="bubble-tools">
                  {m.tools.map((name) => <span key={name} className="tool-tag">{TOOL_LABELS[name] || name}</span>)}
                </div>
              )}
            </div>
          )
        })}
        {busy && <div className="bubble bubble-assistant bubble-loading">답변 생성 중</div>}
      </div>

      <form className="chat-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="chat-input">와인에 대해 물어보세요</label>
        <textarea id="chat-input" ref={inputRef} rows={1} maxLength={2000} value={input}
                  placeholder="와인에 대해 물어보세요..." autoFocus
                  onChange={(e) => { setInput(e.target.value); resize() }} onKeyDown={onKeyDown} />
        <button className="button button-wine" type="submit" disabled={busy}>보내기</button>
      </form>
      <p className="chat-hint">Enter로 전송 · Shift+Enter로 줄바꿈</p>
    </div>
  )
}
