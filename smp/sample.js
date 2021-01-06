
const AEL = require("..")

try {
    let ael = new AEL()
    let ast = ael.compile(`foo.barx.quux()`, true)
    let result = ael.execute(ast, { foo: { bar: { quux: () => 42 } } }, true)
    console.log(result)
}
catch (ex) {
    console.log(ex.toString())
}

