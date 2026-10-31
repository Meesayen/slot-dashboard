/* eslint-disable no-console */

import fetch from 'cross-fetch'
import inquirer from 'inquirer'
import { Octokit } from '@octokit/core'

/**
 * @typedef {Object} Profile
 * @prop {string} id
 * @prop {string} username
 * @prop {string} avatar_url
 * @prop {string} nickname
 * @prop {string} email
 */
/**
 * @typedef {Object} Slot
 * @prop {number} id
 * @prop {string} name
 * @prop {string} feature
 * @prop {Profile} profile
 * @prop {boolean} available
 * @prop {string} updated_at
 * @prop {is_preprod} boolean
 */

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    throw 'Error: You have not correctly set the GITHUB_TOKEN environment variable.'
  }

  if (!process.env.HEROKU_TOKEN) {
    throw 'Error: You have not correctly set the HEROKU_TOKEN environment variable.'
  }

  if (!process.env.HEROKU_EMAIL) {
    throw 'Error: You have not correctly set the HEROKU_EMAIL environment variable.'
  }

  const ora = (await import('ora')).default

  const spinner = ora('Fetching slots info').start()

  // fetch feature slots data
  /** @type {Slot[]} */
  const slots = await (await fetch('redacted-dashboard-url')).json()

  spinner.text = 'Collecting git info'
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  const { data: gitUser } = await octokit.request('GET /user')
  spinner.stop()

  if (!gitUser) {
    throw Error(
      'The GITHUB_TOKEN provided was not able to authenticate a valid user.',
    )
  }

  const slotsMap = new Map(slots.map(s => [s.slotId, s]))

  // questions: where to deploy
  const slotAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'slotIds',
      message: 'Which slot(s) do you want to free?',
      choices: slots.flatMap(s => {
        if (s.is_preprod) return []
        if (s.claimed_by?.username !== gitUser.login) return []

        const name = `${s.name}\x1b[3m\x1b[90m – "${s.feature}"\x1b[39m\x1b[23m`

        return [
          {
            name,
            value: s.slotId,
            short: s.name,
          },
        ]
      }),
      validate(input) {
        return Boolean(input.length)
      },
    },
  ])

  console.log(`
Recap:

  Freeing slot${slotAnswers.slotIds.length > 1 ? 's' : ''}:
${slotAnswers.slotIds
  .map(s => {
    const slot = slotsMap.get(s)
    return `    - ${slot.name}\x1b[3m\x1b[90m – "${slot.feature}"\x1b[39m\x1b[23m\n`
  })
  .join('')}
  `)

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Continue?',
    },
  ])

  if (answer.confirmed === false) {
    console.log('')
    console.log('Ok, good day!')
    return
  }

  spinner.start('Freeing')
  try {
    for (const slotId of slotAnswers.slotIds) {
      const res = await fetch(`redacted-dashboard-url/${slotId}/free`, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: JSON.stringify({
          username: gitUser.login,
        }),
      })

      if (!res.ok) {
        throw Error(await res.text())
      }
    }

    spinner.stop()
    console.log('')
    console.log('Done!')
  } catch (error) {
    spinner.stop()
    console.log(error)
  }
}

main().catch(e => console.log(e))
