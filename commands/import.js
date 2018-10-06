/*
 * /commands/import.js
 *
 * $type $name      description
 * ---
 * str file         the path to a file
 * str filename     the name of a file
 * str dir          the path to a directory
 * str dirname      the name of a directory
 * str src          a source file
 * str dest         a destination file
 * arr<file> files  a list of file names
 */

var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var Unixfs = require('ipfs-unixfs')
var { DAGNode } = require('ipld-dag-pb')
var series = require('run-series')

var config = require('../config-loader')
var { confirm, log, quit } = require('../lib')

module.exports = importCommand

function importCommand () {
  log(`Using inbox folder ${config.subdir.inbox}`)

  var files = listFilesSync()

  log(`Found ${files.length} files.\n`)

  if (files.length === 0) return quit()

  var msg = `Start import? (yN) `

  confirm(msg, confirmed => confirmed ? startImport(files) : quit())
}

function startImport (files) {
  var before = Date.now()
  var tasks = files.map(file => done => importTask(file, done))

  series(tasks, err => {
    if (err) return console.error(err)

    var after = Date.now()

    log(`Finished moving ${files.length} files. (${before - after / 1000}s)`)
  })
}

function listFilesSync () {
  const { subdir } = config

  return fs.readdirSync(subdir.inbox).filter(config.hasValidExtension)
}

function importTask (filename, done) {
  var before = Date.now()
  var file = path.join(config.subdir.inbox, filename)

  log(`\nhashing: ${file}`)

  hashFile(file, (err, hash) => {
    if (err) return done(err)

    var after = Date.now()

    log(`hash: ${hash} (${(after - before) / 1000}s)`)

    var src = path.join(config.subdir.inbox, filename)
    var prefix = hash.split('').slice(0, 3).join('')
    var destDir = path.join(config.subdir.library, prefix, hash)
    var dest = path.join(destDir, filename)

    log(`moving to: ${dest}`)

    fse.mkdirpSync(destDir)
    fse.moveSync(src, dest)

    done()
  })
}

function hashFile (file, callback) {
  // load the file to a buffer, chunk the buffer, build a dag and hash it
  var buf = fs.readFileSync(file, 'utf8')
  var unixFs = new Unixfs('file', buf)

  DAGNode.create(unixFs.marshal(), (err, dagNode) => {
    if (err) return callback(err)

    var hash = dagNode.toJSON().multihash

    callback(null, hash)
  })
}
