import { createContext } from 'react-router'

export const cloudflareContext = createContext<{
  env: CloudflareEnvironment
  ctx: ExecutionContext
} | null>(null)
