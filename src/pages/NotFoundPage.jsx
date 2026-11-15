import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container section">
      <h1 className="page-title">페이지를 찾을 수 없습니다</h1>
      <p className="page-lead">주소를 다시 확인해 주세요.</p>
      <Link className="button button-wine" to="/">홈으로</Link>
    </div>
  )
}
