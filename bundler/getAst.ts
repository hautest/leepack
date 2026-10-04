import { parse } from "acorn";
import { getSourceType } from "./getSourceType.ts";
import { readFile } from "node:fs/promises";

interface GetAstParams {
  entry: string;
}

/**
 * 파일을 UTF-8로 읽고 Acorn으로 파싱해 AST를 반환한다.
 * 현재 실행 디렉터리의 package.json에서 sourceType을 읽는다.
 * 파일을 읽는 함수이며, 읽은 JavaScript를 실행하지는 않는다.
 *
 * @param params.entry - 파싱할 파일 경로. 상대 경로는 현재 실행 디렉터리 기준이다.
 * @returns Acorn Program의 Promise. body에 파일 최상위 문장들의 AST 노드가 들어 있다.
 * @throws 파일 읽기, package.json 해석 또는 JavaScript 파싱에 실패했을 때.
 * @example
 * const ast = await getAst({ entry: "src/math/add.js" });
 * // ast.type → "Program"
 * // ast.body[0].type → "ExportNamedDeclaration" (현재 add.js 기준)
 */
export const getAst = async ({ entry }: GetAstParams) => {
  const entryFile = await readFile(entry, "utf-8");
  const sourceType = await getSourceType({
    packageJsonPath: "package.json",
  });

  return parse(entryFile, {
    ecmaVersion: "latest",
    sourceType,
  });
};
