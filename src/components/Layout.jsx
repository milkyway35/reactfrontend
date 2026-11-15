import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  // 챗봇은 화면 높이에 맞추고 대화 영역만 스크롤
  useEffect(() => {
    document.body.classList.toggle('page-chat', pathname.startsWith('/chat'))
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link className="brand" to="/">
            <span aria-hidden="true">🍷</span> AI 와인 소믈리에
          </Link>
          <nav className="site-nav" aria-label="주요 메뉴">
            <NavLink to="/" end>홈</NavLink>
            <NavLink to="/search">와인 검색</NavLink>
            <NavLink to="/chat">와인 챗봇</NavLink>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  )
}
