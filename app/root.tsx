import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import { cn } from './utils'
import Logo from './assets/svg/logo.svg?react'
import ArrowUpLeft from '~/assets/svg/arrow-up-left.svg?react'
import LoaderCircle from '~/assets/svg/loader-circle.svg?react'
import { NavLink } from './components/nav-link'
import { Block } from './components/block'
import Github from '~/assets/svg/github.svg?react'

export function meta({}: Route.MetaArgs) {
  return [
    { title: '少年读书隙中窥月' },
    { name: 'description', content: '镜的个人日志' },
    { name: 'keywords', content: '镜, 少年读书隙中窥月, 日志, BLOG' },
  ]
}

export const links: Route.LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
  },
  {
    rel: 'stylesheet',
    href: '/fonts/ibm/plex-sans-sc/IBMPlexSansSC-Regular.css',
  },
  {
    rel: 'stylesheet',
    href: '/fonts/ibm/plex-mono/400.css',
  },
]

const GRID = cn(
  'grid grid-cols-[var(--gutter-width)_minmax(0,var(--breakpoint-sm))_var(--gutter-width)] justify-center [--gutter-width:0.5rem] sm:[--gutter-width:4rem]',
)

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" className="overflow-y-scroll">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="isolate">
          <div className="max-w-screen overflow-x-hidden">
            <Block
              className={cn(
                GRID,
                'fixed top-0 z-10 h-16 w-full bg-white/50 backdrop-blur-sm',
              )}
            >
              <div></div>
              <div className="relative">
                <NavLink
                  to="/"
                  className="group flex h-full w-16 items-center justify-center [.active]:hidden"
                >
                  <ArrowUpLeft className="size-6 group-[.pending]:hidden" />
                  <LoaderCircle className="hidden size-6 animate-spin group-[.pending]:block" />
                </NavLink>
              </div>
              <div></div>
            </Block>
            <div className={cn(GRID, 'min-h-dvh')}>
              <div></div>
              <div className="relative flex flex-col">
                <div className="h-16"></div>
                <Block className="flex h-16 items-center px-2">
                  <h1 className="flex items-center">
                    <Logo className="text-rozemyne-900 h-12 w-auto" />
                    <span className="sr-only">少年读书隙中窥月</span>
                  </h1>
                </Block>
                <Block className="grow">{children}</Block>
                <Block
                  role="footer"
                  className="relative mt-16 flex min-h-16 items-center justify-between px-2"
                >
                  <p>2013-{new Date().getFullYear()} 鏡 / CC-BY-SA 4.0</p>
                  <a
                    href="https://github.com/kagamichan"
                    target="_blank"
                    className="opacity-50 transition-opacity hover:opacity-100"
                  >
                    <Github className="size-4" />
                  </a>
                  <code
                    className="text-rozemyne-900 absolute -top-5 right-2 text-xs"
                    title={__BUILD_TIME__}
                  >
                    rozemyne {__BUILD_HASH__.slice(0, 8)}
                  </code>
                </Block>
              </div>
              <div></div>
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
