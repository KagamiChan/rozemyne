import type { ComponentProps } from 'react'
import { NavLink as RouterNavLink } from 'react-router'

import { cn } from '~/utils'

export function NavLink(props: ComponentProps<typeof RouterNavLink>) {
  const { className, ...rest } = props
  return (
    <RouterNavLink
      {...rest}
      className={cn(
        'group transition-colors hover:bg-rozemyne-900 hover:text-white [.pending]:bg-rozemyne-900 [.pending]:text-white',
        className,
      )}
    />
  )
}
