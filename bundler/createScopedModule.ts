interface CreateScopedModuleParams {
  moduleName: string;
  importCode: string;
  body: string;
  exportCode: string;
}

/**
 * 이미 생성한 import 코드·본문·export 코드를 함수 하나로 감싼다.
 * 다른 생성 함수를 호출하거나 입력을 수정하지 않고 문자열만 조합한다.
 *
 * @param params.moduleName - createModuleMap에서 지정한 함수 이름.
 * @param params.importCode - createModuleImportCode가 만든 연결 코드 문자열.
 * @param params.body - getModuleBody로 얻은 본문 문자열.
 * @param params.exportCode - createModuleExportCode가 만든 return 문 문자열.
 * @returns 조합된 함수 선언 문자열. 함수 자체를 실행하지 않는다.
 * @example
 * // moduleName: "module4", importCode: ""
 * // body: "const greet = (name) => name;", exportCode: "return { greet };"
 * // → function module4() { const greet = (name) => name; return { greet }; }
 */
export const createScopedModule = ({
  moduleName,
  importCode,
  body,
  exportCode,
}: CreateScopedModuleParams): string => {
  return `function ${moduleName}() {
${importCode}
${body}
${exportCode}
}`;
};
