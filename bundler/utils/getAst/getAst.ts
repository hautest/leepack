import { parse } from "acorn";
import { getSourceType } from "../getSourceType.ts";
import { readFile } from "node:fs/promises";

interface GetAstParams {
  entry: string;
}

export const getAst = async ({ entry }: GetAstParams) => {
  const entryFile = await readFile(entry, "utf-8");
  const sourceType = await getSourceType({
    packageJsonPath: "package.json",
  });

  return parse(entryFile, {
    ecmaVersion: "latest",
    sourceType,
  });
};
