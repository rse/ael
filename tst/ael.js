/*
**  AEL -- Advanced Expression Language
**  Copyright (c) 2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const chai = require("chai")
const expect = chai.expect
chai.config.includeStack = true

const AEL = require("../lib/ael.node.js")

describe("AEL Library", () => {
    const ael = new AEL({
        trace: (msg) => console.log(msg)
    })
    const data = {
        foo:  42,
        bar:  { baz: { quux: "quux" } },
        quux: [ undefined, true, false, null, NaN, 0b11, 7, 0o7, 0xF, "quux", "quux", "quux" ]
    }
    const expectEvaluate = (expr) =>
        expect(ael.evaluate(expr, data))
    it("API availability", () => {
        expect(ael).to.respondTo("compile")
        expect(ael).to.respondTo("execute")
        expect(ael).to.respondTo("evaluate")
    })
    it("literal expressions", () => {
        expectEvaluate("quux[0]").to.be.equal(undefined)
        expectEvaluate("quux")
            .to.be.deep.equal(data.quux)
        expectEvaluate("quux == [ undefined, true, false, null, NaN, 0b11, 7, 0o7, 0xF, \"quux\", 'quux', `quux` ]")
            .to.be.equal(true)
        expectEvaluate("`foo${\"bar\"}quux`")
            .to.be.equal("foobarquux")
    })
    it("conditional expressions", () => {
        expectEvaluate("42 > 7 ? 'foo' : 'bar'")
            .to.be.equal("foo")
    })
    it("boolean expressions", () => {
        expectEvaluate("true && true || false && false")
            .to.be.equal(true)
    })
})

