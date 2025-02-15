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
  console.log(loaderData.posts)
  return (
    <div className="flex flex-col">
      <div className="h-16 border-b border-gray-950/10 dark:border-white/5"></div>
      {Object.keys(loaderData.posts).map((url) => (
        <div className="flex h-16 w-full items-center justify-between border-b border-gray-950/10 px-2 text-xl dark:border-white/5">
          <NavLink
            className="after:bg-rozemyne-500 relative after:absolute after:-bottom-2 after:-left-2 after:z-[-1] after:h-[calc(100%+1rem)] after:w-0 after:transition-all after:duration-500 hover:after:w-[calc(100%+1rem)]"
            key={url}
            to={`/post/${fileName(url)}`}
          >
            {loaderData.posts[url]?.attributes?.title ?? fileName(url)}
          </NavLink>
          <time className="self-start justify-self-end text-sm text-gray-500">
            {new Intl.DateTimeFormat('zh-Hans', {
              dateStyle: 'long',
            }).format(new Date(loaderData.posts[url]?.attributes?.date))}
          </time>
        </div>
      ))}
    </div>
  )
}
