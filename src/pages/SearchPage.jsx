import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getErrorMessage, searchWines } from '../api/client.js'

const EXAMPLES = [
  '갈비찜과 어울리는 묵직한 레드',
  '샤또 마고 2002 가격',
  '해산물에 어울리는 상큼한 화이트',
  '기념일에 마실 샴페인',
]
const SOURCE_TYPES = [
  ['all', '전체'],
  ['Structured Data', '기본정보'],
  ['Unstructured Data', '상세 설명'],
]

// 주소의 쿼리스트링을 검색 조건으로 사용 (새로고침/링크 공유해도 같은 결과)
function readParams(sp) {
  return {
    query: sp.get('query')?.trim() ?? '',
    source_type: sp.get('source_type') ?? 'all',
    k: Number(sp.get('k')) || 5,
    min_price: sp.get('min_price') ?? '',
    max_price: sp.get('max_price') ?? '',
    in_stock_only: sp.get('in_stock_only') === 'true',
  }
}

function summaryText(p) {
  let text = ''
  if (p.min_price !== '' && p.max_price !== '') text += ` · ${+p.min_price}~${+p.max_price}만원`
  else if (p.min_price !== '') text += ` · ${+p.min_price}만원 이상`
  else if (p.max_price !== '') text += ` · ${+p.max_price}만원 이하`
  if (p.in_stock_only) text += ' · 재고 있음'
  return text
}

// 검색 조건(주소)이 바뀌면 key로 화면을 새로 만들어 폼과 결과를 초기화
export default function SearchPage() {
  const [searchParams] = useSearchParams()
  return <SearchView key={searchParams.toString()} />
}

function SearchView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = readParams(searchParams)

  const [form, setForm] = useState(params)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(Boolean(params.query))
  const [error, setError] = useState('')

  useEffect(() => {
    const p = params
    if (!p.query) return
    let ignore = false
    const request = { query: p.query, source_type: p.source_type, k: p.k, in_stock_only: p.in_stock_only }
    if (p.min_price !== '') request.min_price = p.min_price
    if (p.max_price !== '') request.max_price = p.max_price
    searchWines(request)
      .then((data) => !ignore && setResults(data.results))
      .catch((e) => !ignore && setError(getErrorMessage(e)))
      .finally(() => !ignore && setLoading(false))
    return () => { ignore = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (name) => (e) =>
    setForm((f) => ({ ...f, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = { query: form.query.trim(), source_type: form.source_type, k: String(form.k) }
    if (!next.query) return
    if (form.min_price !== '') next.min_price = form.min_price
    if (form.max_price !== '') next.max_price = form.max_price
    if (form.in_stock_only) next.in_stock_only = 'true'
    setSearchParams(next)
  }

  const hasFilter = params.min_price !== '' || params.max_price !== '' || params.in_stock_only

  return (
    <div className="container section">
      <h1 className="page-title">와인 검색</h1>
      <p className="page-lead">단어가 정확히 일치하지 않아도 의미가 가까운 와인을 찾아줍니다.</p>

      <form className="search-form" onSubmit={submit}>
        <div className="field field-query">
          <label htmlFor="query">검색어</label>
          <input id="query" type="search" value={form.query} onChange={update('query')} maxLength={500}
                 placeholder="예: 갈비찜과 어울리는 묵직한 레드" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="source_type">검색 대상</label>
          <select id="source_type" value={form.source_type} onChange={update('source_type')}>
            {SOURCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="k">결과 수</label>
          <select id="k" value={form.k} onChange={update('k')}>
            {[3, 5, 10].map((n) => <option key={n} value={n}>{n}개</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="min_price">최소 가격(만원)</label>
          <input id="min_price" type="number" min="0" step="any" inputMode="decimal"
                 value={form.min_price} onChange={update('min_price')} />
        </div>
        <div className="field">
          <label htmlFor="max_price">최대 가격(만원)</label>
          <input id="max_price" type="number" min="0" step="any" inputMode="decimal"
                 value={form.max_price} onChange={update('max_price')} />
        </div>
        <label className="field-check">
          <input type="checkbox" checked={form.in_stock_only} onChange={update('in_stock_only')} />
          재고 있는 와인만
        </label>
        <button className="button button-wine" type="submit" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {error && <div className="notice notice-error" role="alert">{error}</div>}

      {!params.query && !error && (
        <div className="chips" aria-label="검색어 예시">
          {EXAMPLES.map((example) => (
            <Link key={example} className="chip" to={`/search?${new URLSearchParams({ query: example })}`}>{example}</Link>
          ))}
        </div>
      )}

      {params.query && !loading && !error && results && results.length === 0 && (
        <div className="empty-state">
          {hasFilter
            ? '조건에 맞는 와인이 없습니다. 가격 범위나 재고 조건을 바꿔 보세요.'
            : '검색 결과가 없습니다. 다른 표현으로 검색해 보세요.'}
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <p className="result-summary">
            <strong>{params.query}</strong> 검색 결과 {results.length}건 · 유사도 순{summaryText(params)}
          </p>
          <ol className="result-list">
            {results.map((wine, i) => <WineCard key={`${wine.name}-${wine.vintage}-${i}`} wine={wine} />)}
          </ol>
        </>
      )}
    </div>
  )
}

function WineCard({ wine }) {
  const percent = Math.round(wine.score * 100)
  const noStock = wine.stock === '0'
  return (
    <li className="wine-card">
      <div className="wine-card-head">
        <div>
          <h2>{wine.name} <span className="wine-vintage">{wine.vintage}</span></h2>
          <ul className="tags">
            <li>{wine.region}</li>
            <li>{wine.price === '미정' ? '가격 미정' : wine.price}</li>
            <li className={noStock ? 'tag-muted' : undefined}>{noStock ? '재고 없음' : `재고 ${wine.stock}병`}</li>
          </ul>
        </div>
        <div className="score" title={`코사인 유사도 ${wine.score}`}>
          <span className="score-value">{percent}%</span>
          <span className="score-track"><span className="score-fill" style={{ width: `${percent}%` }} /></span>
          <span className="score-label">유사도</span>
        </div>
      </div>
      {wine.pairing && <p className="wine-pairing"><strong>한식 페어링</strong> {wine.pairing}</p>}
      {wine.tasting_note && <p className="wine-note">{wine.tasting_note}</p>}
      <p className="wine-source">{wine.source_type === 'Structured Data' ? '기본정보' : '상세 설명'}에서 찾음</p>
    </li>
  )
}
