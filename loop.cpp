#include <cstdio>
#include <cstdint>
#include <cinttypes>

constexpr int64_t counter() {
    int64_t i = 0;
    for (; i < 1000000; i = i + 1);
    return i;
}

const int64_t counted = counter();

int main() {
  printf("%" PRIi64, counted);
}
