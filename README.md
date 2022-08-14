<h1 align="center">
  🚀 Node Modules Packer
</h1>

<p align="center">
  <a href="#use-cases">Use Cases</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#usage">Usage</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#examples">Examples</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#headless">Headless</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#benchmark">Benchmarks</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#reference">Reference</a>
</p>

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

This is a library to package all your node_modules and other files you want inside your project to a zip file. 
It's like using `npm prune --production` but without all the heavy I/O operations.

You can use this library to deploy applications in serverless environments, for example, without having to do
lots of crazy configurations with webpack, also this library allows you to minify all `.js` files using `esbuild`.

I personally created this library inspired by an internal library I created for my company to deploy our NestJS apps
for AWS Lambda.
With this guy I improve deployment time by up to [441% (284% minified)](./benchmark#results) and reduce the bundle
size by up to [~40% (~55% minified)](./benchmark#results) with the benefit that my Webstorm doesn't go crazy with dependency indexing 
every time I deploy because I no longer need to run `npm prune --production` just to get a descending build size.

> Wait, you're asking me why I build and deploy the APIs on my computer instead of using CI/CD?
>
> Well the answer is pretty simple, I want to be in control of these things ~~and we didn't have a CI/CD until a few months ago.~~

# Use cases

In which cases this library might suit you:

- If you deploy your nodejs apps in zip file with node_modules.
- If you want to keep the directory structure (eg typeorm).
- If you don't like dealing with webpack and just want to get things done.
- If you use terraform to deploy in serverless environments, just point the output file to terraform and that's it.
- If you want to minify all `.js` files, see `--minify` flag.
- If you want to remap the files, like renaming `dist` to `build`.
- If you like to deploy your app manually.
  - This library can give you more control over how you compress your files without having to write a lot of code to do so.

In which cases this library might not fit you:

- If you already have some webpack configuration to package your app.
- If you don't need to maintain the directory structure.
- If your nodejs app is very simple (see [serverless-bundle](https://github.com/AnomalyInnovations/serverless-bundle)).
- If you use [serverless.com](https://www.serverless.com/).
  - I've personally never used it, but it looks pretty good to use, see their [packaging docs.](https://www.serverless.com/framework/docs/providers/aws/guide/packaging)

# Usage

First, install the library with global flag:

```bash
npm i -g @h4ad/node-modules-packer
```

Then, enter inside the project you want to pack and run:

```bash
node-modules-packer run ./
```

By default, this command will:

- Find all production dependencies and will package them all.
- Ignore all development/peer/optional dependencies
- Ignore many common unused file extensions (eg: .md, .d.ts, .js.map, ..etc)
  - See the full list [here.](https://github.com/H4ad/node-modules-packer/blob/master/src/common/extensions.ts)
- Output the final zip with the name `deploy.zip`.

# Examples

Include more files in the `deploy.zip`:

```bash
node-modules-packer run ./ -i dist -i package.json -i package-lock.json
```

During including, if you need to remap, you can use `:` between the paths:

```bash
node-modules-packer run ./ -i dist:build -i package.json:dist/package.json
```

Minify all `.js` files to reduce the bundle size:

```bash
node-modules-packer run ./ -i dist --minify
```

> All `.js` files are minified, including files and folders that you include with `-i` flag.

If you want to preserve the class names, properties and other symbols, you can run with `--minify-keep-names`:

```bash
node-modules-packer run ./ -i dist --minify --minify-keep-names
```

Exclude unwanted file extensions from node_modules:

```bash
# This will exclude all json files from `deploy.zip`.
node-modules-packer run ./ -e .json
```

Include development/peer/optional dependencies (why?):

```bash
node-modules-packer run ./ --dev
node-modules-packer run ./ --peer
node-modules-packer run ./ --optional
# or have all at once
node-modules-packer run ./ --dev --peer --optional
```

Disable default ignored extensions (too much or we ignore something you want?):

See the full list [here.](https://github.com/H4ad/node-modules-packer/blob/v1.0.0/src/common/extensions.ts)
to know what you will leave inside your zip file if you run with this flag.

```bash
node-modules-packer run ./ --disable-default-ignore-file-ext
```

Ignore some node folders/paths that you know that should be OUT of your zip file:

```bash
node-modules-packer run ./ --ignore-node-path="typeorm/browser" --ignore-node-path="aws-sdk"
```

Or include some node folders/paths that you know that should be INSIDE of your zip file,
this is particulary usefull if you have some dependency with some misconfiguration of their dependencies.

```bash
# the path will be concatenated with `node_modules`, so this became
# `node_modules/some-dependency-you-want`
node-modules-packer run ./ --include-node-path="some-dependency-you-want"
```

> We don't include sub-dependencies of these folders, so if that dependency has another
> dependency, that dependency might be outside your zip.

You can change the output path and the output filename with:

```bash
node-modules-packer run ./ --output-path ./deploy --output-file result.zip 
```

## Headless

You can use this library in headless mode, for example, for cases where there is a lot of customization.

```ts
import Run from '@h4ad/node-modules-packer/lib/commands/run';

// this is my configuration to deploy my NestJS APIs
// to AWS Lambda
const result = await Run.headless({
  dir: './',
  ignoreNodePath: ['typeorm/browser', 'aws-crt/dist/bin', 'aws-crt/dist.browser', 'sqlite3', 'aws-sdk'],
  include: ['dist', 'ormconfig.js'],
  outputPath: './deploy',
  outputFile: 'deploy.zip',
  minify: true,
  minifyKeepNames: true,
});

console.log(result.size);
console.log(result.file);
console.log(result.path);
```

# Benchmarks

[See here](./benchmark) more about.

# Reference

<details open>
<summary>See commands reference</summary>
<br>

<!-- commands -->
* [`node-modules-packer autocomplete [SHELL]`](#node-modules-packer-autocomplete-shell)
* [`node-modules-packer commands`](#node-modules-packer-commands)
* [`node-modules-packer help [COMMAND]`](#node-modules-packer-help-command)
* [`node-modules-packer plugins`](#node-modules-packer-plugins)
* [`node-modules-packer plugins:install PLUGIN...`](#node-modules-packer-pluginsinstall-plugin)
* [`node-modules-packer plugins:inspect PLUGIN...`](#node-modules-packer-pluginsinspect-plugin)
* [`node-modules-packer plugins:install PLUGIN...`](#node-modules-packer-pluginsinstall-plugin-1)
* [`node-modules-packer plugins:link PLUGIN`](#node-modules-packer-pluginslink-plugin)
* [`node-modules-packer plugins:uninstall PLUGIN...`](#node-modules-packer-pluginsuninstall-plugin)
* [`node-modules-packer plugins:uninstall PLUGIN...`](#node-modules-packer-pluginsuninstall-plugin-1)
* [`node-modules-packer plugins:uninstall PLUGIN...`](#node-modules-packer-pluginsuninstall-plugin-2)
* [`node-modules-packer plugins:update`](#node-modules-packer-pluginsupdate)
* [`node-modules-packer run [DIR]`](#node-modules-packer-run-dir)
* [`node-modules-packer version`](#node-modules-packer-version)

## `node-modules-packer autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ node-modules-packer autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ node-modules-packer autocomplete

  $ node-modules-packer autocomplete bash

  $ node-modules-packer autocomplete zsh

  $ node-modules-packer autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v1.3.0/src/commands/autocomplete/index.ts)_

## `node-modules-packer commands`

list all the commands

```
USAGE
  $ node-modules-packer commands [--json] [-h] [--hidden] [--tree] [--columns <value> | -x] [--sort <value>]
    [--filter <value>] [--output csv|json|yaml |  | [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -h, --help         Show CLI help.
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --hidden           show hidden commands
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)
  --tree             show tree of commands

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  list all the commands
```

_See code: [@oclif/plugin-commands](https://github.com/oclif/plugin-commands/blob/v2.2.0/src/commands/commands.ts)_

## `node-modules-packer help [COMMAND]`

Display help for node-modules-packer.

```
USAGE
  $ node-modules-packer help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for node-modules-packer.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `node-modules-packer plugins`

List installed plugins.

```
USAGE
  $ node-modules-packer plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ node-modules-packer plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/index.ts)_

## `node-modules-packer plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ node-modules-packer plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ node-modules-packer plugins:add

EXAMPLES
  $ node-modules-packer plugins:install myplugin 

  $ node-modules-packer plugins:install https://github.com/someuser/someplugin

  $ node-modules-packer plugins:install someuser/someplugin
```

## `node-modules-packer plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ node-modules-packer plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ node-modules-packer plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/inspect.ts)_

## `node-modules-packer plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ node-modules-packer plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ node-modules-packer plugins:add

EXAMPLES
  $ node-modules-packer plugins:install myplugin 

  $ node-modules-packer plugins:install https://github.com/someuser/someplugin

  $ node-modules-packer plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/install.ts)_

## `node-modules-packer plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ node-modules-packer plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ node-modules-packer plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/link.ts)_

## `node-modules-packer plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ node-modules-packer plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ node-modules-packer plugins:unlink
  $ node-modules-packer plugins:remove
```

## `node-modules-packer plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ node-modules-packer plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ node-modules-packer plugins:unlink
  $ node-modules-packer plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/uninstall.ts)_

## `node-modules-packer plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ node-modules-packer plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ node-modules-packer plugins:unlink
  $ node-modules-packer plugins:remove
```

## `node-modules-packer plugins:update`

Update installed plugins.

```
USAGE
  $ node-modules-packer plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/update.ts)_

## `node-modules-packer run [DIR]`

Pack files and node dependencies to zip file.

```
USAGE
  $ node-modules-packer run [DIR] [--json] [-i <value>] [-e <value>] [--disable-default-ignore-file-ext]
    [--include-node-path <value>] [--ignore-node-path <value>] [--prod] [--peer] [--dev] [--optional] [--output-path
    <value>] [--output-file <value>] [--minify] [--minify-keep-names] [-q]

ARGUMENTS
  DIR  [default: ./] Project root directory

FLAGS
  -e, --ignore-file-ext=<value>...        Force ignore specific file extension.
  -i, --include=package.json...           Include more files during packing (eg: -i dist).
  -q, --quiet                             Run without logging.
  --[no-]dev                              Include development dependencies when pack node dependencies.
  --[no-]disable-default-ignore-file-ext  Disable including default ignored extensions that we consider as useless.
  --ignore-node-path=typeorm/browser...   Force exclude folders starting with specified path (eg: -n "typeorm/browser"
                                          will exclude node_modules/typeorm/browser).
  --include-node-path=dev-dependency...   Force include folders starting with the specified path (eg --include-node-path
                                          "dev-dependency" will include node_modules/dev-dependency), but you need to
                                          MANUALLY add your sub-dependencies if dev-dependency has production
                                          dependencies.
  --[no-]minify                           Minify each .js file with esbuild.
  --[no-]minify-keep-names                Keep the names during minification.
  --[no-]optional                         Include optional dependencies when pack node dependencies.
  --output-file=<value>                   [default: deploy.zip] Specify output file name for the zip file.
  --output-path=<value>                   [default: ./] Specify output path for the zip file.
  --[no-]peer                             Include peer dependencies when pack node dependencies.
  --[no-]prod                             Include production dependencies when pack node dependencies.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Pack files and node dependencies to zip file.

EXAMPLES
  $ node-modules-packer run /project/path -i dist
```

_See code: [src/commands/run/index.ts](https://github.com/H4ad/node-modules-packer/blob/v1.2.0/src/commands/run/index.ts)_

## `node-modules-packer version`

```
USAGE
  $ node-modules-packer version [--json] [--verbose]

FLAGS
  --verbose  Show additional information about the CLI.

GLOBAL FLAGS
  --json  Format output as json.

FLAG DESCRIPTIONS
  --verbose  Show additional information about the CLI.

    Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/v1.1.1/src/commands/version.ts)_
<!-- commandsstop -->

_See code: [src/commands/run/index.ts](https://github.com/H4ad/node-modules-packer/blob/v1.0.0/src/commands/run/index.ts)_

</details>

[build-img]:https://github.com/H4ad/node-modules-packer/actions/workflows/release.yml/badge.svg

[build-url]:https://github.com/H4ad/node-modules-packer/actions/workflows/release.yml

[downloads-img]:https://img.shields.io/npm/dt/@h4ad/node-modules-packer

[downloads-url]:https://www.npmtrends.com/@h4ad/node-modules-packer

[npm-img]:https://img.shields.io/npm/v/@h4ad/node-modules-packer

[npm-url]:https://www.npmjs.com/package/@h4ad/node-modules-packer

[issues-img]:https://img.shields.io/github/issues/H4ad/node-modules-packer

[issues-url]:https://github.com/H4ad/node-modules-packer/issues

[codecov-img]:https://codecov.io/gh/H4ad/node-modules-packer/branch/master/graph/badge.svg

[codecov-url]:https://codecov.io/gh/H4ad/node-modules-packer

[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg

[semantic-release-url]:https://github.com/semantic-release/semantic-release

[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[commitizen-url]:http://commitizen.github.io/cz-cli/
