import { effect } from './effect.js'
import { computed } from './computed.js'

// 存储副作用的桶
const bucket = new WeakMap()

export function track(target, key) {
    if (!window.activeEffect) {return target[key] }
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

export function trigger(target, key) {
    const depsMap = bucket.get(target)
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key)
    // 会无限执行
    // effects && effects.forEach(fn => {
    //     fn()
    // });
    const effectsToRun = new Set()
    effects && effects.forEach(effectFn => {
        if (effectFn !== window.activeEffect) {
            effectsToRun.add(effectFn)
        }
    })
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
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, newVal) {
        // 设置属性值
        target[key] = newVal
        return trigger(target, key)
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