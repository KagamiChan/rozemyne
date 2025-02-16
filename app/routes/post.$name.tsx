import type { Post } from '~/types'
import type { Route } from './+types/post.$name'
import { Block } from '~/components/block'

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `${data.post.attributes.title} - 少年读书隙中窥月` },
    { name: 'description', content: '镜的个人日志' },
    { name: 'keywords', content: '镜, 少年读书隙中窥月, 日志, BLOG' },
  ]
}

export async function loader({ params }: Route.LoaderArgs) {
  const post: Post = await import(`../contents/posts/${params.name}.md`)
  return { post }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <div className="relative flex w-full items-center justify-between py-16">
        <h1 className="px-2 text-2xl leading-16 font-semibold">
          {loaderData.post.attributes.title}
        </h1>
        <time className="absolute right-2 bottom-0 text-sm text-gray-500">
          {new Intl.DateTimeFormat('zh-Hans', {
            dateStyle: 'long',
          }).format(new Date(loaderData.post.attributes?.date))}
        </time>
      </div>
      <Block
        className="prose-lg px-2 pt-16"
        dangerouslySetInnerHTML={{ __html: loaderData.post.html }}
      />
    </article>
  )
}
