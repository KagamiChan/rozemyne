import type { MarkdownDocument } from '~/types'
import type { Route } from './+types/about'
import { Block } from '~/components/block'

export function meta() {
  return [
    {
      title: '关于我 - 少年读书隙中窥月',
    },
    { name: 'description', content: '镜的个人日志' },
    { name: 'keywords', content: '镜, 少年读书隙中窥月, 日志, BLOG' },
  ]
}

export async function loader() {
  const content: MarkdownDocument = await import('../contents/about.md')
  return { content }
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <Block
        className="prose px-2 pt-16 text-pretty"
        dangerouslySetInnerHTML={{ __html: loaderData.content.html }}
      />
    </article>
  )
}
