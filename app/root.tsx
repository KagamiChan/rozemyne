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
import type { HTMLProps, PropsWithChildren } from 'react'
import { cn } from './utils'

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="isolate">
          <div className="max-w-screen overflow-x-hidden">
            <div className="grid min-h-dvh grid-cols-[var(--gutter-width)_minmax(0,var(--breakpoint-sm))_var(--gutter-width)] justify-center [--gutter-width:4rem]">
              <div className="border-e border-gray-950/10 dark:border-white/5"></div>
              <div className="flex flex-col">
                <div className="h-16"></div>
                <Block className="flex items-center px-2">
                  <span className="text-6xl">
                    <svg
                      xmlns="http://www.w3.org/500/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 67.7 67.7"
                    >
                      <path fill="#233B6C" d="M8.5 8.5h50.8v50.8H8.5z" />
                    </svg>
                  </span>
                  <h1 className="inline align-middle text-6xl/24 font-bold">
                    少年读书隙中窥月
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
