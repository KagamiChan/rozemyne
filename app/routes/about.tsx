import type { MarkdownDocument } from '~/types'

import { Block } from '~/components/block'

import type { Route } from './+types/about'

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
      <div className="relative flex w-full items-center justify-between py-16">
        <h1 className="px-2 text-2xl leading-16 font-semibold text-balance">
          {loaderData.content.attributes.title}
        </h1>
      </div>
      <Block
        className="prose w-full max-w-none px-2 pt-16 text-pretty"
        dangerouslySetInnerHTML={{ __html: loaderData.content.html }}
      />
    </article>
  )
}
