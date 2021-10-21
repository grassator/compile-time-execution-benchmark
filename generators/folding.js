const fs = require("fs");

const cpp = body => `
#include <cstdio>
#include <cstdint>
#include <cinttypes>

${body}

int main() {
  printf("%" PRIi64, counted);
}
`;

{
  const definitions = Array.from({length: 1000}).map((_, i) => {
    const expr = Array.from({length: 1000}).fill(1).join("+");
    return `const int64_t c${i} = ${expr};\n`
  }).join("");
  const expr = Array.from({length: 1000}).map((_, i) => `c${i}`).join("+");
  const counted = `const int64_t counted = ${expr};\n`
  const body = definitions + counted;
  fs.writeFileSync("folding.cpp", cpp(body));
}


const zig = body => `
const std = @import("std");

${body}

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{}", .{counted});
}
`;

{
  const definitions = Array.from({length: 1000}).map((_, i) => {
    const expr = Array.from({length: 1000}).fill(1).join("+");
    return `const c${i}: i64 = ${expr};\n`
  }).join("");
  const expr = Array.from({length: 1000}).map((_, i) => `c${i}`).join("+");
  const counted = `const counted : i64 = ${expr};\n`
  const body = definitions + counted;
  fs.writeFileSync("folding.zig", zig(body));
}


const js = body => `

${body}

console.log(counted)
`;

{
  const definitions = Array.from({length: 1000}).map((_, i) => {
    const expr = Array.from({length: 1000}).fill(1).join("+");
    return `const c${i} = ${expr};\n`
  }).join("");
  const expr = Array.from({length: 1000}).map((_, i) => `c${i}`).join("+");
  const counted = `const counted = ${expr};\n`
  const body = definitions + counted;
  fs.writeFileSync("folding.js", js(body));
}


const mass = body => `
${body}

main :: fn() {
  io :: import("std/io")
  process :: import("std/process")
  io.print(counted)
  process.exit(0)
}
`;

{
  const definitions = Array.from({length: 1000}).map((_, i) => {
    const expr = Array.from({length: 1000}).fill(1).join("+");
    return `c${i} :: ${expr}\n`
  }).join("");
  const expr = Array.from({length: 1000}).map((_, i) => `c${i}`).join("+");
  const counted = `counted :: ${expr}\n`
  const body = definitions + counted;
  fs.writeFileSync("folding.mass", mass(body));
}
