# leepack

## 시작하기

```sh
mise trust
mise install
pnpm install
pnpm start
```

- `pnpm build`: TypeScript를 `dist/`에 빌드
- `pnpm typecheck`: 타입 검사
- `pnpm start`: 빌드 후 실행

Node와 pnpm 버전은 `mise.toml`에서 관리합니다.
셸에 mise가 활성화되어 있지 않다면 `mise exec -- pnpm start`처럼 실행합니다.
