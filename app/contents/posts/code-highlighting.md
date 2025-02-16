---
title: Code highlighting
date: 2024-04-20T00:00:00.000Z
draft: true
---
## TypeScript
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
