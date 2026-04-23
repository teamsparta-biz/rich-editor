export const storage = {
  save(key: string, html: string): void {
    localStorage.setItem(key, html)
  },
  load(key: string): string | null {
    return localStorage.getItem(key)
  },
  clear(key: string): void {
    localStorage.removeItem(key)
  },
}
