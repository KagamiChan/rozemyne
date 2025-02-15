import type { Route } from './+types/post.$name'

export async function loader({ params }: Route.LoaderArgs) {
  const article = await import(`../contents/posts/${params.name}.md`)
  return { article }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: loaderData.article.html }}
    />
  )
}
