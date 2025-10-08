export interface Post {
  attributes: {
    title: string
    date: string
    draft: boolean
  }
  toc: { level: string; content: string }[]
  html: string
}

export interface MarkdownDocument {
  html: string
}
