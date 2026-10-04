import { getAst } from "./getAst.ts";
import { resolve } from "node:path";
import { getImportGraph } from "./getImportGraph.ts";
import { createModuleMap } from "./createModuleMap.ts";
import { readFile } from "node:fs/promises";
import { getModuleBody } from "./getModuleBody.ts";
import { getModuleExportParts } from "./getModuleExportParts.ts";
import { createScopedModule } from "./createScopedModule.ts";
import { getModuleImportParts } from "./getModuleImportParts.ts";
import { createModuleImportCode } from "./createModuleImportCode.ts";
import { createModuleExportCode } from "./createModuleExportCode.ts";
import { createModuleReExportCode } from "./createModuleReExportCode.ts";

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
  const moduleCodes: Record<string, string> = {};

  for (const [path, dependencies] of importGraph) {
    const source = await readFile(path, "utf-8");
    const moduleAst = await getAst({ entry: path });
    const body = getModuleBody({ source, ast: moduleAst });
    const exportParts = getModuleExportParts({ ast: moduleAst });
    const importParts = getModuleImportParts({ ast: moduleAst });

    const reExportResult = createModuleReExportCode({
      filePath: path,
      moduleMap,
      exportParts,
      body,
      importedLocalNames: importParts.flatMap((part) =>
        part.bindings.map((binding) => binding.local),
      ),
    });

    const importCodes = createModuleImportCode({
      filePath: path,
      moduleMap,
      importParts,
      dependencyVariables: reExportResult.dependencyVariables,
    });

    const exportCode = createModuleExportCode({
      exportParts,
      reExportProperties: reExportResult.exportProperties,
    });

    // 원본 의존 순서를 유지한다. 대상이 같으면 재내보내기에서 불러온 값을 import도 사용한다.
    const importCode = dependencies
      .flatMap((dependency) => [
        reExportResult.importCodes[dependency],
        importCodes[dependency],
      ])
      .filter((code) => Boolean(code))
      .join("\n");

    moduleCodes[path] = createScopedModule({
      moduleName: moduleMap[path],
      importCode,
      body,
      exportCode,
    });
  }

  // console.log(Object.values(moduleCodes).join("\n\n"));
  console.log(moduleCodes);
  return moduleCodes;
};

bundling({ entry: "src/index.js" });
