import { readFile } from "node:fs/promises";

interface GetSourceTypeParams {
  packageJsonPath: string;
}

type GetSourceTypeReturn = "module" | "commonjs" | undefined;

export const getSourceType = async ({
  packageJsonPath,
}: GetSourceTypeParams): Promise<GetSourceTypeReturn> => {
  const packageJson = await readFile(packageJsonPath, "utf-8");

  const sourceType = JSON.parse(packageJson).type;

  if (sourceType === "module") return sourceType;
  if (sourceType === "commonjs") return sourceType;

  return undefined;
};
