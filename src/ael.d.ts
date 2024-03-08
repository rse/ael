/*
**  AEL -- Advanced Expression Language
**  Copyright (c) 2021-2024 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

declare module "AEL" {
    class AEL {
        /*  create AEL instance  */
        public constructor(
            options?: {
                cache?:    number,   /*  number of LRU-cached ASTs (default: 0)      */
                trace?: (            /*  optional tracing callback (default: null)   */
                    msg:   string    /*  tracing message                             */
                ) => void
            }
        )

        /*  individual step 1: compile (and cache) expression into AST  */
        compile(
            expr:          string    /*  expression string                           */
        ): any                       /*  abstract syntax tree                        */

        /*  individual step 2: execute AST  */
        execute(
            ast:           any,      /*  abstract syntax tree                        */
            vars?:         object,   /*  data variables  (read-only)  (default: {})  */
            state?:        object    /*  state variables (read-write) (default: {})  */
        ): void

        /*  all-in-one step: evaluate (compile and execute) expression  */
        evaluate(
            expr:          string,   /*  expression string                           */
            vars?:         object,   /*  data variables  (read-only)  (default: {})  */
            state?:        object    /*  state variables (read-write) (default: {})  */
        ): any
    }
    export = AEL
}

