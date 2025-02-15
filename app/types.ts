export interface Post {
  attributes: {
    title: string
    date: string
  }
  toc: { level: string; content: string }[]
  html: string
}
