const KEY = 'rich-editor-playground-html'

export const storage = {
  save(html: string): void {
    localStorage.setItem(KEY, html)
  },
  load(): string | null {
    return localStorage.getItem(KEY)
  },
  clear(): void {
    localStorage.removeItem(KEY)
  },
}
