import type { PropsWithChildren, HTMLProps } from 'react'

import { cn } from '../utils'

export function Block(props: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
  const { children, className, ...rest } = props
  return (
    <div {...rest} className={cn('relative', className)}>
      {children}
    </div>
  )
}
