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

/*  load external depdendencies  */
import CacheLRU    from "cache-lru"
import ASTY        from "asty"
import PEGUtil     from "pegjs-util"

/*  get expression evaluator  */
import AELEval     from "./ael-eval.js"
import AELError    from "./ael-error.js"

/*  get expression parser (by loading and on-the-fly compiling PEG.js grammar)  */
const PEG = require("pegjs-otf")
const AELParser = PEG.generateFromFile(
    /* eslint node/no-path-concat: off */
    __dirname + "/ael-parse.pegjs",
    { optimize: "speed", cache: true }
)

/*  define the API class  */
class AEL {
    /*  create a new AEL instance  */
    constructor (options = {}) {
        /*  provide parameter defaults  */
        this.options = {
            cache: 100,
            trace: null,
            ...options
        }

        /*  create LRU cache  */
        this._cache = new CacheLRU()
        this._cache.limit(this.options.cache)
    }

    /*  individual step 1: compile expression into AST  */
    compile (expr) {
        /*  sanity check usage  */
        if (arguments.length < 1)
            throw new Error("AEL#compile: too less arguments")
        if (arguments.length > 2)
            throw new Error("AEL#compile: too many arguments")

        /*  tracing operation  */
        if (this.options.trace !== null)
            this.options.trace("AEL: compile: +---(expression string)-----------------" +
                "----------------------------------------------------------------\n" +
                expr.replace(/\n$/, "").replace(/^/mg, "AEL: compile: | "))

        /*  try to fetch pre-compiled AST  */
        let ast = this._cache.get(expr)
        if (ast === undefined) {
            /*  compile AST from scratch  */
            const asty = new ASTY()
            let result = PEGUtil.parse(AELParser, expr, {
                startRule: "expression",
                makeAST: (line, column, offset, args) => {
                    return asty.create.apply(asty, args).pos(line, column, offset)
                }
            })
            if (result.error !== null) {
                const message = "parsing failed: " +
                    `"${result.error.location.prolog}" "${result.error.location.token}" "${result.error.location.epilog}": ` +
                    result.error.message
                throw new AELError(message, {
                    origin: "parser",
                    code:   expr,
                    line:   result.error.line,
                    column: result.error.column
                })
            }
            ast = result.ast
            ast.set("expr", expr)

            /*  cache AST for subsequent usages  */
            this._cache.set(expr, ast)
        }

        /*  tracing operation  */
        if (this.options.trace !== null)
            this.options.trace("AEL: compile: +---(abstract syntax tree)--------------" +
                "----------------------------------------------------------------\n" +
                ast.dump().replace(/\n$/, "").replace(/^/mg, "AEL: compile: | "))

        return ast
    }

    /*  individual step 2: execute AST  */
    execute (ast, vars) {
        /*  sanity check usage  */
        if (arguments.length < 1)
            throw new Error("AEL#execute: too less arguments")
        if (arguments.length > 3)
            throw new Error("AEL#execute: too many arguments")

        /*  provide defaults  */
        if (vars === undefined)
            vars = {}

        /*  tracing operation  */
        if (this.options.trace !== null)
            this.options.trace("AEL: execute: +---(evaluation recursion tree)---------" +
                "----------------------------------------------------------------")

        /*  evaluate the AST  */
        const expr = ast.get("expr")
        const evaluator = new AELEval(expr, vars, this.options.trace)
        return evaluator.eval(ast)
    }

    /*  all-in-one step  */
    evaluate (expr, vars) {
        /*  sanity check usage  */
        if (arguments.length < 1)
            throw new Error("AEL#evaluate: too less arguments")
        if (arguments.length > 3)
            throw new Error("AEL#evaluate: too many arguments")

        /*  provide defaults  */
        if (vars === undefined)
            vars = {}

        /*  compile and evaluate expression  */
        const ast = this.compile(expr)
        return this.execute(ast, vars)
    }
}

/*  export the traditional way for interoperability reasons
    (as Babel would export an object with a 'default' field)  */
module.exports = AEL

