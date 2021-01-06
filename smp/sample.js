
const AEL = require("..")

try {
    let result = new AEL({ trace: (msg) => console.log(msg) })
        .evaluate(`foo =~ /^foo$/`, { foo: "foo" })
    console.log(result)
}
catch (ex) {
    console.log(ex.toString())
}

