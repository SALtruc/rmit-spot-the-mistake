export const asset = (path) => {
  const optimizedPath = path.replace(/\.png$/i, '.webp')
  return `/${optimizedPath.split('/').map(encodeURIComponent).join('/')}`
}

export const initials = { cv: 'CV', linkedin: 'in', interview: 'Q' }
