function counter() {
  let i = 0;
  for (; i < 1000000; i = i + 1) {}
  return i;
}

const counted = counter();

console.log(counted);
