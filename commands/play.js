var path = require('path')
var readline = require('readline')
var { spawn } = require('child_process')

var { log } = require('../lib')
var config = require('../config-loader')

const usage = `vibedb - Play Mode

Usage:

  vibe [COMMAND]

  -or-

  Use any valid VLC terminal commands. 
  Type 'help vlc' or just press enter to get a list vlc commands

Commands:

  None yet!
`

module.exports = play

function play () {
  var playlist = path.join(config.subdir.playlists, 'all.m3u')

  var vlc = spawn(config.vlc.dir, [ '-I', 'rc', playlist ], {
    stdio: [ 'pipe', 'inherit', 'ignore' ]
  })

  vlc.on('error', err => console.log(err))

  return recursivePrompt()

  function recursivePrompt () {
    var cursor = '$ '

    prompt(cursor, command => {
      var args = command.split(' ')

      switch (args[0]) {
        case 'help':
          if (args[1] === 'vlc') {
            vlc.stdin.write('help' + '\n')
          } else {
            log(usage)
          }
          break

        case 'vibe':
          executeCommand(args[1], args.slice(2))
          break

        case 'quit':
        case 'q':
        case '\\q':
        case 'exit':
          return quit()

        default:
          vlc.stdin.write(command + '\n')
          break
      }

      recursivePrompt()
    })
  }

  function executeCommand (cmd, args) {
    log('command: ' + cmd)
    log('args: ' + args.join(', '))
  }

  function quit () {
    vlc.on('close', (code, signal) => {
      process.exit()
    })

    vlc.kill('SIGHUP')
  }

  function prompt (text, done) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(text, command => {
      rl.close()
      done(command)
    })
  }
}
