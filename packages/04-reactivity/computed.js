import { effect } from './effect.js'
import { track, trigger } from './index.js'

export function computed(getter) {
    let value // value 用来缓存上一次计算的值
    let dirty = true // 用来标识是否需要重新计算值，为 true 则意味着需要重新计算
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            dirty = true
            // 当计算属性依赖的响应式数据变化时，手动调用trigger函数触发响应
            trigger(obj, 'value')
        }
    })

    const obj = {
        get value() {
            if (dirty) {
                value = effectFn()
                dirty = false
            }
            // 当读取 value 时，手动调用track函数进行追踪
            debugger
            track(obj, 'value')
            return value
        }
    }

    return obj
}