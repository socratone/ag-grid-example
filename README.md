# AG Grid Example

AG Grid의 기능과 구현 패턴을 기능별 페이지로 정리하는 예제 프로젝트입니다.
행 확장, 셀 렌더링, 데이터 표시처럼 AG Grid를 활용할 때 자주 필요한 동작을 독립된 예제로 제공합니다.

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- AG Grid Community
- TanStack Query
- Tailwind CSS
- pnpm

## 시작하기

의존성을 설치합니다.

```bash
pnpm install
```

개발 서버를 실행합니다.

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. 루트 페이지에서 각 AG Grid 예제로 이동할 수 있습니다.

## 예제

### Expandable rows

- 경로: [`/examples/expandable-rows`](http://localhost:3000/examples/expandable-rows)
- TanStack Query의 `useQuery`로 로컬 API 데이터를 조회합니다.
- 부모 행의 `+` 버튼을 누르면 같은 컬럼 구조를 가진 자식 행들이 표시됩니다.
- 여러 부모 행을 동시에 펼칠 수 있습니다.
- AG Grid Community 기능만 사용합니다.

### Lazy expandable rows

- 경로: [`/examples/lazy-expandable-rows`](http://localhost:3000/examples/lazy-expandable-rows)
- 최초 요청에서는 부모 행만 조회합니다.
- 부모 행의 `+` 버튼을 누르면 해당 부모 ID의 children API를 요청하고 자식 행을 표시합니다.
- 부모별 로딩 및 오류 재시도 상태를 제공하며 여러 부모 행을 동시에 펼칠 수 있습니다.
- 한 번 조회한 자식 행은 TanStack Query 캐시를 재사용합니다.

사용하는 API는 다음과 같습니다.

- `GET /api/grid-examples/lazy-expandable-rows`: 부모 행 목록
- `GET /api/grid-examples/lazy-expandable-rows/[parentId]/children`: 부모별 자식 행 목록

## 프로젝트 구조

```text
app/
├── api/grid-examples/        # 예제에서 사용하는 Route Handler
├── examples/                 # 기능별 AG Grid 예제 페이지
├── page.tsx                  # 예제 링크 목록
└── providers.tsx             # QueryClientProvider, AgGridProvider
```

## 새로운 예제 추가하기

1. `app/examples/{slug}` 디렉터리에 페이지와 컴포넌트를 추가합니다.
2. 필요한 경우 `app/api/grid-examples/{slug}`에 샘플 API를 추가합니다.
3. `app/page.tsx`의 `examples` 배열에 새 페이지 링크를 추가합니다.

React 컴포넌트는 `const` 화살표 함수 형태로 선언합니다.

```tsx
const ExamplePage = () => {
  return <ExampleGrid />;
};

export default ExamplePage;
```

## 명령어

```bash
pnpm dev       # 개발 서버 실행
pnpm lint      # ESLint 검사
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버 실행
```
