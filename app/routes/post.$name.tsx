import type { Post } from '~/types'
import type { Route } from './+types/post.$name'
import { NavLink } from 'react-router'
import ArrowLeft from '~/assets/svg/arrow-left.svg?react'

export async function loader({ params }: Route.LoaderArgs) {
  const post: Post = await import(`../contents/posts/${params.name}.md`)
  return { post }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="h-16 border-b border-gray-950/10 dark:border-white/5">
        <NavLink
          to="/"
          className="after:bg-rozemyne-500 relative flex h-full w-16 items-center justify-center border-r border-gray-950/10 after:absolute after:bottom-0 after:left-0 after:z-[-1] after:h-full after:w-0 after:transition-all after:duration-500 hover:after:w-full dark:border-white/5"
        >
          <ArrowLeft className="size-6" />
        </NavLink>
      </div>
      <div
        className="prose-xl px-2"
        dangerouslySetInnerHTML={{ __html: loaderData.post.html }}
      />
    </>
  )
}
