const { existsSync, readdirSync, statSync, Stats } = require("fs");
const path = require("path");

/**
 * Pre-order depth-first walk through the directory.
 * This order allows to easily use this function
 * to create mirror directory structure as you go.
 *
 * @param {string} parentPath
 * @param {(path: string, stats: Stats) => void} callback
 */
const walkDir = (parentPath, callback) => {
  if (!existsSync(parentPath)) return;
  const stats = statSync(parentPath);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    const entries = readdirSync(parentPath);
    for (const entry of entries) {
      walkDir(path.join(parentPath, entry), callback);
    }
  }
  callback(parentPath, stats);
};

module.exports = { walkDir };
