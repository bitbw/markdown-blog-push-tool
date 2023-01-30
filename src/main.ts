// src/main.js
// import { version } from "../package.json";
import path from "path";
import test from "./foo";
const main = (): void => {
  const newPath = path.join("a", "b");
  console.log("[Bowen] ===== main ===== test", test);
  console.log("[Bowen] ===== newPath", newPath);
};

export default main;
