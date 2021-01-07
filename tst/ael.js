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

/* global describe: false */
/* global it: false */
/* jshint -W030 */
/* eslint no-unused-expressions: 0 */

const chai = require("chai")
const expect = chai.expect
chai.config.includeStack = true

const AEL = require("../lib/ael.node.js")

describe("AEL Library", () => {
    const ael = new AEL()
    it("API availability", () => {
        expect(ael).to.respondTo("compile")
        expect(ael).to.respondTo("execute")
        expect(ael).to.respondTo("evaluate")
    })
    it("literal expressions", () => {
        expect(ael.evaluate("true")).to.be.equal(true)
        expect(ael.evaluate("42")).to.be.equal(42)
        expect(ael.evaluate("42 + 7")).to.be.equal(49)
    })
    it("conditional expressions", () => {
        expect(ael.evaluate("a > 0 ? b : c", { a: 1, b: 2, c: 3 })).to.be.equal(2)
        expect(ael.evaluate("a > 0 ? b > 1 ? true : false : c", { a: 1, b: 2, c: 3 })).to.be.equal(true)
    })
    it("boolean expressions", () => {
        expect(ael.evaluate("a && b || c && d", { a: true, b: true, c: false, d: false })).to.be.equal(true)
    })
})

