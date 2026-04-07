export interface EmojiEntry {
  glyph: string
  name: string
  keywords: string[]
  group: string
  order: number
  searchText: string
}

export interface EmojiGroup {
  name: string
  entries: EmojiEntry[]
}

export type ClipboardWriteMode = "replace" | "append"