import { resolve } from "node:path";
import { getImportGraph } from "./utils/getImportGraph.ts";
import { getAst } from "./utils/getAst/getAst.ts";

interface BundlingParams {
  entry: string;
}

export const bundling = async ({ entry }: BundlingParams) => {
  const ast = await getAst({ entry });

  const importGraph = await getImportGraph({
    ast,
    filePath: resolve(entry),
  });

  console.log(importGraph);
};

bundling({
  entry: "src/index.js",
});
