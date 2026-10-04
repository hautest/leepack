import { readFile } from "node:fs/promises";

interface GetSourceTypeParams {
  packageJsonPath: string;
}

type GetSourceTypeReturn = "module" | "commonjs" | undefined;

/**
 * 지정한 package.json을 읽고 type 필드를 확인한다.
 * 상위 디렉터리 탐색이나 .mjs/.cjs 확장자 판정은 하지 않는다.
 *
 * @param params.packageJsonPath - 읽을 package.json 경로. JSON 내용 자체가 아니다.
 * @returns "module" 또는 "commonjs"의 Promise. type이 없거나 다른 값이면 undefined.
 * @throws 파일을 읽을 수 없거나 JSON 해석 및 필드 접근이 실패했을 때.
 * @example
 * await getSourceType({ packageJsonPath: "package.json" });
 * // 파일 내용에 "type": "module"이 있으면 "module"
 */
export const getSourceType = async ({
  packageJsonPath,
}: GetSourceTypeParams): Promise<GetSourceTypeReturn> => {
  const packageJson = await readFile(packageJsonPath, "utf-8");

  const sourceType = JSON.parse(packageJson).type;

  if (sourceType === "module") return sourceType;
  if (sourceType === "commonjs") return sourceType;

  return undefined;
};
