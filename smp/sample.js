
const AEL = require("..")

let ael = new AEL()
ael.compile(`/* query all variable declaration */
foo.bar.quux && (bar.foo)[foo ? "quux" : "quux2"].bar == 2
`, true)

