#include <cstdio>
#include <cstdint>
#include <cinttypes>

constexpr uint64_t counter() {
    uint64_t i = 0;
    for (; i < 1000000; i = i + 1);
    return i;
}

const uint64_t counted = 1000000;

int main() {
  printf("%" PRIu64, counted);
}
