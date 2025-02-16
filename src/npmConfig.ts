import { execSync } from 'child_process'
import * as npmRegistryFetch from 'npm-registry-fetch'
import { getConfig } from './config'
import { Dict } from './types'

let skippedNpmConfigLastTime: boolean | undefined

const packageJsonPathToConfMap: Dict<string, npmRegistryFetch.Options> = {}

export const getNpmConfig = (packageJsonPath: string): npmRegistryFetch.Options => {
  let conf = packageJsonPathToConfMap[packageJsonPath]
  const skipNpmConfig = getConfig().skipNpmConfig
  if (conf === undefined || skipNpmConfig !== skippedNpmConfigLastTime) {
    if (skipNpmConfig) {
      conf = {}
      console.debug('Defaulting to empty config')
    } else {
      const res = execSync(`npm config list --json`, {
        cwd: packageJsonPath,
        encoding: 'utf8',
      })
      conf = JSON.parse(res) as npmRegistryFetch.Options
      delete conf.cache
      packageJsonPathToConfMap[packageJsonPath] = conf
    }

    skippedNpmConfigLastTime = skipNpmConfig
  }
  return conf
}
