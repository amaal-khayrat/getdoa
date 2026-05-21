//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: ['.output/**', 'node_modules/**', 'src/routeTree.gen.ts'],
  },
  ...tanstackConfig,
]
