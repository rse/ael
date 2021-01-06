
const AEL = require("..")

try {
    let result = new AEL({ trace: (msg) => console.log(msg) })
        .evaluate(`foo.bar?.quux?.()`, { foo: { bar: { quux: () => 42 } } }, true)
    console.log(result)
}
catch (ex) {
    console.log(ex.toString())
}

