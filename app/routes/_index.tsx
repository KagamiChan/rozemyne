import { NavLink } from 'react-router'
import type { Route } from './+types/_index'
import { fileName } from '~/utils'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export function loader({ context }: Route.LoaderArgs) {
  const articles = import.meta.glob('../contents/posts/*.md', { eager: true })
  return { articles }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  console.log(loaderData.articles)
  return (
    <div className="flex flex-col gap-4">
      {Object.keys(loaderData.articles).map((url) => (
        <NavLink className="flex" key={url} to={`/post/${fileName(url)}`}>
          {fileName(url)}
        </NavLink>
      ))}
    </div>
  )
}
