import type { Post } from '~/types'
import type { Route } from './+types/post.$name'

export async function loader({ params }: Route.LoaderArgs) {
  const post: Post = await import(`../contents/posts/${params.name}.md`)
  return { post }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <article>
      <div className="relative flex w-full items-center justify-between border-b border-gray-950/10 dark:border-white/5">
        <h1 className="px-2 text-4xl leading-relaxed">
          {loaderData.post.attributes.title}
        </h1>
        <time className="absolute right-2 -bottom-6 text-sm text-gray-500">
          {new Intl.DateTimeFormat('zh-Hans', {
            dateStyle: 'long',
          }).format(new Date(loaderData.post.attributes?.date))}
        </time>
      </div>
      <div
        className="prose-lg px-2 pt-16"
        dangerouslySetInnerHTML={{ __html: loaderData.post.html }}
      />
    </article>
  )
}
