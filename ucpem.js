/// <reference path="./.vscode/config.d.ts" />
const { project, constants, join, run, ucpem, log } = require("ucpem")

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
            log("Setting correct values in package.json...")
            const packagePath = join(target, "package.json")
            const packageContent = fs.readFileSync(packagePath).toString()

            fs.writeFileSync(packagePath, packageContent.replace(/test-util/, constants.installName))
        },
        "tsconfig.json",
        ".gitignore",
        async () => {
            log("Initializing UCPeM...")
            await ucpem("init", target)

            log("Setting up UCPeM config...")
            fs.appendFileSync(join(target, "ucpem.js"), [
                `const { project, github } = require("ucpem")\n// @ts-check`,
                `const src = project.prefix("src")`,
                `project.prefix("test").use(github("bt7s7k7/TestUtil").res("testUtil"))`
            ].join("\n\n"))

            log("Setting up filesystem structure...")
            fs.mkdirSync(join(target, "src"))
            fs.mkdirSync(join(target, "test"))

            log("Installing UCPeM packages...")
            await ucpem(`install`, target)
            await ucpem(`sync with all`, target)

            log("Installing yarn packages...")
            await run("yarn", target)

            log("Setting up GIT...")
            await run(`git init && git add . && git commit -m "Initial commit"`, target)
        },
    ]

    for (const operation of operations) {
        if (typeof operation == "string") {
            log(`Copying ${operation}...`)
            fs.copyFileSync(join(source, operation), join(target, operation))
        } else {
            await operation()
        }
    }
}, {
    desc: "Creates a new project with testing and all that. Requires yarn and such."
})

project.script("append", async () => {
    const target = constants.installPath
    const source = constants.projectPath

    const fs = require("fs")

    log("Setting up UCPeM config...")
    fs.appendFileSync(join(target, "ucpem.js"), [
        "",
        `project.prefix("test").use(github("bt7s7k7/TestUtil").res("testUtil"))`
    ].join("\n\n"))

    log("Setting up filesystem structure...")
    fs.mkdirSync(join(target, "test"))


    log("Appending package.json...")
    const targetPackage = JSON.parse(fs.readFileSync(join(target, "package.json")).toString())
    const sourcePackage = JSON.parse(fs.readFileSync(join(source, "package.json")).toString())

    for (const [key, value] of Object.entries(sourcePackage.devDependencies)) {
        if (!(key in targetPackage.devDependencies)) {
            targetPackage.devDependencies[key] = value
        }
    }

    for (const [key, value] of Object.entries(sourcePackage.scripts)) {
        if (!(key in targetPackage.scripts)) {
            targetPackage.scripts[key] = value
        }
    }

    fs.writeFileSync(join(target, "package.json"), JSON.stringify(targetPackage, null, 4))

    log("Installing yarn packages...")
    await run("yarn", target)

    log("Installing UCPeM packages...")
    await ucpem(`install`, target)
}, {
    desc: "Adds testing to an existing project"
})