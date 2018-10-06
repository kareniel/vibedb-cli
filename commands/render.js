var fs = require('fs')
var path = require('path')
var recursive = require('recursive-readdir')

var config = require('../config-loader')
var { log } = require('../lib')

module.exports = render

function render () {
  const { subdir } = config
  var ignored = ['*.txt', '.DS_Store']

  recursive(subdir.library, ignored, function (err, files) {
    if (err) return log(err)

    var src = path.join(subdir.playlists, 'all.m3u')
    var content = files.join('\n')

    fs.writeFileSync(src, content)
  })
}
