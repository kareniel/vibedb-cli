var test = require('tape')

var config = require('../config-loader')

test('can load config', t => {
  t.ok(config)
  t.equal(typeof config, 'object')
  t.end()
})
