import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const config = {
  input: "index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  plugins: [babel()],
  external: ["react", "use-debounce"],
};

export default config;
