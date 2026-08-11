import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import initRepo from './controllers/init.js'
import AddFile from './controllers/add.js'
import CommitFile from './controllers/commit.js'
import PushFile from './controllers/push.js'
import PullFile from './controllers/pull.js'
import RevertFile from './controllers/revert.js'

yargs(hideBin(process.argv)).command('init', 'Initialize new repo', {}, (argv) => {
  initRepo(argv)
}).command('add <file>', 'Add files to stage', {}, (argv) => {
  AddFile(argv)
}).command('commit <message>', 'Save staged changes to history', {}, (argv) => {
  CommitFile(argv)
}).command('push', 'Upload local commits to remote repo', {}, (argv) => {
  PushFile(argv)
}).command('pull', 'Retrieve remote repo details', {}, (argv) => {
  PullFile(argv)
}).command('revert <commitId>', 'Revert to a previous commit', {}, (argv) => {
  RevertFile(argv)
}).demandCommand(1).help().argv