// src/foo.js
class Test {
  a: string;
  constructor(a: string) {
    this.a = a;
  }
  test() {
    console.log("test!!");
  }
}
const test = new Test("a");

const a = 1;
a.toString();

export default test;
