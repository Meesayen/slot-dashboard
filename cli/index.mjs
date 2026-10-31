import './env.mjs'
import minimist from 'minimist'

const args = minimist(process.argv.slice(2))

switch (args._[0]) {
  case 'ship':
    import('./ship.mjs')
    break
  case 'promote':
    import('./promote.mjs')
    break
  case 'free':
    import('./freeslot.mjs')
    break
}
