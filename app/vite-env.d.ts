/// <reference types="vite-plugin-svgr/client" />

declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

declare module '*.md' {
  import { MarkdownDocument } from './types'
  const content: MarkdownDocument
  export = content
}
