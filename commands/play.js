var path = require('path')
var readline = require('readline')
var { spawn } = require('child_process')

var { log } = require('../lib')
var config = require('../config-loader')

const EXIT_COMMANDS = ['quit', 'q', '\\q', 'exit']
const usage = `
vibedb play
===========

Usage:

  vlc:  change to vlc mode
  db: change to db mode 
  mode: return current mode  
  help: print this message
  help vlc: get vlc help

Modes:

  vlc: Direct access to the VLC cli through the ic interface. 
  db: Spawn a vibedb child process using a given command.

DB Commands:

  None yet!
`

class PlayCommand {
  constructor () {
    process.on('SIGINT', () => this.quit())

    this.mode = 'vlc'
    this.rl = null
    this.playlist = path.join(config.subdir.playlists, 'all.m3u')

    const cmd = config.vlc.bin
    const args = [ '-I', 'rc', this.playlist ]

    this.vlc = spawn(cmd, args, {
      stdio: [ 'pipe', 'inherit', 'ignore' ]
    })

    this.vlc.on('error', err => console.log(err))
    this.vlc.on('close', (code, signal) => process.exit())

    this.listen()
  }

  listen () {
    this.resetCursor()

    this.prompt(this.cursor, query => {
      this.query = query
      this.words = query.split(' ')

      this.exec()
      this.listen()
    })
  }

  resetCursor () {
    if (this.mode === 'exit') return

    this.cursor = this.mode + '> '
    if (this.rl) this.rl.setPrompt(this.cursor)
  }

  prompt (text, done) {
    if (this.mode === 'exit') return

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    this.rl.question(text, command => {
      this.rl.close()

      done(command)
    })
  }

  exec () {
    var cmd = this.words[0]
    var args = this.words.slice(1)

    if (EXIT_COMMANDS.includes(cmd)) return this.quit()
    if (cmd === 'mode') return log(this.mode)

    switch (this.mode) {
      case 'db':
        if (cmd === 'vlc') return this.setMode(cmd)

        return this.dbCMD(cmd, args)

      case 'vlc':
        if (cmd === 'db') return this.setMode(cmd)

        return this.vlcCMD(cmd, args)

      default:
        log(usage)
        break
    }
  }

  dbCMD (cmd, args) {
    log('db command: ' + cmd)
    log('args: ' + args.join(', '))

    switch (cmd) {
      default:
        log(usage)
        break
    }
  }

  vlcCMD (cmd, args) {
    if (!cmd && args.length === 0) return this.sendToVLC('')

    this.sendToVLC(this.query)
  }

  sendToVLC (cmd = '') {
    this.vlc.stdin.write(cmd + '\n')
    this.resetCursor()
  }

  setMode (mode) {
    this.mode = mode
  }

  quit () {
    const MILLISECONDS_BEFORE_SHUTDOWN = 5 * 1000

    log('\nsee you later :)')

    this.mode = 'exit'

    this.vlc.kill('SIGHUP')

    setTimeout(() => {
      process.exit()
    }, MILLISECONDS_BEFORE_SHUTDOWN)
  }
}

module.exports = function () {
  return new PlayCommand()
}
