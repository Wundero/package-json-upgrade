import * as vscode from 'vscode'

const isPackageJson = (document: vscode.TextDocument) => {
  // Is checking both slashes necessary? Test on linux and mac.
  const re = /.*[\\/]package\.json$/
  return re.test(document.fileName)
}

const isPnpmWorkspace = (document: vscode.TextDocument) => {
  return document.fileName.endsWith('pnpm-workspace.yaml')
}

export const getFileType = (document: vscode.TextDocument) => {
  if (isPackageJson(document)) {
    return 'package.json'
  }
  if (isPnpmWorkspace(document)) {
    return 'pnpm-workspace.yaml'
  }
  return null
}
