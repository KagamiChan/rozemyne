export interface MarkdownDocument {
  attributes: {
    title: string
    date: string
    draft: boolean
  }
  toc: { level: string; content: string }[]
  html: string
}
