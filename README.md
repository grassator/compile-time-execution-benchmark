## Completely Unscientific Compile Time Execution Benchmark

### Methodology

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

All code is compiled without any optimization to minimize the non-relevant time spent in the compiler.

### C++

C++ has support for `constepxr` that can contain loops:

```cpp
constexpr uint64_t counter() {
    uint64_t i = 0;
    for (; i < 1000000; i = i + 1);
    return i;
}

const uint64_t counted = counter();
```

#### MSVC

**Version**: 19.28.29337 for x64

The command used:

```ps
cl /Od loop.cpp
```

#### Clang (WSL2)

**Version**: clang version 10.0.0-4ubuntu1

The command used:

```ps
clang -O0 .\loop.cpp -o loop.exe
```


### [Zig](http://ziglang.org)

**Version**: zig-windows-x86_64-0.8.0-dev.1359+e65b6d99a

In Zig, there is a very low quoata for any compile time execution, so if we run the following code, we get an error (evaluation exceeded 1000 backwards branches):

```zig
fn counter() i64 {
    var i: i64 = 0;
    while (i < 1000000) {
        i = i + 1;
    }
    return i;
}

const counted = counter(); 
```

To fix this I needed to add `@setEvalBranchQuota(10000000);` to the body of the `counter()` function.

The compilation is done with:

```zig
zig build-exe loop.zig
```

Zig does very aggressive caching, so make sure to remove all artifacts and `zig-cache` folder between the builds. Since we are measuring the delta, the time it takes to compile standard libraries should not affect the result (much).

### [Mass](https://github.com/grassator/mass)

**Version**: Commit a387bb84155eceff12ff373512c5044452cf9e22 (/Ox build)

The counter code is:

```zig
counter :: () -> (s64) {
  i := 0
  while i < 1000000 { i = i + 1 }
  i
}
counted :: counter()
```

The compiler currently can not be run from the any folder so I had to run it from the project repository instead:

```ps
.\build\mass.exe ..\compile-time-benchmark\loop.mass
```

### Results:

Language     | Hardcoded | Compile Eval | Delta (ms) | X Times Slower
------------ | ----------|--------------|------------|----------------
Mass         | 12        | 16           | 4          | baseline
C++ (MSVC)   | 330       | 2270         | 1940       | 485x
C++ (CLang)  | 1065      | 1874         | 809        | 202x
Zig          | 1220      | 11714        | 10494      | 2623x

Results are pretty much what you would expect considering that both C++ and Zig do interpetation while Mass does a single-pass JIT. CLang seems to do reasonably well for an interpreter although doing anything computationally expensive would stilll slow down your compilation time dramatically.
