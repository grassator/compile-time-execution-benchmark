
const std = @import("std");

const counted : i64 = 1000000;


pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{}", .{counted});
}
