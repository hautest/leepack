import { getAst } from "./getAst.ts";
import { resolve } from "node:path";
import { getImportGraph } from "./getImportGraph.ts";
import { createModuleMap } from "./createModuleMap.ts";

interface BundlingParams {
  entry: string;
}

export const bundling = async ({ entry }: BundlingParams) => {
  const ast = await getAst({ entry });
  const importGraph = await getImportGraph({
    ast,
    filePath: resolve(entry),
  });
  const moduleMap = createModuleMap({ importGraph });
  console.log(moduleMap);
};

bundling({ entry: "src/index.js" });
