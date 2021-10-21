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
  const body = `const int64_t counted = 1000000;\n`
  fs.writeFileSync("baseline.cpp", cpp(body));
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
  const body = `const counted : i64 = 1000000;\n`
  fs.writeFileSync("baseline.zig", zig(body));
}


const js = body => `
${body}

console.log(counted);
`;

{
  const body = `const counted  = 1000000;\n`
  fs.writeFileSync("baseline.js", js(body));
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
  const body = `counted :: 1000000\n`
  fs.writeFileSync("baseline.mass", mass(body));
}
