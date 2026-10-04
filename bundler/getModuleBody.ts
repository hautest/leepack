import type { Program } from "acorn";

interface GetModuleBodyParams {
  source: string;
  ast: Program;
}

/**
 * 원본에서 모듈 함수 안에 넣을 본문 문자열을 추출한다.
 * import 문은 제외하고, export 선언은 export 표시를 뺀 선언만 남긴다.
 * 일반 문장은 원래 순서대로 유지한다. 입력 AST와 원본은 수정하지 않는다.
 *
 * @param params.source - ast를 파싱할 때 사용한 원본 코드 문자열.
 * @param params.ast - source에 해당하는 Acorn AST.
 * @returns 본문 코드 문자열. 파일 읽기, 함수 래핑, import 연결은 하지 않는다.
 * export 목록과 재내보내기는 본문에서 제외한다. 연결과 반환 코드는 별도로 생성해야 한다.
 * @throws default export와 export *는 아직 지원하지 않는다.
 * @example
 * // source: 'import { offset } from "./offset.js";\nexport const value = offset + 1;'
 * getModuleBody({ source, ast });
 * // 'const value = offset + 1;'
 */
export const getModuleBody = ({ source, ast }: GetModuleBodyParams): string => {
  const bodyParts: string[] = [];

  for (const node of ast.body) {
    if (node.type === "ImportDeclaration") continue;

    if (node.type === "ExportNamedDeclaration") {
      if (!node.declaration) continue;

      const declaration = node.declaration;
      bodyParts.push(source.slice(declaration.start, declaration.end));
      continue;
    }

    if (
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportAllDeclaration"
    ) {
      throw new Error("default export와 export *는 아직 지원하지 않습니다.");
    }

    bodyParts.push(source.slice(node.start, node.end));
  }

  return bodyParts.join("\n");
};
