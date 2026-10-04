import { dirname, resolve } from "node:path";
import type { ModuleExportPart } from "./getModuleExportParts.ts";

interface CreateModuleReExportCodeParams {
  filePath: string;
  moduleMap: Readonly<Record<string, string>>;
  exportParts: readonly ModuleExportPart[];
  body: string;
  importedLocalNames: readonly string[];
}

/**
 * named 재내보내기만 처리한다. 대상 모듈 호출 코드와 반환 객체에 넣을 속성을 만든다.
 * 같은 대상은 한 번만 호출하도록 묶는다. 직접 export는 처리하지 않는다.
 * @param params.filePath - 현재 파일의 절대 경로.
 * @param params.moduleMap - 의존 파일 경로 → 모듈 함수 이름.
 * @param params.exportParts - source가 있는 항목만 재내보내기로 처리한다.
 * @param params.body - 임시 변수 이름이 원본에 등장하는지 확인할 본문.
 * @param params.importedLocalNames - import로 만들어질 변수 이름. 임시 이름 충돌을 피한다.
 * @returns importCodes: 경로별 호출 코드, exportProperties: 반환 속성 배열,
 * dependencyVariables: 같은 대상을 import할 때 재사용할 변수 이름표.
 * @example
 * // export { add as sum } from "./add.js";
 * // importCodes: { "/project/add.js": "const __reExport0 = module2();" }
 * // exportProperties: ['"sum": __reExport0["add"]']
 * // dependencyVariables: { "/project/add.js": "__reExport0" }
 */
export const createModuleReExportCode = ({
  filePath,
  moduleMap,
  exportParts,
  body,
  importedLocalNames,
}: CreateModuleReExportCodeParams) => {
  const importCodes: Record<string, string> = {};
  const dependencyVariables: Record<string, string> = {};
  const exportProperties: string[] = [];
  const reservedNames = new Set([...Object.values(moduleMap), ...importedLocalNames]);
  let index = 0;

  for (const part of exportParts) {
    if (part.source === null) continue;

    const path = resolve(dirname(filePath), part.source);
    let variable = dependencyVariables[path];
    if (!variable) {
      const moduleName = moduleMap[path];
      if (!moduleName) throw new Error(`모듈을 찾을 수 없습니다: ${path}`);

      variable = `__reExport${index}`;
      while (body.includes(variable) || reservedNames.has(variable)) variable += "_";
      reservedNames.add(variable);
      dependencyVariables[path] = variable;
      importCodes[path] = `const ${variable} = ${moduleName}();`;
      index += 1;
    }

    for (const { local, exported } of part.bindings) {
      exportProperties.push(`${JSON.stringify(exported)}: ${variable}[${JSON.stringify(local)}]`);
    }
  }

  return { importCodes, exportProperties, dependencyVariables };
};
