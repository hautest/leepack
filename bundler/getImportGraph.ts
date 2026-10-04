import type { Program } from "acorn";
import { dirname, resolve } from "node:path";
import { getAst } from "./getAst.ts";

interface GetImportGraphParams {
  ast: Program;
  filePath: string;
}

type Path = string;
type Dependencies = string[];

/**
 * entry의 AST부터 정적 import와 재내보내기 경로를 따라 의존성 그래프를 만든다.
 * 현재 파일을 먼저 등록하고, 각 경로를 절대 경로로 해석해 getAst로 읽은 뒤 재귀 탐색한다.
 * 이미 등록한 파일은 다시 탐색하지 않지만, 그 파일을 참조하는 연결은 보존한다.
 *
 * @param params.ast - filePath 파일을 파싱한 AST. 다른 파일의 AST를 전달하면 안 된다.
 * @param params.filePath - 탐색을 시작할 파일 경로. 내부에서 절대 경로로 변환한다.
 * @returns Map<파일 절대 경로, 직접 의존하는 파일의 절대 경로 배열>의 Promise.
 * 의존성이 없는 파일의 값은 빈 배열이다. 원본이나 AST는 결과 Map에 저장하지 않는다.
 * @remarks 의존 파일을 읽는 함수다. 동적 import, require, 확장자 자동 탐색은 지원하지 않는다.
 * 순환 연결에서 탐색은 종료되지만, 순환 모듈의 실행을 구현한 것은 아니다.
 * @example
 * const graph = await getImportGraph({ ast, filePath: "/project/main.js" });
 * // main.js가 ./add.js를 import하고 add.js에는 의존성이 없다면:
 * // Map { "/project/main.js" => ["/project/add.js"], "/project/add.js" => [] }
 */
export const getImportGraph = async ({
  ast,
  filePath,
}: GetImportGraphParams) => {
  const modules = new Map<Path, Dependencies>();

  async function visit(ast: Program, filePath: string) {
    if (modules.has(filePath)) return;

    const dependencies: string[] = [];
    modules.set(filePath, dependencies);

    for (const node of ast.body) {
      // default import도 ImportDeclaration이다.
      // export default와 로컬 export는 외부 파일 경로가 없어 제외한다.
      if (
        node.type !== "ImportDeclaration" &&
        node.type !== "ExportNamedDeclaration" &&
        node.type !== "ExportAllDeclaration"
      ) {
        continue;
      }
      if (!node.source) continue;

      const importPath = node.source.value;
      if (typeof importPath !== "string") {
        throw new Error("모듈 경로는 문자열이어야 합니다.");
      }

      const dependencyPath = resolve(dirname(filePath), importPath);
      if (!dependencies.includes(dependencyPath)) {
        dependencies.push(dependencyPath);
      }

      if (modules.has(dependencyPath)) continue;

      const subAst = await getAst({ entry: dependencyPath });

      await visit(subAst, dependencyPath);
    }
  }

  await visit(ast, resolve(filePath));
  return modules;
};
