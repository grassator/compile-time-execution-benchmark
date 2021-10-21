const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const {walkDir} = require("./walk-dir");

const MASS_FOLDER = `${__dirname}/../mass/`;

function rmdir(rootPath) {
  if (!fs.existsSync(rootPath)) return;
  walkDir(rootPath, (path, stats) => {
    if (stats.isDirectory()) {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  });
}

function clean() {
  console.log("Cleaning...");
  const entries = fs.readdirSync(__dirname);
  for (const entry of entries) {
    if (/\.(obj|pdb|exe|out)/.test(entry)) {
      const entryPath = path.join(__dirname, entry);
      fs.unlinkSync(entryPath)
    }
  }
}

function compileSampleCode() {
  console.log("Generating Sample Code...");
  childProcess.execSync(`node generators/baseline`);
  childProcess.execSync(`node generators/folding`);
  childProcess.execSync(`node generators/print`);
}

/**
 *
 * @param {function():void} closure
 * @returns {number}
 */
function measure(closure) {
  const start = process.hrtime.bigint();
  closure();
  const end = process.hrtime.bigint();
  return Number((end - start) / 1000n) / 1000;
}

function showCompilerVersions() {
  console.log("Compiler versions:");
  const msvcSpawn = childProcess.spawnSync(`cl`, { encoding: "utf8",  })
  const [msvc] = msvcSpawn.stderr.split("\n");
  console.log(`  ${msvc}`);
  const [clang] = childProcess.execSync(`clang-cl --version`, { encoding: "utf8" }).split("\n");
  console.log(`  ${clang}`);
  const [zig] = childProcess.execSync(` zig version`, { encoding: "utf8" }).split("\n");
  console.log(`  Zig: ${zig}`);
  const [mass] = childProcess.execSync(`git rev-parse HEAD`, {
    encoding: "utf8",
    cwd: MASS_FOLDER
  }).split("\n");
  console.log(`  Mass: ${mass}`);
}

/**
 * @param {"baseline"|"folding"|"loop"|"print"} baseName
 * @returns {{zig: number, msvc: number, clang: number, mass: number}}
 */
function timeCompilation(baseName) {
  console.log(`${baseName}:`);
  const mass = measure(() => childProcess.execSync(
    `build\\mass.exe --output ${__dirname}/mass-${baseName}.exe ${__dirname}/${baseName}.mass`, {
      cwd: MASS_FOLDER,
      stdio: "inherit",
    }
  ));
  console.log(`  Mass: ${mass}ms`);
  const msvc = measure(() => childProcess.execSync(`cl /nologo /Od ${baseName}.cpp`));
  console.log(`  MSVC: ${msvc}ms`);
  const clang = measure(() => childProcess.execSync(`clang-cl -Od ${baseName}.cpp`));
  console.log(`  Clang: ${clang}ms`);
  rmdir("zig-cache");
  const zig = measure(() => childProcess.execSync(`zig build-exe -ODebug ${baseName}.zig`));
  console.log(`  Zig: ${zig}ms`);
  return {mass, msvc, clang, zig};
}

function timeAll() {
  console.log("Measuring times...");
  timeCompilation("baseline");
  timeCompilation("folding");
  timeCompilation("print");
  timeCompilation("loop");
}

clean();
compileSampleCode();
showCompilerVersions();
timeAll();
