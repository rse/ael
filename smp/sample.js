
const AEL = require("..")

const ael = new AEL({ trace: (msg) => console.log(msg) })
try {
    const result = ael.evaluate(`
        foo.quux == "quux"
        && foo.bar.a == 1
    `, {
        foo: {
            bar: { a: 1, b: 2, c: 3 },
            baz: [ "a", "b", "c", "d", "e" ],
            quux: "quux"
        }
    })
    console.log("RESULT", result)
}
catch (ex) {
    console.log("ERROR", ex.toString())
}

