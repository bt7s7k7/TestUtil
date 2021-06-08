import { expect } from "chai"

export function tracker(name: string) {
    return {
        count: 0,
        trigger() {
            this.count++
        },
        check(amount = 1) {
            expect(this.count).to.equal(amount, `Tracker "${name}" has not beed triggered the required amount of times; ${this.count} != ${amount}`)
        }
    }
}