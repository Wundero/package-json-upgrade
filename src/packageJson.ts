import { parse } from '@typescript-eslint/parser'
import { TSESTree } from '@typescript-eslint/types'
import { VariableDeclaration } from '@typescript-eslint/types/dist/generated/ast-spec'
import { DependencyGroups } from './dependency'

const DEPENDENCY_KEYS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions', // yarn
]

export const getPackageJsonDependencyInformation = (jsonAsString: string): DependencyGroups[] => {
  const jsonAsTypescript = `let tmp=${jsonAsString}`

  const ast = parse(jsonAsTypescript, {
    loc: true,
  })

  const variable = ast.body[0] as VariableDeclaration

  const tmp = variable.declarations[0]

  const init = tmp.init
  if (init == null || init.type !== 'ObjectExpression') {
    throw new Error(`unexpected type: ${init?.type}`)
  }

  const properties = init.properties as TSESTree.Property[]

  return properties
    .filter((p) => DEPENDENCY_KEYS.includes((p.key as TSESTree.StringLiteral).value))
    .map(toDependencyGroup)
}

function toDependencyGroup(dependencyProperty: TSESTree.Property): DependencyGroups {
  if (dependencyProperty.value.type !== 'ObjectExpression') {
    throw new Error('unexpected type')
  }
  const dependencies = dependencyProperty.value.properties as TSESTree.Property[]

  const d = dependencies.map((dep) => {
    return {
      dependencyName: (dep.key as TSESTree.StringLiteral).value,
      currentVersion: (dep.value as TSESTree.StringLiteral).value,
      // TODO investigate exactly why we have "off by one" error
      line: dep.loc.end.line - 1,
    }
  })

  return {
    startLine: dependencyProperty.loc.start.line - 1,
    deps: d,
  }
}
