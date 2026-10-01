import { readFile } from "node:fs/promises";

interface BundlingParams {
  entry: string;
}

export const bundling = async ({ entry }: BundlingParams) => {
  const entryFile = await readFile(entry, "utf-8");

  console.log(entryFile);
};

bundling({
  entry: "src/index.js",
});
