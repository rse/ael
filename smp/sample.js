
const AEL = require("..")

const ael = new AEL({
    trace: (msg) => console.log(msg)
})

const data = {
    session: {
        user: {
            login: "rse",
            email: "rse@engelschall.com"
        },
        tokens: [
            "455c3026-50cf-11eb-8d93-7085c287160d",
            "4600b07e-50cf-11eb-8d57-7085c287160d"
        ]
    },
}

const expr = `
    grant =~ /^login:(.+)$/ ? session.user.login =~ $1 :
    grant =~ /^email:(.+)$/ ? session.user.email =~ $1 :
    grant =~ /^token:(.+)$/ ? session.tokens     >= $1 : false
`

const grants = [
    "login:^(?:rse|foo|bar)$",
    "email:^.+@engelschall\\.com$",
    "email:^.+@example\\.com$",
    "token:4600b07e-50cf-11eb-8d57-7085c287160d"
]

try {
    let granted = false
    for (const grant of grants) {
        if (ael.evaluate(expr, { ...data, grant })) {
            granted = true
            break
        }
    }
    console.log("GRANTED", granted)
}
catch (ex) {
    console.log("ERROR", ex.toString())
}

