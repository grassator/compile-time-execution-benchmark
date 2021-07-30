# Completely Unscientific Compile Time Execution Benchmark

## Methodology

All test are performed on Windows 10.

To measure just the compiled time execution and not the rest of the compiler the code is first compiled with the constant hard-coded, then with the compile-time execution and get the difference.

All code is compiled without any optimization to minimize the non-relevant time spent in the compiler. Below you can find the version of the compiler and commands used.

### MSVC

    cl /nologo /Od SOURCE_FILE

### Clang (Windows)

    clang-cl -Od SOURCE_FILE

### [Zig](http://ziglang.org)

> *This is non-self-hosted version that is known to be quite slow.

    zig build-exe -ODebug SOURCE_FILE

Compile time execution is run with @setEvalBranchQuota(10000000);

Zig does very aggressive caching, so make sure to remove all artifacts and `zig-cache` folder between the builds. Since we are measuring the delta, the time it takes to compile standard libraries should not affect the result (much).

### [Mass](https://github.com/grassator/mass)

    .\build\mass.exe ..\compile-time-benchmark\SOURCE_FILE

## Counter

In this benchmark the goal is count from 0 to 1 000 000 integer in a loop at compile time. It should give an indication on the overhead of the interpretation inside the compiler.

### Results:

All times are provided in milliseconds.

Language     | Hardcoded | Compile Time | Delta (ms) | X Times Slower
------------ | ----------|--------------|------------|----------------
Mass         | 12        | 16           | 4          | baseline
C++ (MSVC)   | 330       | 2270         | 1940       | 485x
C++ (CLang)  | 1065      | 1874         | 809        | 202x
Zig          | 1220      | 11714        | 10494      | 2623x

Results are pretty much what you would expect considering that both C++ and Zig do interpretation while Mass does a single-pass JIT. CLang seems to do reasonably well for an interpreter although doing anything computationally expensive would still slow down your compilation time dramatically.

## Constant Folding

The goal is to constant fold 1000 definitions each computing the sum of 1000 `1` integers.

Because of the large amount of source code, the test not only measures the speed of constant folding itself, but also parsing, as there is almost 2mb of the source code.

This test does not require compile-time machinery and should work in any language, but for consistency I'm sticking with C++, Zig and Mass.

### Results:

> Hardcoded times are same as in the loop test as the rest of the code besides the constant folding is also identical.

Language     | Hardcoded | Constant Folding | Delta (ms) | X Times Slower
------------ | ----------|------------------|------------|----------------
Mass         | 12        | 2880             | 2868       | 7.61x
C++ (MSVC)   | 330       | 1190             | 860        | 2.28x
C++ (CLang)  | 1065      | 1442             | 377        | baseline
Zig          | 1220      | 3818             | 2598       | 6.89x

There are two big bottlenecks for Mass in this code:
  - Each `+` operator is first text-expanded via a macro
  - There is overload resolution happening for each `+` operator

## One Million Calls

The goal is to compile a file that contains 1 000 000 calls to a `print` function defined in the same value.

### Results:

> Hardcoded times are same as in the loop test as the rest of the code besides the constant folding is also identical.

Language     | Compilation, ms  | X Times Slower | Throughput (mb / sec)
------------ | -----------------|----------------|----------------------
Mass         | 1609             | baseline       | 5.33
C++ (MSVC)   | 19510            | 12.13x         | 0.44
C++ (CLang)  | 9712             | 6.04x          | 0.88
Zig*         | 19258            | 11.97x         | 0.45

Mass has an unfair advantage here as it does not support debug symbols.

> *Self-hosted version of Zig that is in development at the time of writing is reported to be able to complete this test in less than one second which would make it a clear winner.
