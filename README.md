# Vibedrive Tools


## Installation

1. `git clone https://github.com/kareniel/vibedb-cli vibedb-cli`
2. `cd vibedb-cli && npm link`


## Usage

`vibedb COMMAND`

### Commands

#### `cleanup`

flatten $inbox file structure, move unsupported files to $unsupported


#### `import`

calculates multihash of files in `$inbox` then copies those file to their
respective directory in `$library` following the current 
[library directory structure](#library-directory-structure).

#### `render`

export a m3u file listing every file in $library 


## Reference

#### Library Directory Structure

The current structure of `$library` is:

```
/
  /$prefix
    /$multihash
      $original-file-name
```

where:

- `$prefix` = first 3 characters of $multihash
- `$multihash` = ipfs hash of file

