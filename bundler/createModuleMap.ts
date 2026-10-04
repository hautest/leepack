interface CreateModuleMapParams {
  importGraph: ReadonlyMap<string, readonly string[]>;
}

/**
 * 그래프의 파일 경로마다 module0부터 순서대로 이름을 붙인다.
 * 원본 그래프는 수정하지 않고 경로를 키로 갖는 새 객체를 반환한다.
 *
 * @param params.importGraph - 파일 경로를 키로 갖는 의존성 그래프.
 * @returns 파일 경로를 키로, 모듈 이름을 값으로 갖는 객체.
 * @example
 * // { "/project/src/index.js": "module0", "/project/src/add.js": "module1" }
 */
export const createModuleMap = ({ importGraph }: CreateModuleMapParams) => {
  const moduleMap: Record<string, string> = {};
  let moduleId = 0;

  importGraph.forEach((_, path) => {
    moduleMap[path] = `module${moduleId}`;
    moduleId += 1;
  });

  return moduleMap;
};
