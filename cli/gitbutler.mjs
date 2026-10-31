import { stat, readFile } from 'fs/promises'
import { parse } from '@iarna/toml'

const gitButlerPath = `./.git/gitbutler`
const gitButlerConfigFile = `${gitButlerPath}/virtual_branches.toml`

export async function isUsingGitButler() {
  try {
    await stat(gitButlerConfigFile)
    return true
  } catch {
    // noop
  }
  return false
}

export async function collectGitButlerBranches() {
  try {
    const configToml = await readFile(gitButlerConfigFile)
    const config = parse(configToml)
    const branchesData = Object.values(config.branches)
      .filter(b => b.in_workspace)
      .flatMap(b => (b.heads ? [b.name, ...b.heads.map(h => h.name)] : b.name))

    const branches = []

    const exec = (await import('execa')).execaCommand
    const { stdout: ownBranches } = await exec(
      `git for-each-ref --format=' %(authoremail) %09 %(refname)' --sort=authoremail |grep "$(git config user.email)" |grep refs/remote`,
      {
        shell: true,
      },
    )

    // todo: gitbutler recently changed their internal config stuff so now we need to look
    // for branches in the projects .git/refs folder, but we lack info on what branch is the
    // currently active one in GitButler from this git basic data.
    // Will need to look into how to extract this info from GitButler somehow.
    for (const branch of branchesData) {
      if (!ownBranches.includes(branch)) continue
      branches.push(branch.toLowerCase())
    }

    return branches
  } catch {
    // noop
  }
  return []
}
