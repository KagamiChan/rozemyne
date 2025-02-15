import { NavLink } from 'react-router'
import type { Route } from './+types/_index'
import { fileName } from '~/utils'
import type { Post } from '~/types'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export function loader({}: Route.LoaderArgs) {
  const posts: Record<string, Post> = import.meta.glob(
    '../contents/posts/*.md',
    { eager: true },
  )
  return { posts }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col">
      {Object.keys(loaderData.posts).map((url) => (
        <NavLink
          className="hover:bg-rozemyne-900 group flex h-16 w-full items-center justify-between border-b border-gray-950/10 px-2 text-xl transition-colors hover:text-white dark:border-white/5"
          to={`/post/${fileName(url)}`}
          key={url}
        >
          <span>
            {loaderData.posts[url]?.attributes?.title ?? fileName(url)}
          </span>

          <time
            dateTime={loaderData.posts[url]?.attributes?.date}
            className="self-start justify-self-end text-sm text-gray-500 group-hover:text-white"
          >
            {new Intl.DateTimeFormat('zh-Hans', {
              dateStyle: 'long',
            }).format(new Date(loaderData.posts[url]?.attributes?.date))}
          </time>
        </NavLink>
      ))}
    </div>
  )
}
