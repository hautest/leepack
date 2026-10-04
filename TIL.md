## 번들러에서 모듈 별로 스코프를 격리시키는 2개의 방법

1. 객체를 return하는 함수로 만든다.

```js
// dist/bundle.js
function addModule() {
  const add = (a, b) => a + b;
  return { add };
}

function indexModule() {
  const { add } = addModule();
  console.log(add(1, 2));
}

indexModule();
```

2. 모듈들을 하나의 스코프로 합치고, 충돌하는 변수 이름과 참조를 변경한다. (scope hoisting)

```js
// 설명용 번들: a.js와 b.js에 각각 있던 value의 이름과 참조를 함께 바꾼다.

// a.js: export const value = 1;
const a_value = 1;

// b.js: export const value = 2;
const b_value = 2;

// index.js에서 두 모듈의 value를 사용하는 부분
console.log(a_value, b_value); // 1, 2
```
