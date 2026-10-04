import type { Program } from "acorn";

interface GetModuleExportPartsParams {
  ast: Program;
}

export interface ModuleExportPart {
  /** 현재 파일의 값을 내보내면 null, 재내보내기라면 대상 경로. */
  source: string | null;
  bindings: {
    /** 원래 이름. 재내보내기에서는 대상 모듈이 내보낸 이름이다. */
    local: string;
    /** 이 모듈이 외부에 제공할 이름. */
    exported: string;
  }[];
}

/**
 * named export의 원래 이름과 내보낼 이름을 추출한다.
 * 변수·함수·클래스 선언, export 목록, named 재내보내기를 지원한다.
 * AST를 수정하거나 코드를 생성하지 않는다.
 *
 * @param params.ast - 대상 파일을 파싱한 Acorn AST.
 * @returns export 문별 source와 bindings 배열. export가 없으면 빈 배열.
 * @throws default export, export *, 구조 분해 변수 선언은 현재 지원하지 않는다.
 * @example
 * // export const greet = (name) => name;
 * // → [{ source: null, bindings: [{ local: "greet", exported: "greet" }] }]
 * // export { add as sum } from "./add.js";
 * // → [{ source: "./add.js", bindings: [{ local: "add", exported: "sum" }] }]
 */
export const getModuleExportParts = ({
  ast,
}: GetModuleExportPartsParams): ModuleExportPart[] => {
  const parts: ModuleExportPart[] = [];

  for (const node of ast.body) {
    if (
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportAllDeclaration"
    ) {
      throw new Error("default export와 export *는 아직 지원하지 않습니다.");
    }
    if (node.type !== "ExportNamedDeclaration") continue;

    const source = node.source ? node.source.value : null;
    if (source !== null && typeof source !== "string") {
      throw new Error("재내보내기 경로는 문자열이어야 합니다.");
    }

    const bindings: ModuleExportPart["bindings"] = [];
    const declaration = node.declaration;

    if (declaration?.type === "VariableDeclaration") {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type !== "Identifier") {
          throw new Error("export 구조 분해 선언은 아직 지원하지 않습니다.");
        }
        const name = declarator.id.name;
        bindings.push({ local: name, exported: name });
      }
    } else if (declaration) {
      if (!declaration.id) throw new Error("export 선언에 이름이 없습니다.");
      const name = declaration.id.name;
      bindings.push({ local: name, exported: name });
    } else {
      for (const specifier of node.specifiers) {
        const local = specifier.local.type === "Identifier"
          ? specifier.local.name
          : specifier.local.value;
        const exported = specifier.exported.type === "Identifier"
          ? specifier.exported.name
          : specifier.exported.value;
        if (typeof local !== "string" || typeof exported !== "string") {
          throw new Error("export 이름은 문자열이어야 합니다.");
        }
        bindings.push({ local, exported });
      }
    }

    parts.push({ source, bindings });
  }

  return parts;
};
