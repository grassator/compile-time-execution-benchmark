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


const mass = body => `
fn main() {
${body}
  ExitProcess(0)
}

fn print() {
  WriteFile(0, 0, 0, 0, 0)
}

fn ExitProcess(status : s32) -> (s64) external("kernel32.dll", "ExitProcess")
fn WriteFile(
  status : s64,
  buffer : [u8],
  size : s32,
  bytes_written : s64,
  overlapped : s64
) -> (s64) external("kernel32.dll", "WriteFile")
`;

{
  const body = Array.from({length: 1_000_000}).map((_, i) => ` print()\n`).join("");
  fs.writeFileSync("print.mass", mass(body));
}