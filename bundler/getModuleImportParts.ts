import type { Program } from "acorn";

interface GetModuleImportPartsParams {
  ast: Program;
}

export interface ModuleImportPart {
  source: string;
  bindings: {
    imported: string;
    local: string;
  }[];
}

/**
 * AST에서 정적 import의 경로와 이름 정보를 순서대로 추출한다.
 * 파일 읽기, 경로 해석, 연결 코드 생성은 하지 않으며 AST도 수정하지 않는다.
 *
 * @param params.ast - 대상 파일을 파싱한 Acorn AST.
 * @returns import 문마다 source(원본 경로), bindings(가져올 이름과 사용할 이름)를 담은 배열.
 * import가 없으면 빈 배열, 부수 효과 import는 bindings가 빈 배열이다.
 * @throws default import와 namespace import는 현재 지원하지 않는다.
 * @example
 * // 원본: import { add as sum } from "./math/add.js";
 * getModuleImportParts({ ast });
 * // [{ source: "./math/add.js", bindings: [{ imported: "add", local: "sum" }] }]
 */
export const getModuleImportParts = ({
  ast,
}: GetModuleImportPartsParams): ModuleImportPart[] => {
  const parts: ModuleImportPart[] = [];

  for (const node of ast.body) {
    if (node.type !== "ImportDeclaration") continue;
    if (typeof node.source.value !== "string") {
      throw new Error("import 경로는 문자열이어야 합니다.");
    }

    const bindings = node.specifiers.map((specifier) => {
      if (specifier.type !== "ImportSpecifier") {
        throw new Error("현재는 named import와 부수 효과 import만 지원합니다.");
      }

      const imported = specifier.imported.type === "Identifier"
        ? specifier.imported.name
        : specifier.imported.value;
      if (typeof imported !== "string") {
        throw new Error("가져올 이름은 문자열이어야 합니다.");
      }

      return { imported, local: specifier.local.name };
    });

    parts.push({ source: node.source.value, bindings });
  }

  return parts;
};
