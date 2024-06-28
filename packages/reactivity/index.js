import { effect } from './effect.js'
// 存储副作用的桶
const bucket = new WeakMap()

const data = { ok: true, text: 'hello world' }

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

function track(target, key) {
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

function trigger(target, key) {
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

effect(function effectFn() {
    console.log('!====hhh')
    document.body.innerText = obj.ok ? obj.text : 'not'
})

setTimeout(() => {
    obj.ok = false
}, 6000)