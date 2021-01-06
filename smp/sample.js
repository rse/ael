
const AEL = require("..")

let ael = new AEL()
let ast = ael.compile(`foo.bar.quux()`, true)
let result = ael.execute(ast, { foo: { bar: { quux: () => 42 } } }, true)
console.log(result)

