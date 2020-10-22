export function describeMember(member: () => void, callback: () => void) {
    const source = member.toString()
    let name = source.split(" ").pop()!.split(".").pop()!
    if (name[0].toLowerCase() == name[0]) name = "." + name
    describe(name, callback)
}