
const AEL = require("..")

const ael = new AEL({ trace: (msg) => console.log(msg) })

const expr = `foo.quux =~ /ux$/ && foo.bar.a == 1`

const data = {
    foo: {
        bar: { a: 1, b: 2, c: 3 },
        baz: [ "a", "b", "c", "d", "e" ],
        quux: "quux"
    }
}

try {
    const result = ael.evaluate(expr, data)
    console.log("RESULT", result)
}
catch (ex) {
    console.log("ERROR", ex.toString())
}

