var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var assert = require('assert')
var os = require('os')
var yaml = require('js-yaml')
var untildify = require('untildify')

var { log } = require('./lib')
const CUSTOM_CONFIG_DIR = path.join(os.homedir(), '.vibedb')
const configFile = fs.readFileSync(path.join(__dirname, './config.yaml'))
const defaultConfig = yaml.safeLoad(configFile)

var config

try {
  config = yaml.safeLoad(fs.readFileSync(CUSTOM_CONFIG_DIR))
} catch (err) {
  log(`Note: Custom config not found at ${CUSTOM_CONFIG_DIR}, using default configuration.`)

  config = defaultConfig
}

config.dir = untildify(config.dir)
config.subdir = {
  inbox: path.join(config.dir, 'Inbox'),
  library: path.join(config.dir, 'Library'),
  unsupported: path.join(config.dir, 'Unsupported'),
  playlists: path.join(config.dir, 'Playlists')
}

generateSubfolders()

config.constants = Object.freeze({
  VALID_EXTENSIONS: [
    '.mp3',
    '.wav',
    '.m4a',
    '.aif',
    '.flac'
  ]
})

config.hasValidExtension = function (file) {
  const { VALID_EXTENSIONS } = config.constants

  return VALID_EXTENSIONS.includes(path.extname(file).toLowerCase())
}

validate(config)

module.exports = Object.freeze(config)

function validate (config) {
  const pre = 'Config Error:'

  assert.ok(config.dir, `${pre} No value for field 'dir'`)
  assert.ok(fs.existsSync(config.dir), `${pre} Music directory not found: ${config.dir}`)
}

function generateSubfolders () {
  const subfolders = Object.values(config.subdir)

  subfolders.forEach(dir => fse.mkdirpSync(dir))
}
