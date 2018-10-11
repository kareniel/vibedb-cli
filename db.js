var level = require('level')
var config = require('./config-loader')

var db = level(config.subdir.database)

module.exports = db
