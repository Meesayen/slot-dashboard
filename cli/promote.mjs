/* eslint-disable no-console */
import { Octokit } from '@octokit/core'

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

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  const { data: gitUser } = await octokit.request('GET /user')

  if (!gitUser) {
    throw Error(
      'The GITHUB_TOKEN provided was not able to authenticate a valid user.',
    )
  }

  const spinner = ora('Promoting to production').start()
  try {
    await octokit.request(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
      {
        owner: 'redacted-owner',
        repo: 'redacted-repo',
        workflow_id: 'redacted-workflow-id',
        ref: 'master',
        inputs: {
          heroku_token: process.env.HEROKU_TOKEN,
          heroku_email: process.env.HEROKU_EMAIL,
        },
      },
    )

    spinner.stop()
    console.log('')
    console.log('Done!')
  } catch (error) {
    spinner.stop()
    console.log(error)
  }
}

main().catch(e => console.log(e))
