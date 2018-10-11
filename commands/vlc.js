var { spawn } = require('child_process')
var path = require('path')
var noop = () => {}

var config = require('../config-loader')

class VLCModule {
  constructor () {
    this.playlist = path.join(config.subdir.playlists, 'all.m3u')

    this.start()
  }

  start () {
    const cmd = config.vlc.bin
    const args = [ '-I', 'rc', this.playlist, '--verbose', '2']

    this.vlc = spawn(cmd, args, {
      stdio: [ 'pipe', 'pipe', 'ignore' ]
    })

    this.vlc.stdout.on('data', noop)

    this.vlc.on('error', err => console.log('vlc:', err))
    this.vlc.on('close', (code, signal) => process.exit())
  }

  execute (cmd, args = []) {
    this.vlc.stdout.once('data', data => {
      process.stdout.write(data)
    })

    this.vlc.stdin.write(`${cmd} ${args.join(' ')}\n`)
  }

  getPlayingTrackId () {
    return new Promise(resolve => {
      this.vlc.stdout.once('data', data => {
        var filepath = pathFromStatus(data.toString())
        var id = trackIdFromPath(filepath)

        resolve(id)
      })

      this.vlc.stdin.write('status\n')
    })
  }

  help () {
    this.execute('help')
  }

  close () {
    this.vlc.kill('SIGHUP')
  }
}

function pathFromStatus (status) {
  var filepath = status
    .split('\r\n')
    .filter(str => str.indexOf('new input:') > 1)[0]
    .replace(/[()]/g, '')
    .replace('new input: ', '')

  return filepath
}

function trackIdFromPath (filepath) {
  var dir = path.join(filepath, '../')

  return path.basename(dir)
}

module.exports = new VLCModule()
