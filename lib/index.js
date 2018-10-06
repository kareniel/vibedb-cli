var readline = require('readline')
var yn = require('yn')

module.exports.confirm = function confirm (text, cb) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(text, (answer) => {
    rl.close()
    cb(yn(answer))
  })
}

module.exports.log = function log (txt) {
  process.stdout.write(`${txt}\n`)
}

module.exports.quit = function quit () {
  process.exit()
}
