# vibedb-cli


## Requirements

- *nix
- Node.js 8.x
- VLC


## Installation

1. `git clone https://github.com/kareniel/vibedb-cli vibedb-cli`
2. `cd vibedb-cli && npm link`


## Usage

`vibedb COMMAND`


## Commands

#### `cleanup`

flatten `$inbox` file structure, move unsupported files to `$unsupported`.

#### `import`

calculates multihash of files in `$inbox` then copies those file to their
respective directory in `$library` following the current 
[library directory structure](#library-directory-structure).

#### `render`

export a m3u file listing every file in `$library`.

#### `play`

launch playlist using vlc.  
runs with an interactive prompt connected to the rc interface.  
defaults to playing all files in `$library`.


## Reference

#### Configuration

Create a yaml file called .vibedb in your home directory.
If this file is not found, [`config.yaml`](./config.yaml) will be used. 


#### Music Folder

Default path: `~/Dropbox/Apps/Vibedrive` 

Subfolders: 

- **`/Inbox`**: Put your music files in here before they can be [`import`](#import)ed.
- **`/Unsupported`**: [`cleanup`](#cleanup) moves files with unsupported extension type here.
- **`/Libray`**: Contains imported music files. Organized using the [library directory structure](#library-directory-structure).
- **`/Playlists`**: Contains [`render`](#render)ed playlist (.m3u) files.


#### Library Directory Structure

The current structure of `$library` is:

```
/
/Library
  /$prefix
    /$multihash
      $original-file-name
```

where:

- `$prefix` = first 3 characters of $multihash
- `$multihash` = ipfs hash of file

---

## License

[MIT License](./LICENSE)

Copyright (c) 2018 Jonathan Dupré
