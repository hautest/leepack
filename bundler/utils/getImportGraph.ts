import type { Program } from "acorn";
import { dirname, resolve } from "node:path";
import { getAst } from "./getAst/getAst.ts";

interface GetImportGraphParams {
  ast: Program;
  filePath: string;
}

type Path = string;
type Dependencies = string[];

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
