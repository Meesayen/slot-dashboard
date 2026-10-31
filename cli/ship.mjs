/* eslint-disable no-console */

import fetch from 'cross-fetch'
import inquirer from 'inquirer'
import { Octokit } from '@octokit/core'
import * as gb from './gitbutler.mjs'
import minimist from 'minimist'

const args = minimist(process.argv.slice(2))

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

async function collectGitInfo() {
  const exec = (await import('execa')).execaCommand
  const { stdout: branches } = await exec(
    `git branch --format=%(refname:short)`,
  )
  const { stdout: remoteBranches } = await exec(
    `git branch -r --format=%(refname:short)`,
  )
  const { stdout: currentBranch } = await exec(
    'git rev-parse --abbrev-ref HEAD',
  )
  return {
    branches: branches.split('\n'),
    remoteBranches: remoteBranches
      .split('\n')
      .map(b => b.replace('origin/', '')),
    currentBranch,
  }
}

function toSentence([first, ...rest]) {
  return `${first.toUpperCase()}${rest.join('')}`
    .replace(/[^a-zA-Z]/g, ' ')
    .replace(/\s+/, ' ')
    .trim()
}

async function quickShipToPreprod() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  const inputs = {
    heroku_token: process.env.HEROKU_TOKEN,
    heroku_email: process.env.HEROKU_EMAIL,
  }

  const parameters = {
    owner: 'redacted-owner',
    repo: 'redacted-repo',
    workflow_id: 'redacted-workflow-id',
    ref: 'master',
    inputs: inputs,
  }

  // trigger the appropriate github actions workflow
  await octokit.request(
    'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
    parameters,
  )
}

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

  if (args.preprod === true) {
    const spinner = ora('Deploying to preprod').start()
    try {
      await quickShipToPreprod()
      spinner.stop()
      console.log('')
      console.log('Done!')
    } catch (error) {
      spinner.stop()
      console.log(error)
    }
    return
  }

  const spinner = ora('Fetching slots info').start()

  // fetch feature slots data
  /** @type {Slot[]} */
  const slots = await (await fetch('redacted-dashboard-url')).json()

  spinner.text = 'Collecting git info'
  const gitInfo = await collectGitInfo()
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
      type: 'list',
      name: 'slotId',
      message: 'Where do you want to deploy?',
      choices: slots.map(s => {
        let name = s.name
        if (!s.is_preprod && !s.available) {
          name = `${s.name}\x1b[3m\x1b[90m – "${s.feature}" by ${
            s.claimed_by?.username === gitUser.login
              ? 'you'
              : (s.claimed_by?.nickname ?? s.claimed_by?.username)
          }\x1b[39m\x1b[23m`
        }
        return {
          name,
          value: s.slotId,
          short: s.name,
        }
      }),
    },
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'This slot is already taken. Are you sure you want to continue?',
      when(answers) {
        const chosenSlot = slotsMap.get(answers.slotId)
        if (chosenSlot?.is_preprod) return false
        if (chosenSlot?.available) return false
        if (!chosenSlot?.claimed_by?.username) return false
        return chosenSlot.claimed_by.username !== gitUser.login
      },
    },
  ])

  if (slotAnswers.confirmed === false) {
    console.log('')
    console.log('Ok, good day!')
    return
  }

  const chosenSlot = slotsMap.get(slotAnswers.slotId)
  if (!chosenSlot) throw Error('Something went wrong while choosing a slot.')

  const isPreprodSlot = chosenSlot.is_preprod

  let currentBranch = gitInfo.currentBranch
  let branchesToChooseFrom = gitInfo.branches

  if (await gb.isUsingGitButler()) {
    const gitbutlerBranches = await gb.collectGitButlerBranches()
    if (gitbutlerBranches.length) {
      currentBranch = gitbutlerBranches[0]
      branchesToChooseFrom = gitInfo.remoteBranches
        .sort((a, b) => {
          if (gitbutlerBranches.indexOf(a) === -1) return 1
          if (gitbutlerBranches.indexOf(b) === -1) return -1
          return gitbutlerBranches.indexOf(a) - gitbutlerBranches.indexOf(b)
        })
        .map(b => ({
          name: gitbutlerBranches.includes(b)
            ? `${b}\x1b[3m\x1b[90m – (yours)\x1b[39m\x1b[23m`
            : b,
          value: b,
          short: b,
        }))
    }
  }

  // questions: what branch to deploy
  // (if not deploying to a preprod slot, in which case we default to master)
  const otherAnswers = await inquirer.prompt([
    {
      when: !isPreprodSlot,
      type: 'list',
      name: 'branch',
      message: 'Which branch do you want to deploy?',
      default: currentBranch,
      choices: branchesToChooseFrom,
    },
    {
      when: !isPreprodSlot,
      type: 'text',
      name: 'feature',
      message: 'What feature are you deploying?',
      default(answers) {
        if (chosenSlot.branch === answers.branch) {
          return chosenSlot.feature
        }
        return toSentence(answers.branch)
      },
    },
  ])

  // if the branch is not already on remote, we need to push it first.
  // question: continue and push the branch
  const shouldPushBranch = await inquirer.prompt([
    {
      when:
        Boolean(otherAnswers.branch) &&
        !gitInfo.remoteBranches.find(rb => rb.includes(otherAnswers.branch)),
      type: 'confirm',
      name: 'confirmed',
      message: 'This branch is not on remote. Continue and push the branch?',
    },
  ])

  if (shouldPushBranch.confirmed === false) {
    console.log('')
    console.log('Ok, good day!')
    return
  }

  const data = isPreprodSlot
    ? {
        target: chosenSlot.slotId,
        branch: 'master',
      }
    : {
        target: chosenSlot.slotId,
        branch: otherAnswers.branch,
        feature: otherAnswers.feature,
      }

  console.log(`
Deployment recap:

  Time: ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(Date.now())}
  Target: ${data.target}
  Branch: ${data.branch}
  ${data.feature ? `Feature: ${data.feature}` : ''}
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

  spinner.start('Deploying')
  try {
    const inputs = {
      heroku_token: process.env.HEROKU_TOKEN,
      heroku_email: process.env.HEROKU_EMAIL,
    }

    const parameters = {
      owner: 'redacted-owner',
      repo: 'redacted-repo',
    }

    if (isPreprodSlot) {
      parameters.workflow_id = 'redacted-worflow-id'
      parameters.ref = data.branch
      parameters.inputs = inputs
    } else {
      parameters.workflow_id = 'redacted-workflow-id'
      parameters.ref = data.branch
      parameters.inputs = {
        ...inputs,
        slotId: data.target,
      }
    }

    // push the branch to remote if necessary
    if (shouldPushBranch.confirmed === true) {
      const exec = (await import('execa')).execaCommand
      await exec(`git push -u origin ${data.branch}`)
    }

    // trigger the appropriate github actions workflow
    await octokit.request(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
      parameters,
    )

    // signal the slots dashboard of change, if necessary
    // todo: maybe send data for preprod depolyments too to show what is currently deployed
    if (!isPreprodSlot) {
      const res = await fetch(`redacted-dashboard-url/${data.target}`, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: JSON.stringify({
          username: gitUser.login,
          feature: data.feature,
          branch: data.branch,
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
