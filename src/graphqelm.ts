const Elm = require('./Main.elm')
import * as fs from 'fs-extra'
import { GraphQLClient } from 'graphql-request'
import * as http from 'http'
import * as minimist from 'minimist'
import * as request from 'request'
import { writeFile } from './formatted-write'
import { introspectionQuery } from './introspection-query'
import * as glob from 'glob'
import * as path from 'path'
const npmPackageVersion = require('../package.json').version
const elmPackageVersion = require('../elm-package.json').version

const usage = `Usage:
  graphqelm url # generate files based on the schema at \`url\` in folder ./src/Api
  graphqelm url --base My.Api.Submodule # generate files based on the schema at \`url\` in folder ./src/My/Api/Submodule
  graphqelm url --output path/to/src # generates code within path/to/src/Api
  graphqelm url --output path/to/src --base My.Api.Submodule # generates code within path/to/src/My/Api/Submodule
  graphqelm url --excludeDeprecated # excludes deprecated enums and fields (they are included by default)

  graphqelm --version # print the current graphqelm version and target elm package version
  graphqelm url [--header 'headerKey: header value'...] # you can supply multiple header args`

function isGenerated(path: string): boolean {
  return (
    fs
      .readFileSync(path)
      .indexOf(
        'Do not manually edit this file, it was auto-generated by Graphqelm'
      ) >= 0
  )
}
function warnIfContainsNonGenerated(path: string): void {
  const files: string[] = glob.sync(path + '/**/*.elm')
  const nonGenerated = files.filter(file => !isGenerated(file))

  if (nonGenerated.length > 0) {
    console.log(
      'Graphqelm found some files that it did not generate. Please move or delete the following files and run graphqelm again.',
      nonGenerated
    )
    process.exit(1)
  }
}

function removeGenerated(path: string): void {
  glob.sync(path + '/**/*.elm').forEach(fs.unlinkSync)
}

const targetComment = `-- Do not manually edit this file, it was auto-generated by Graphqelm
-- https://github.com/dillonkearns/graphqelm
`
const args = minimist(process.argv.slice(2))
if (args.version) {
  console.log('npm version ', npmPackageVersion)
  console.log(
    `Targeting elm package dillonkearns/graphqelm@${elmPackageVersion}`
  )
  process.exit(0)
}
const baseArgRegex = /^[A-Z][A-Za-z_]*(\.[A-Z][A-Za-z_]*)*$/
const baseModuleArg: undefined | string = args.base
const outputPath: string = args.output || './src'
function isValidBaseArg(baseArg: string): boolean {
  return !!baseArg.match(baseArgRegex)
}
if (baseModuleArg && !isValidBaseArg(baseModuleArg)) {
  console.log(
    `--base was '${baseModuleArg}' but must be in format ${baseArgRegex}`
  )
  process.exit(1)
}
const excludeDeprecated: boolean =
  args.excludeDeprecated === null || args.excludeDeprecated === undefined
    ? false
    : args.excludeDeprecated
const headerArg: undefined | string | [string] = args.header
const addHeader = (object: any, header: string) => {
  const [headerKey, headerValue] = header.split(':')
  object[headerKey] = headerValue
  return object
}
let headers = {}
if (typeof headerArg === 'string') {
  addHeader(headers, headerArg)
} else if (headerArg == undefined) {
} else {
  headerArg.forEach(header => {
    addHeader(headers, header)
  })
}
const baseModule = baseModuleArg ? baseModuleArg.split('.') : ['Api']
function prependBasePath(suffixPath: string): string {
  return path.join(outputPath, baseModule.join('/'), suffixPath)
}
const graphqlUrl: undefined | string = args._[0]
const introspectionFile: undefined | string = args['introspection-file']
if (!(graphqlUrl || introspectionFile)) {
  console.log(usage)
  process.exit(0)
}
warnIfContainsNonGenerated(prependBasePath('/'))

const onDataAvailable = (data: {}) => {
  console.log('Generating files...')
  let app = Elm.Main.worker({ data, baseModule })
  app.ports.generatedFiles.subscribe(function(generatedFile: any) {
    removeGenerated(prependBasePath('/'))
    fs.mkdirpSync(prependBasePath('InputObject'))
    fs.mkdirpSync(prependBasePath('Object'))
    fs.mkdirpSync(prependBasePath('Interface'))
    fs.mkdirpSync(prependBasePath('Union'))
    fs.mkdirpSync(prependBasePath('Enum'))
    for (let key in generatedFile) {
      let filePath = path.join(outputPath, key)
      let value = generatedFile[key]
      writeFile(filePath, targetComment + value)
    }
    fs.writeFileSync(
      prependBasePath('graphqelm-metadata.json'),
      `{"targetElmPackageVersion": "${elmPackageVersion}", "generatedByNpmPackageVersion": "${npmPackageVersion}"}`
    )
    console.log('Success!')
  })
}
if (introspectionFile) {
  const introspectionFileJson = JSON.parse(
    fs.readFileSync(introspectionFile).toString()
  )
  onDataAvailable(introspectionFileJson.data || introspectionFileJson)
} else {
  console.log('Fetching GraphQL schema...')
  new GraphQLClient(graphqlUrl, {
    mode: 'cors',
    headers: headers
  })
    .request(introspectionQuery, { includeDeprecated: !excludeDeprecated })
    .then(data => {
      onDataAvailable(data)
    })
    .catch(err => {
      console.log(err.response || err)
      process.exit(1)
    })
}
