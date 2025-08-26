/**
 * MIT License
 *
 * Copyright (c) 2023–Present PPResume (https://ppresume.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { Command } from 'commander'

import packageJson from '../package.json' with { type: 'json' }
import {
  buildResume,
  createBuildCommand,
  createDevCommand,
  createLanguagesCommand,
  createNewCommand,
  createTemplatesCommand,
  createValidateCommand,
} from './commands'
import { setVerboseLog } from './utils'

export const program = new Command()

const banner = `
 __   __ _    __  __ _     ____
 \\ \\ / // \\  |  \\/  | |   |  _ \\ ___  ___ _   _ ___  ___   ___
  \\ V // _ \\ | |\\/| | |   | |_) / _ \\/ __| | | / _ \\/ _ \\ / _ \\
   | |/ ___ \\| |  | | |___|  _ <  __/\\__ \\ |_| | | | | | |  __/
   |_/_/   \\_\\_|  |_|_____|_| \\_\\___||___/\\____|_| |_| |_|\\___|
`

program
  .name('yamlresume')
  .description(['YAMLResume — Resume as Code in YAML', banner].join('\n'))
  .version(packageJson.version)
  .option('-v, --verbose', 'verbose output')
  .hook('preAction', (thisCommand) => {
    setVerboseLog(thisCommand.opts().verbose)
  })

program.addCommand(createNewCommand())
program.addCommand(createBuildCommand())
program.addCommand(createDevCommand())
program.addCommand(createLanguagesCommand())
program.addCommand(createTemplatesCommand())
program.addCommand(createValidateCommand())

// Add support for shorthand syntax: yamlresume resume.yml
// This should work the same as: yamlresume build resume.yml
program
  .argument('[file]', 'resume file to build (shorthand for build command)')
  .option('--no-pdf', 'only generate TeX file without PDF')
  .option('--no-validate', 'skip resume schema validation')
  .action(async (file: string | undefined, options: { pdf: boolean; validate: boolean }) => {
    if (!file) {
      // If no file provided, show help
      program.help()
      return
    }

    // Check if the file argument looks like a resume file
    const isResumeFile = /\.(ya?ml|json)$/i.test(file)
    
    if (!isResumeFile) {
      // If it doesn't look like a resume file, treat it as an unknown command
      console.error(`error: unknown command '${file}'`)
      console.error('')
      program.help()
      return
    }

    try {
      // Use the build functionality with the provided options
      buildResume(file, options)
    } catch (error) {
      console.error(error.message)
      process.exit(error.errno || 1)
    }
  })
