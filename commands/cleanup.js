var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var trash = require('trash')

var { log } = require('../lib')
var config = require('../config-loader')

module.exports = cleanup

function cleanup () {
  const { subdir } = config

  var files = getInboxFiles()
  var directories = getDirectories(files)

  flattenDirectories(directories)

  files = getInboxFiles()

  log(`Found ${files.length} files.`)

  moveUnsupported(files)

  function getInboxFiles () {
    return fs.readdirSync(subdir.inbox).map(filename => path.join(subdir.inbox, filename))
  }

  function getDirectories (files) {
    var directories = files.filter(file => fs.statSync(file).isDirectory())

    return directories.map(dir => path.join(dir))
  }

  function flattenDirectories (directories) {
    directories.forEach(directory => {
      var files = fs.readdirSync(directory)

      files.forEach(filename => hoist(path.join(directory, filename)))
      trash(directory)
    })
  }

  function hoist (file) {
    var filename = path.basename(file)
    var dest = path.join(subdir.inbox, filename)

    try {
      log(`Moving ${file}`)
      fse.moveSync(file, dest)
    } catch (err) {
      if (err.code === 'EEXIST') {
        log('Code: EEXIST', `${dest} exists. Moving to trash.`)
        trash(file)
      }
    }
  }

  function moveUnsupported (files) {
    files
      .filter(file => fs.statSync(file).isFile())
      .forEach(file => {
        if (config.hasValidExtension(file)) return

        var filename = path.basename(file)
        var dest = path.resolve(subdir.unsupported, filename)

        try {
          log(`Moving ${file} to ${subdir.unsupported}`)
          fse.moveSync(file, dest)
        } catch (err) {
          if (err.code === 'EEXIST') {
            log('Code: EEXIST', `${dest} exists. Moving to trash.`)
            trash(file)
          }
        }
      })
  }
}
