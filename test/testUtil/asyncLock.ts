export function makeAsyncLock<T = void>() {
    let ret: any = null
    const promise = new Promise<T>((resolve, reject) => {
        ret = { resolve, reject }
    })

    return {
        resolve: (v => { ret.resolve(v); return new Promise<void>((resolve) => resolve()) }) as (value: T | PromiseLike<T>) => Promise<void>,
        reject: (v => { ret.reject(v); return new Promise<void>((resolve) => resolve()) }) as (reason?: any) => Promise<void>,
        promise
    }
}