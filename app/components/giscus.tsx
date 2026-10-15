import GiscusReact from '@giscus/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

// The repository's Discussions are configured in README "Comments".
const REPO = 'KagamiChan/rozemyne'
const REPO_ID = 'R_kgDON53mZA'
const CATEGORY = 'Announcements'
const CATEGORY_ID = 'DIC_kwDON53mZM4CnPuI'

export function Giscus() {
  const { pathname } = useLocation()
  const [theme, setTheme] = useState<string>()

  // Giscus loads the theme as a cross-origin <link>, so it needs the absolute
  // URL of the current origin to work on localhost, www and kagami.moe alike.
  useEffect(() => {
    setTheme(new URL('/giscus.css', window.location.origin).href)
  }, [])

  if (!theme) return null

  return (
    <GiscusReact
      // Remount per pathname so a different post never reuses a stale iframe.
      key={pathname}
      repo={REPO}
      repoId={REPO_ID}
      category={CATEGORY}
      categoryId={CATEGORY_ID}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      loading="lazy"
      lang="zh-CN"
      theme={theme}
    />
  )
}
