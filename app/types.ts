export interface MarkdownDocument {
  attributes: {
    title: string
    date: string
    revised?: string
    draft: boolean
  }
  toc: { level: string; content: string }[]
  html: string
}
