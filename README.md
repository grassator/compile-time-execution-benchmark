# Completely Unscientific Compile Time Execution Benchmark

## Methodology

Each programs runs a counter 1 000 000 times at compile time and stores a result into a compile-time constant. The counter is then printed at runtime to verify the output value.

I'm also inspecting the generated assembly (x86_64) to verify that the value is indeed computed at compile time.

All test are performed in Windows 10. The test are run 10 times with the best result take. The compilation time is measured with PowerShell on windows:

```ps
 Measure-Command { COMMAND | Out-Host }
```

And with `time` command on Linux (WSL) taking the "real" time output:

```bash
 time COMMAND
```

To measure just the compiled time execution and not the rest of the compiler the code is first compiler with the constant hard-coded, then with the compile time execution and get the difference.

All code is compiled without any optimization to minimize the non-relevant time spent in the compiler. Below you can find the version of the compiler and commands used.

### MSVC

**Version**: 19.28.29337 for x64

```ps
cl /Od SOURCE_FILE
```

### Clang (WSL2)

**Version**: clang version 10.0.0-4ubuntu1

```ps
clang -O0 SOURCE_FILE
```


### [Zig](http://ziglang.org)

**Version**: zig-windows-x86_64-0.8.0-dev.1359+e65b6d99a *

> *This is "old" C++ compiler that is known to be quite slow. New self-hosted version is being developed that is substantially faster. 

```zig
zig build-exe SOURCE_FILE
```

Compile time execution is run with @setEvalBranchQuota(10000000);

Zig does very aggressive caching, so make sure to remove all artifacts and `zig-cache` folder between the builds. Since we are measuring the delta, the time it takes to compile standard libraries should not affect the result (much).

### [Mass](https://github.com/grassator/mass)

**Version**: Commit 305f95d634f14ff1460fb41fe8c9c8dceb7ed723 (/Ox build)

```ps
.\build\mass.exe ..\compile-time-benchmark\SOURCE_FILE
```

## Counter

In this benchmark the goal is count from 0 to 1 000 000 integer inside of a loop at compile time. It should give an indication on the overhead of the interpretation inside the compiler.

### Results:

All times are provided in milliseconds.

Language     | Hardcoded | Compile Eval | Delta (ms) | X Times Slower
------------ | ----------|--------------|------------|----------------
Mass         | 12        | 16           | 4          | baseline
C++ (MSVC)   | 330       | 2270         | 1940       | 485x
C++ (CLang)  | 1065      | 1874         | 809        | 202x
Zig          | 1220      | 11714        | 10494      | 2623x

Results are pretty much what you would expect considering that both C++ and Zig do interpretation while Mass does a single-pass JIT. CLang seems to do reasonably well for an interpreter although doing anything computationally expensive would still slow down your compilation time dramatically.

## Constant Folding

The goal is to constant fold 1 000 definitions computing the sum of integer `1`. We then sum all the definitions at compile time as well to make sure that the compilers do not skip the computation for unreferenced constants.

Because of the large amount of source code, the test not only measures the speed of constant folding itself but also parsing as there is almost 2mb of the source code.

This test does not require compile-time machinery and should work in any language, but for consistency I'm sticking with C++, Zig and Mass.

### Results:

> Hardcoded times are same as in the loop test as the rest of the code besides the constant folding is also identical.

Language     | Hardcoded | Constant Folding | Delta (ms) | X Times Slower
------------ | ----------|------------------|------------|----------------
Mass         | 12        | 1389             | 1377       | 3.65x
C++ (MSVC)   | 330       | 1190             | 860        | 2.28x
C++ (CLang)  | 1065      | 1442             | 377        | baseline
Zig          | 1220      | 3818             | 2598       | 6.89x

Clang unsurprisingly is the fastest here as constant folding is its bread and butter. MSVC is slightly behind and Zig is almost 7x slower.

Mass is a bit less than 4 times slower than Clang. Constant folding currently does not actually go through JIT and it is unclear if it will. After poking a bit under the hood I can see that the majority of time is actually spend in parsing as it is currently O(n^2) in complexity. There is definitely lots of improvement to be done.

## One Million Calls

The goal is to compile a file that contains 1 000 000 calls to a `print` function defined in the same value.

### Results:

> Hardcoded times are same as in the loop test as the rest of the code besides the constant folding is also identical.

Language     | Compilation, ms  | X Times Slower | Throughput (mb / sec)
------------ | -----------------|----------------|----------------------
Mass         | 4317             | baseline       | 1.99
C++ (MSVC)   | 19510            | 4.52x          | 0.44
C++ (CLang)  | 9712             | 2.25x          | 0.88
Zig*         | 19258            | 4.46x          | 0.45

Mass has an unfair advantage here as it does not support debug symbols.

> *Self-hosted version of Zig that is in development at the time of writing is reported to be able to complete this test in less than one second which would make it a clear winner.
