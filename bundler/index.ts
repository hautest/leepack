import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import { getSourceType } from "./utils/getSourceType.ts";

interface BundlingParams {
  entry: string;
}

export const bundling = async ({ entry }: BundlingParams) => {
  const entryFile = await readFile(entry, "utf-8");
  const sourceType = await getSourceType({
    packageJsonPath: "package.json",
  });

  const ast = parse(entryFile, {
    ecmaVersion: "latest",
    sourceType,
  });

  console.log(ast);
};

bundling({
  entry: "src/index.js",
});
