// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import eslint from "@rollup/plugin-eslint";
import pkg from "./package.json";
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const config = {
  input: "src/main.ts",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
  ],
  plugins: [
    resolve({
      extensions, // 处理的模块扩展名默认不包含 ts 等
    }),
    json(),
    commonjs({
      transformMixedEsModules: true,
    }),
    babel({
      extensions, // Babel 应该转译的文件扩展名数组。如果您想使用此插件转译 TypeScript 文件，则必须在此选项中包含.ts和。.tsx
      babelHelpers: "bundled",
      include: ["src/**/*"],
    }),
    eslint({
      /* your options */
    }),
  ],
};

export default config;
