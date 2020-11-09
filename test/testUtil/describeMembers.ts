type Callback<T extends { constructor: Function }> = ((instance: T) => void) | null

export function describeMembers<T extends { constructor: Function }, C extends { [P in keyof T]?: Callback<T> } & Record<string, Callback<T>>>(factory: () => T, callbacks: C) {
    const instance = factory()

    describe(instance.constructor.name, () => {
        const members = new Set([...Object.getOwnPropertyNames(instance), ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance)), ...Object.keys(callbacks)])
        for (const key of members) {
            const name = "." + key
            const callback = (callbacks as any)[key] as Callback<T>
            if (callback != null) describe(name, () => callback(factory()))
            else if (name[0] == "." && callback !== null) it(name)
        }
    })
}