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
import CacheLRU  from "cache-lru"

/*  load internal dependencies  */
import AELExpr   from "./ael-expr.js"

/*  define the API class  */
class AEL {
    /*  create a new AEL instance  */
    constructor () {
        /*  create LRU cache  */
        this._cache = new CacheLRU()
    }

    /*  configure the LRU cache limit  */
    cache (entries) {
        if (arguments.length !== 1)
            throw new Error("AEL#cache: invalid number of arguments")
        this._cache.limit(entries)
        return this
    }

    /*  individual step 1: compile expression into AST  */
    compile (expr, trace) {
        if (arguments.length < 1)
            throw new Error("AEL#compile: too less arguments")
        if (arguments.length > 2)
            throw new Error("AEL#compile: too many arguments")
        if (trace === undefined)
            trace = false
        let ast = this._cache.get(expr)
        if (ast === undefined) {
            ast = new AELExpr()
            ast.compile(expr, trace)
            this._cache.set(expr, ast)
        }
        return ast
    }

    /*  individual step 2: execute AST  */
    execute (ast, vars, trace) {
        if (arguments.length < 1)
            throw new Error("AEL#execute: too less arguments")
        if (arguments.length > 3)
            throw new Error("AEL#execute: too many arguments")
        if (vars === undefined)
            vars = {}
        if (trace === undefined)
            trace = false
        return ast.execute(vars, trace)
    }

    /*  all-in-one step  */
    evaluate (expr, vars, trace) {
        if (arguments.length < 1)
            throw new Error("AEL#evaluate: too less arguments")
        if (arguments.length > 3)
            throw new Error("AEL#evaluate: too many arguments")
        if (vars === undefined)
            vars = {}
        if (trace === undefined)
            trace = false
        const ast = this.compile(expr, trace)
        return this.execute(ast, vars, trace)
    }
}

/*  export the traditional way for interoperability reasons
    (as Babel would export an object with a 'default' field)  */
module.exports = AEL

