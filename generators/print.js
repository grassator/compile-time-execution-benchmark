const fs = require("fs");

const cpp = body => `
#include <cstdio>
#include <cstdint>
#include <cinttypes>

void print() {}

int main() {
${body}
  return 0;
}
`;

{
  const body = Array.from({length: 1_000_000}).map((_, i) => `print();\n`).join("");
  fs.writeFileSync("print.cpp", cpp(body));
}


const zig = body => `
fn print() void {}

pub fn main() !void {
  ${body}
}
`;

{
  const body = Array.from({length: 1_000_000}).map((_, i) => `print();\n`).join("");
  fs.writeFileSync("print.zig", zig(body));
}

const js = body => `
function print() {}

${body}
`;

{
  const body = Array.from({length: 1_000_000}).map((_, i) => `print();\n`).join("");
  fs.writeFileSync("print.js", js(body));
}


const mass = body => `
main :: fn() {
${body}
  
  process :: import("std/process")
  process.exit(0)
}

print :: fn() {
  io :: import("std/io")
  io.print("")
}
`;

{
  const body = Array.from({length: 1_000_000}).map((_, i) => ` print()\n`).join("");
  fs.writeFileSync("print.mass", mass(body));
}
