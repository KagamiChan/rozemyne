import type { PropsWithChildren, HTMLProps } from 'react'
import { cn } from '../utils'

export function Block(props: PropsWithChildren<HTMLProps<HTMLDivElement>>) {
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
