# AI 와인 소믈리에 (React 프론트엔드)

AI 와인 소믈리에 서비스의 React 프론트엔드입니다. Jinja2 기반이던 3개 화면(홈, 와인 검색, 와인 챗봇)을 React로 옮겼고, FastAPI 백엔드(`reactbackend`)의 REST API를 호출합니다.

## 기술 스택

- React 19, Vite 8
- react-router-dom (화면 이동), axios (API 호출), react-markdown (챗봇 답변 렌더링)
- ESLint (react-hooks, react-refresh)

## 화면과 API

| 경로 | 화면 | 호출하는 API |
| --- | --- | --- |
| `/` | 홈 | `GET /api/home` |
| `/search` | 와인 검색 | `GET /api/search?query=&source_type=&k=&min_price=&max_price=&in_stock_only=` |
| `/chat` | 와인 챗봇 | `POST /api/chat`, `GET /api/chat/history`, `DELETE /api/chat/history` |
| `*` | 404 안내 | - |

## 폴더 구성

```
src/
├ main.jsx              BrowserRouter 적용
├ App.jsx               라우트 정의
├ index.css             전역 스타일
├ api/client.js         axios 인스턴스, API 함수, 오류 메시지 변환
├ components/Layout.jsx 상단 메뉴, Outlet
└ pages/                HomePage, SearchPage, ChatPage, NotFoundPage
```

## 주요 기능

- **홈**: 벡터 DB 준비 여부와 건수를 표시하고, 기능 카드로 각 화면에 이동합니다.
- **와인 검색**: 검색어, 검색 대상, 결과 수, 가격 범위(만원), 재고 조건으로 검색합니다. 검색 조건을 주소 쿼리스트링에 저장하므로 새로고침하거나 링크를 공유해도 같은 결과가 나옵니다. 결과 카드에는 이름, 빈티지, 지역, 가격, 재고, 한식 페어링, 테이스팅 노트, 유사도가 표시됩니다.
- **와인 챗봇**: 첫 화면에서 이전 대화를 복원하고 `[새 대화]`로 삭제할 수 있습니다. Enter는 전송, Shift+Enter는 줄바꿈이며 한글 조합 중 Enter는 전송하지 않습니다. 답변은 마크다운으로 렌더링하고(`rehype-raw`, `dangerouslySetInnerHTML` 미사용으로 XSS 방지) 사용한 도구 태그를 함께 보여 줍니다.
- **오류 처리**: 서버 `detail`(문자열/422 배열), 429, 연결 실패를 한글 메시지로 변환합니다.

> 대화 유지는 쿠키(`wine_thread_id`)에 의존하므로 axios에 `withCredentials: true`가 필요합니다.

## 실행 방법

백엔드(`reactbackend`)를 먼저 실행한 뒤 프론트엔드를 실행합니다.

```powershell
# 터미널 1 - 백엔드 (http://localhost:8000/docs)
cd reactbackend\backend
..\.venv\Scripts\activate
uvicorn main:app --reload

# 터미널 2 - 프론트엔드 (http://localhost:3000)
cd reactfrontend
npm install
npm run dev
```

기타 명령: `npm run build` (배포용 빌드), `npm run lint` (코드 검사)

### 설정

- 개발 서버는 3000번 포트에서 실행되며 `/api`를 `http://127.0.0.1:8000`으로 프록시합니다. 백엔드 포트를 바꾸면 `vite.config.js`의 proxy target도 바꿔야 합니다.
- 프록시 없이 직접 호출하려면 `.env`에 `VITE_API_BASE=http://localhost:8000`을 지정합니다. 쿠키가 전달되려면 React와 API의 호스트 이름(`localhost` / `127.0.0.1`)을 맞춰야 합니다.

## 테스트 결과

실제 백엔드와 Chrome(headless)으로 홈, 검색(가격·재고 필터), 챗봇 질문, 대화 복원/삭제, 422 오류, 404 화면을 확인했고 `npm run lint`와 `npm run build`도 통과했습니다.

확인하지 않은 항목: 모바일 화면 폭, Chrome 외 브라우저, 한글 IME 직접 입력 시 Enter 동작, 운영 배포(HTTPS, 도메인)
