'use strict'
var linter = require('standard')
var cliEngine = require('standard-cliengine')

// set standard --fix
linter.eslintConfig.fix = true
module.exports.CLIEngine = cliEngine(linter)
