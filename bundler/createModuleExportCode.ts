import type { ModuleExportPart } from "./getModuleExportParts.ts";

interface CreateModuleExportCodeParams {
  exportParts: readonly ModuleExportPart[];
  reExportProperties: readonly string[];
}

/**
 * 현재 파일의 export 속성과 이미 생성된 재내보내기 속성을 합쳐 return 문을 만든다.
 * 파일 경로 해석과 의존 모듈 호출은 하지 않는다.
 * @param params.exportParts - AST에서 추출한 export 정보. 직접 export한 값만 여기서 처리한다.
 * @param params.reExportProperties - createModuleReExportCode가 만든 반환 객체 속성 문자열들.
 * @returns 최종 return 문 문자열.
 * @example
 * // return { "localValue": localValue, "add": __reExport0["add"] };
 */
export const createModuleExportCode = ({
  exportParts,
  reExportProperties,
}: CreateModuleExportCodeParams): string => {
  const properties: string[] = [];
  for (const part of exportParts) {
    if (part.source !== null) continue;
    for (const { local, exported } of part.bindings) {
      properties.push(`${JSON.stringify(exported)}: ${local}`);
    }
  }
  return `return { ${[...properties, ...reExportProperties].join(", ")} };`;
};
