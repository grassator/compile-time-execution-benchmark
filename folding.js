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


const mass = body => `
${body}

fn main() {
  print(counted)
  ExitProcess(0)
}

fn print(integer : s64) {
  const count = {
    mut count = 0
    for mut temp = integer ; temp ; temp = temp / 10 {
      count = count + 1
    }
    if count then count else 1
  }

  stack buffer u8[64]
  const output_size = {
    if integer < 0 then {
      static minus_code = "-".bytes.0
      buffer.0 = minus_code
      integer = 0 - integer
      count + 1
    } else {
      count
    }
  }

  for mut integer_index = 0 ; integer_index < count ; {
    integer_index = integer_index + 1
    const digit = cast(u8, integer % 10)
    const digit_index = output_size - integer_index
    static zero_code = "0".bytes.0
    buffer.(digit_index) = zero_code + digit
    integer = integer / 10
  }
  WriteFile(GetStdHandle(-11), &buffer, cast(s32, output_size), 0, 0)
}

fn ExitProcess(status : s32) -> (s64) external("kernel32.dll", "ExitProcess")
fn GetStdHandle(handle : s32) -> (s64) external("kernel32.dll", "GetStdHandle")
fn WriteFile(
  status : s64,
  buffer : [u8],
  size : s32,
  bytes_written : s64,
  overlapped : s64
) -> (s64) external("kernel32.dll", "WriteFile")
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