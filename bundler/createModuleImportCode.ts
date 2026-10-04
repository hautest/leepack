import { dirname, resolve } from "node:path";
import type { ModuleImportPart } from "./getModuleImportParts.ts";

interface CreateModuleImportCodeParams {
  filePath: string;
  moduleMap: Readonly<Record<string, string>>;
  importParts: readonly ModuleImportPart[];
  dependencyVariables: Readonly<Record<string, string>>;
}

/**
 * 일반 import의 연결 코드를 만든다. 재내보내기 속성이나 return 문은 만들지 않는다.
 * @param params.filePath - import를 작성한 파일의 절대 경로.
 * @param params.moduleMap - 파일 절대 경로 → 모듈 함수 이름.
 * @param params.importParts - AST에서 추출한 import 경로와 이름 정보.
 * @param params.dependencyVariables - 재내보내기에서 이미 불러오는 대상은 그 변수로 재사용한다.
 * @returns 의존 경로 → 연결 코드 객체. 호출 순서는 바깥에서 그래프 순서에 맞춘다.
 * @example
 * // { "/project/add.js": 'const { "add": sum } = module2();' }
 * // 재내보내기와 대상이 같으면: const { "add": sum } = __reExport0;
 */
export const createModuleImportCode = ({
  filePath,
  moduleMap,
  importParts,
  dependencyVariables,
}: CreateModuleImportCodeParams): Record<string, string> => {
  const groupedBindings = new Map<string, ModuleImportPart["bindings"]>();
  for (const part of importParts) {
    const path = resolve(dirname(filePath), part.source);
    const bindings = groupedBindings.get(path) ?? [];
    bindings.push(...part.bindings);
    groupedBindings.set(path, bindings);
  }

  const codes: Record<string, string> = {};
  for (const [path, bindings] of groupedBindings) {
    const moduleName = moduleMap[path];
    if (!moduleName) throw new Error(`모듈을 찾을 수 없습니다: ${path}`);
    const sharedVariable = dependencyVariables[path];
    const value = sharedVariable ?? `${moduleName}()`;

    if (bindings.length === 0) {
      codes[path] = sharedVariable ? "" : `${moduleName}();`;
      continue;
    }
    const properties = bindings
      .map(({ imported, local }) => `${JSON.stringify(imported)}: ${local}`)
      .join(", ");
    codes[path] = `const { ${properties} } = ${value};`;
  }
  return codes;
};
