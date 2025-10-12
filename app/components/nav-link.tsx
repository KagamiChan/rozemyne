import type { ComponentProps } from 'react'

import { NavLink as RouterNavLink } from 'react-router'

import { cn } from '~/utils'

export function NavLink(props: ComponentProps<typeof RouterNavLink>) {
  const { className, ...rest } = props
  return (
    <RouterNavLink
      {...props}
      className={cn(
        'hover:bg-rozemyne-900 [.pending]:bg-rozemyne-900 group transition-colors hover:text-white [.pending]:text-white',
        className,
      )}
    />
  )
}
