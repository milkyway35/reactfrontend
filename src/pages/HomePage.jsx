import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage, getHome } from '../api/client.js'

export default function HomePage() {
  const [home, setHome] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getHome().then(setHome).catch((e) => setError(getErrorMessage(e)))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>오늘의 음식에 어울리는<br />와인을 찾아드립니다</h1>
          <p className="hero-lead">
            60종의 와인 데이터에서 의미가 가까운 와인을 찾고 가격과 재고 조건으로 좁혀 줍니다. AI 소믈리에가 한식 페어링까지 추천합니다.
          </p>
          <div className="hero-actions">
            <Link className="button button-gold" to="/chat">소믈리에와 대화하기</Link>
            <Link className="button button-ghost" to="/search">와인 검색하기</Link>
          </div>
        </div>
      </section>

      <div className="container section">
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {home && !home.ready && (
          <div className="notice notice-warn" role="alert">
            <strong>벡터 DB가 비어 있습니다.</strong>{' '}
            backend 폴더에서 <code>python vectordb/create_vector_db.py</code> 를 먼저 실행해 주세요.
          </div>
        )}
        {home?.ready && (
          <p className="status-line">
            <span className="status-dot" aria-hidden="true" />
            벡터 DB 준비 완료 · 기본정보 {home.counts.structured}건 · 상세 설명 {home.counts.unstructured}건
          </p>
        )}

        <h2 className="section-title">주요 기능</h2>
        <div className="feature-grid">
          <Link className="feature-card" to="/search">
            <span className="feature-icon" aria-hidden="true">🔍</span>
            <h3>와인 정보 검색</h3>
            <p>"묵직한 레드", "갈비찜" 같은 표현으로 검색하면 의미가 가까운 와인을 유사도 점수와 함께 보여줍니다.</p>
          </Link>
          <Link
            className="feature-card"
            to={`/search?${new URLSearchParams({ query: '불고기에 어울리는 와인', max_price: '20', in_stock_only: 'true' })}`}
          >
            <span className="feature-icon" aria-hidden="true">🏷️</span>
            <h3>가격·재고 필터</h3>
            <p>가격 범위를 만원 단위로 지정하고 재고가 있는 와인만 볼 수 있습니다. 가격 조건을 넣으면 가격 미정 와인은 제외됩니다.</p>
          </Link>
          <Link className="feature-card" to="/chat">
            <span className="feature-icon" aria-hidden="true">💬</span>
            <h3>와인 챗봇과 영상 추천</h3>
            <p>AI 소믈리에가 DB를 찾아 답하고 가격과 재고 조건도 알아서 적용합니다. 요청하면 YouTube 와인 영상도 찾아줍니다.</p>
          </Link>
        </div>

        <h2 className="section-title">사용 방법</h2>
        <ol className="steps">
          <li><strong>와인 검색</strong>에서 음식이나 맛을 입력하고, 필요하면 가격과 재고 조건을 지정합니다.</li>
          <li><strong>와인 챗봇</strong>에는 "불고기에 어울리는 10만원 이하 와인 추천해줘"처럼 말로 물어봅니다.</li>
          <li>대화는 새로고침해도 유지되며, <strong>새 대화</strong> 버튼으로 지울 수 있습니다.</li>
        </ol>
      </div>
    </>
  )
}
