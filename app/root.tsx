import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import type { HTMLProps, PropsWithChildren } from 'react'
import { cn } from './utils'
import Logo from './assets/svg/logo.svg?react'
import ArrowLeft from '~/assets/svg/arrow-left.svg?react'
export const links: Route.LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
  },
]

function Block(props: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  const { children, className, ...rest } = props
  return (
    <div
      {...rest}
      className={cn(
        'relative before:absolute before:top-0 before:-left-[100vw] before:h-px before:w-[200vw] before:bg-gray-950/10 dark:before:bg-white/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

const GRID = cn(
  'grid grid-cols-[var(--gutter-width)_minmax(0,var(--breakpoint-sm))_var(--gutter-width)] justify-center [--gutter-width:4rem]',
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
                'fixed top-0 z-10 h-16 w-full bg-white/50 backdrop-blur-sm before:top-auto before:bottom-0',
              )}
            >
              <div className="border-e border-gray-950/10 dark:border-white/5"></div>
              <div className="relative">
                <NavLink
                  to="/"
                  className="hover:bg-rozemyne-900 group flex h-full w-16 items-center justify-center border-e border-gray-950/10 transition-colors hover:text-white dark:border-white/5 [.active]:hidden"
                >
                  <ArrowLeft className="size-6 group-[.pending]:animate-bounce" />
                </NavLink>
              </div>
              <div className="border-s border-gray-950/10 dark:border-white/5"></div>
            </Block>
            <div className={cn(GRID, 'min-h-dvh')}>
              <div className="border-e border-gray-950/10 dark:border-white/5"></div>
              <div className="relative flex flex-col">
                <div className="h-16"></div>
                <Block className="flex h-16 items-center px-2 before:hidden">
                  <h1 className="flex items-center">
                    <Logo className="text-rozemyne-900 h-12 w-auto" />
                    <span className="sr-only">少年读书隙中窥月</span>
                  </h1>
                </Block>
                <Block className="grow">{children}</Block>
                <Block
                  role="footer"
                  className="mt-16 flex min-h-16 items-center px-2"
                >
                  <p>2013-{new Date().getFullYear()} 鏡 / CC-BY-SA 4.0</p>
                </Block>
              </div>
              <div className="border-s border-gray-950/10 dark:border-white/5"></div>
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
