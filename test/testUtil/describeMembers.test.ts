export function describeMembers<T extends { constructor: Function }, C extends { [P in keyof T]?: ((instance: T) => void) | null }>(factory: () => T, callbacks: C) {
    const instance = factory()

    describe(instance.constructor.name, () => {
        const members = [...Object.getOwnPropertyNames(instance), ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance))]
        for (const key of members) {
            const name = "." + key
            const callback = (callbacks as any)[key] as ((instance: T) => void) | null
            if (callback != null) describe(name, () => callback(factory()))
            else if (name[0] == "." && callback !== null) it(name)
        }
    })
}