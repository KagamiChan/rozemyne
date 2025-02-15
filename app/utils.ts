export const fileName = (path: string) =>
  path.split('/').pop()?.split('.').slice(0, -1).join('.')
