import type { Route } from './+types/_index'
import { fileName } from '~/utils'
import type { MarkdownDocument } from '~/types'
import LoaderCircle from '~/assets/svg/loader-circle.svg?react'
import { NavLink } from '~/components/nav-link'

export function loader({}: Route.LoaderArgs) {
  const posts: Record<string, MarkdownDocument> = import.meta.glob(
    '../contents/posts/*.md',
    { eager: true },
  )
  return { posts }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const posts = Object.entries(loaderData.posts)
    .filter(([_, post]) => !post.attributes.draft || import.meta.env.DEV)
    .sort((a, b) => {
      return (
        new Date(b[1].attributes.date).getTime() -
        new Date(a[1].attributes.date).getTime()
      )
    })

  return (
    <div className="flex flex-col">
      {posts.map(([url, data]) => (
        <NavLink
          className="relative flex w-full items-center gap-2 px-2 text-xl leading-16 text-balance transition-colors"
          to={`/post/${fileName(url)}`}
          key={url}
        >
          <span>{data?.attributes?.title ?? fileName(url)}</span>

          <LoaderCircle className="hidden size-4 animate-spin group-[.pending]:block" />

          <time
            dateTime={data?.attributes?.date}
            className="absolute top-0 right-2 text-sm text-gray-500 group-hover:text-white group-[.pending]:text-white"
          >
            {new Intl.DateTimeFormat('zh-Hans', {
              dateStyle: 'long',
            }).format(new Date(data?.attributes?.date))}
          </time>
        </NavLink>
      ))}
    </div>
  )
}
