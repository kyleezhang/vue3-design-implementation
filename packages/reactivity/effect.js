// 用全局变量存储被注册的副作用函数
window.activeEffect = null

// effect 函数用于注册副作用函数
export function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn)
        window.activeEffect = effectFn
        fn()
    }
    // 用来存储所有与副作用函数相关联的依赖集合
    effectFn.deps = []
    effectFn()
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn) 
    }

    effectFn.deps.length = 0
}