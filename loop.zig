const std = @import("std");

fn counter() i64 {
    @setEvalBranchQuota(10000000);
    var i: i64 = 0;
    while (i < 1000000) {
        i = i + 1;
    }
    return i;
}

const counted = counter();

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("{}", .{counted});
}
