
const AEL = require("..")

let ael = new AEL()
let ast = ael.compile(`/* query all variable declaration */
foo.bar.quux == 42
`, true)
let result = ael.execute(ast, [], { foo: { bar: { quux: 42 } } }, true)
console.log(result)

