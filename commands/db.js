var vlc = require('./vlc')
var { log } = require('../lib')
var db = require('../db')

const usage = `
Commands:

  tracks show <track-id> - show info about a track
  tracks tag <tag> - add tag(s) to a track
`

class DBModule {
  constructor () {
    this.db = db
  }

  execute (cmd, args) {
    switch (cmd) {
      case 'tracks':
        return this.handleTrackCMD(args[0], args.slice(1))

      default:
        return this.help()
    }
  }

  help () {
    log(usage)
  }

  async handleTrackCMD (cmd, args) {
    var trackId

    switch (cmd) {
      case 'show':
        trackId = args[0]
        if (!trackId || trackId === '$playing') {
          trackId = await vlc.getPlayingTrackId()
        }

        log(trackId)
        break

      case 'tag':
        trackId = args[0]
        var tag = args[1]

        if (!trackId || !tag) return log('tag: argument(s) missing')
        if (trackId === '$playing') {
          trackId = await vlc.getPlayingTrackId()
        }

        log(`tag:${tag}:${trackId}`, Date.now())
        log(`${trackId}:tags:${tag}`, Date.now())

        break
      default:
        return this.help()
    }
  }
}

module.exports = new DBModule()
