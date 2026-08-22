import { Fragment } from 'react'

import LoaderCircle from '~/assets/svg/loader-circle.svg?react'
import { NavLink } from '~/components/nav-link'
import type { MarkdownDocument } from '~/types'
import { fileName } from '~/utils'

import type { Route } from './+types/_index'

export function loader(_: Route.LoaderArgs) {
  const posts: Record<string, MarkdownDocument> = import.meta.glob('../contents/posts/*.md', {
    eager: true,
  })
  return { posts }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const posts = Object.entries(loaderData.posts)
    .filter(([_, post]) => !post.attributes.draft || import.meta.env.DEV)
    .sort((a, b) => {
      return new Date(b[1].attributes.date).getTime() - new Date(a[1].attributes.date).getTime()
    })

  const yearFormatter = new Intl.DateTimeFormat('zh-Hans', { year: 'numeric' })
  const dateFormatter = new Intl.DateTimeFormat('zh-Hans', { dateStyle: 'long' })

  let lastYear: string | undefined

  return (
    <div className="flex flex-col">
      {posts.map(([url, data]) => {
        const date = new Date(data?.attributes?.date)
        const year = yearFormatter.format(date)
        const showYear = year !== lastYear
        lastYear = year

        return (
          <Fragment key={url}>
            {showYear && (
              <h2 className="px-2 pt-10 pb-2 text-sm text-gray-400 first:pt-2" aria-hidden>
                {year}
              </h2>
            )}
            <NavLink
              className="group relative flex w-full items-baseline gap-3 px-2 py-1.5 text-xl leading-8 text-balance transition-colors"
              to={`/post/${fileName(url)}`}
            >
              <time
                dateTime={data?.attributes?.date}
                className="w-32 shrink-0 self-center text-right text-sm text-gray-500 tabular-nums group-hover:text-white group-[.pending]:text-white"
              >
                {dateFormatter.format(date)}
              </time>

              <span>{data?.attributes?.title ?? fileName(url)}</span>

              <LoaderCircle className="hidden size-4 shrink-0 animate-spin self-center group-[.pending]:block" />
            </NavLink>
          </Fragment>
        )
      })}
    </div>
  )
}
