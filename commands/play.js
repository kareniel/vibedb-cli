var readline = require('readline')

var { log } = require('../lib')
var dbModule = require('./db')
var vlcModule = require('./vlc')

const EXIT_COMMANDS = ['quit', 'q', '\\q', 'exit', 'close']
const VLC_PASSTHROUGH_CMDS = ['play', 'pause', 'prev', 'next', 'info']
const MILLISECONDS_BEFORE_SHUTDOWN = 5 * 1000
const usage = `
vibedb console
===========

Usage:

  help: print this message
  help db: list db commands
  help vlc: send 'help' command to VLC
  vlc:  change to vlc mode
  db: change to db mode 
  mode: return current mode  

Modes:

  vlc: Direct access to the VLC cli through the ic interface. 
  db: Spawn a vibedb child process using a given command.
`

class PlayCommand {
  constructor () {
    process.on('SIGINT', () => this.quit())

    this.mode = 'db'
    this.rl = null

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
    if (cmd === 'help') {
      if (!args.length) return log(usage)
      if (args[0] === 'db') return dbModule.help()
      if (args[0] === 'vlc') return vlcModule.help()
    }

    switch (this.mode) {
      case 'db':
        if (cmd === 'vlc') return this.setMode(cmd)
        if (VLC_PASSTHROUGH_CMDS.includes(cmd)) {
          return vlcModule.execute(cmd, args)
        }

        return dbModule.execute(cmd, args)

      case 'vlc':
        if (cmd === 'db') return this.setMode(cmd)
        if (!cmd && args.length === 0) return vlcModule.execute('')

        return vlcModule.execute(cmd, args)

      default:
        log(usage)
        break
    }

    this.resetCursor()
  }

  setMode (mode) {
    this.mode = mode
  }

  quit () {
    this.mode = 'exit'

    vlcModule.close()

    log('\nsee you later :)')

    setTimeout(() => {
      process.exit()
    }, MILLISECONDS_BEFORE_SHUTDOWN)
  }
}

module.exports = function () {
  return new PlayCommand()
}
