<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
