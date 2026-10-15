import { Block } from '~/components/block'
import { Giscus } from '~/components/giscus'
import type { MarkdownDocument } from '~/types'

import type { Route } from './+types/post.$name'

export function meta({ loaderData, params }: Route.MetaArgs) {
  const post = loaderData?.post
  return [
    {
      title: post?.attributes.title
        ? `${post.attributes.title} - 少年读书隙中窥月`
        : '少年读书隙中窥月',
    },
    { name: 'description', content: '镜的个人日志' },
    { name: 'keywords', content: '镜, 少年读书隙中窥月, 日志, BLOG' },
    // Pin Giscus's discussion backlink to production so local and www visits
    // never become the link on the actual post.
    ...(post && !post.attributes.draft
      ? [{ name: 'giscus:backlink', content: `https://kagami.moe/post/${params.name}` }]
      : []),
  ]
}

export async function loader({ params }: Route.LoaderArgs) {
  const post: MarkdownDocument = await import(`../contents/posts/${params.name}.md`)

  if (import.meta.env.PROD && post.attributes.draft) {
    throw new Response('Not Found', { status: 404 })
  }

  return { post }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <div className="px-2 pt-10 pb-6">
        <h1 className="text-2xl leading-10 font-semibold text-balance">
          {loaderData.post.attributes.title}
        </h1>
        <time
          className="mt-3 block text-sm text-gray-500"
          dateTime={loaderData.post.attributes?.date}
        >
          {new Intl.DateTimeFormat('zh-Hans', {
            dateStyle: 'long',
          }).format(new Date(loaderData.post.attributes?.date))}
        </time>
      </div>
      <Block
        className="prose w-full max-w-none px-2 text-pretty dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: loaderData.post.html }}
      />
      {!loaderData.post.attributes.draft && (
        <div className="mt-16 border-t border-gray-200 px-2 pt-8 dark:border-gray-800">
          <Giscus />
        </div>
      )}
    </article>
  )
}
