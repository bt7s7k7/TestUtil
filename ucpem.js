/// <reference path="./.vscode/config.d.ts" />
const { project, constants, join, run, ucpem } = require("ucpem");
// @ts-check

project.prefix("test").res("testUtil")

project.script("init", async (args) => {
    const target = constants.installPath
    const source = constants.projectPath

    const fs = require("fs")

    /** @type {Array<string | (() => Promise<void>)>} */
    const operations = [
        "package.json",
        async () => {
            console.log("Setting correct values in package.json...")
            const packagePath = join(target, "package.json");
            const packageContent = fs.readFileSync(packagePath).toString()

            fs.writeFileSync(packagePath, packageContent.replace(/test-util/, constants.installName))
        },
        "tsconfig.json",
        ".gitignore",
        async () => {
            console.log("Initializing UCPeM...")
            await ucpem("init", target)

            console.log("Setting up UCPeM config...")
            fs.appendFileSync(join(target, "ucpem.js"), [
                `const { project, github } = require("ucpem")\n// @ts-check`,
                `const src = project.prefix("src")`,
                `project.prefix("test").use(github("bt7s7k7/TestUtil").res("testUtil"))`
            ].join("\n\n"))

            console.log("Setting up filesystem structure...")
            fs.mkdirSync(join(target, "src"))
            fs.mkdirSync(join(target, "test"))

            console.log("Installing UCPeM packages...")
            await ucpem(`install`, target)
            await ucpem(`sync with all`, target)

            console.log("Installing yarn packages...")
            await run("yarn", target)

            console.log("Setting up GIT...")
            await run(`git init && git add . && git commit -m "Initial commit"`, target)
        },
    ]

    for (const operation of operations) {
        if (typeof operation == "string") {
            console.log(`Copying ${operation}...`)
            fs.copyFileSync(join(source, operation), join(target, operation))
        } else {
            await operation()
        }
    }
}, {
    desc: "Creates a new project with testing and all that. Requires yarn and such."
})