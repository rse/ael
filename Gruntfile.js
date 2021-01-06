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

/* global module: true */
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-eslint");

    grunt.initConfig({
        eslint: {
            options: {
                configFile: "eslint.yaml"
            },
            "ael": [ "src/**/*.js", "tst/**/*.js" ]
        },
        browserify: {
            "ael-browser": {
                files: {
                    "lib/ael.browser.js": [ "src/**/*.js" ]
                },
                options: {
                    transform: [
                        [ "babelify", {
                            presets: [
                                [ "@babel/preset-env", {
                                    "targets": {
                                        "browsers": "last 8 versions, > 1%, ie 11"
                                    }
                                } ]
                            ]
                        } ],
                        "pegjs-otf/transform",
                        [ "uglifyify", { sourceMap: false, global: true } ]
                    ],
                    plugin: [
                        "browserify-derequire",
                        "browserify-header"
                    ],
                    browserifyOptions: {
                        standalone: "AEL",
                        debug: false
                    }
                }
            },
            "ael-node": {
                files: {
                    "lib/ael.node.js": [ "src/**/*.js" ]
                },
                options: {
                    transform: [
                        [ "babelify", {
                            presets: [
                                [ "@babel/preset-env", {
                                    "targets": {
                                        "node": "10.0.0"
                                    }
                                } ]
                            ]
                        } ],
                        "pegjs-otf/transform"
                    ],
                    plugin: [
                        "browserify-header"
                    ],
                    external: [
                        "pegjs-otf",
                        "pegjs-util",
                        "asty",
                        "cache-lru"
                    ],
                    browserifyOptions: {
                        standalone: "AEL",
                        debug: false
                    }
                }
            }
        },
        mochaTest: {
            "ael": {
                src: [ "tst/*.js" ]
            },
            options: {
                reporter: "spec",
                timeout: 5*1000
            }
        },
        clean: {
            clean: [],
            distclean: [ "node_modules" ]
        }
    });

    grunt.registerTask("default", [ "eslint", "browserify", "mochaTest" ]);
    grunt.registerTask("test", [ "browserify:ael-node", "mochaTest" ]);
};

