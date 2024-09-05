// 用全局变量存储被注册的副作用函数
window.activeEffect = null;
// effect 栈
const effectStack = [];

// effect 函数用于注册副作用函数
export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    window.activeEffect = effectFn;
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(window.activeEffect);
    const res = fn();
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
    effectStack.pop();
    window.activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  // 用来存储所有与副作用函数相关联的依赖集合
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }

  effectFn.deps.length = 0;
}
