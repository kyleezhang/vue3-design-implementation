import { effect } from './effect.js'
import { computed } from './computed.js'

const INTERATE_KEY = Symbol()

// 存储副作用的桶
const bucket = new WeakMap()

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE',
}

export function track(target, key) {
  if (!window.activeEffect) { return target[key] }
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(window.activeEffect)
  window.activeEffect.deps.push(deps)
}

export function trigger(target, key, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== window.activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  if (type === TriggerType.ADD) {
    const interateEffects = depsMap.get(INTERATE_KEY)
    interateEffects && interateEffects.forEach(effectFn => {
      if (effectFn !== window.activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  effectsToRun && effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  });
  return true
}

const data = { foo: 3, bar: 2 }

const obj = new Proxy(data, {
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target) {
    track(target, INTERATE_KEY)
    return Reflect.ownKeys(target)
  },
  set(target, key, newVal, receiver) {
    const type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD
    // 设置属性值
    Reflect.set(target, key, newVal, receiver)
    return trigger(target, key, type)
  }
})

/** 嵌套的 effect 与 effect 栈 */
// let temp1, temp2

// effect(function effectFn1() {
//     console.log('effectFn1执行')

//     effect(function effectFn2() {
//         console.log('effectFn2执行')
//         temp2 = obj.foo
//     })

//     temp1 = obj.bar
// })
// obj.bar++
/** 嵌套的 effect 与 effect 栈 */

/** effect 嵌套计算属性 */
const sumRes = computed(() => obj.foo + obj.bar)
effect(() => {
  console.log(sumRes.value)
})

obj.foo++
/** effect 嵌套计算属性 */