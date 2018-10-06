#!/usr/bin/env node

var meow = require('meow')

main(meow(`
Usage: 
$ vibedb [COMMAND]

Commands:

  - cleanup: flatten $inbox file structure, move unsupported files to $unsupported 
  - import: move music files from $inbox to a subdirectory in $library
  - render: export a m3u file listing every file in $library 
`))

function main (cli) {
  switch (cli.input[0]) {
    case 'cleanup':
      return require('./commands/cleanup')()
    case 'import':
      return require('./commands/import')()
    case 'render':
      return require('./commands/render')()
    default:
      return console.log(cli.help)
  }
}
