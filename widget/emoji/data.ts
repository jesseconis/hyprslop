import keywordLibrary from "emojilib/dist/emoji-en-US.json"
import emojiMetadataByGlyph from "unicode-emoji-json/data-by-emoji.json"
import orderedEmoji from "unicode-emoji-json/data-ordered-emoji.json"
import { EmojiEntry } from "./types"

const CUSTOM_KEYWORDS_BY_EMOJI: Record<string, string[]> = {
  "💧": ["water", "droplet", "drop", "liquid"],
  "🧑‍💻": ["developer", "programmer", "coder", "technologist", "software engineer"],
}

function normalizeKeywords(keywords: string[]) {
  return [...new Set(
    keywords
      .flatMap((keyword) => [keyword, keyword.replaceAll("_", " "), keyword.replaceAll("-", " ")])
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean),
  )]
}

function buildSearchText(glyph: string, name: string, group: string, keywords: string[]) {
  return [glyph, name, group, ...keywords]
    .join(" ")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
}

export const EMOJI_ENTRIES: EmojiEntry[] = orderedEmoji
  .map((glyph, order) => {
    const metadata = emojiMetadataByGlyph[glyph]

    if (!metadata) {
      return null
    }

    const keywords = normalizeKeywords([
      metadata.name,
      metadata.slug,
      ...(keywordLibrary[glyph] ?? []),
      ...(CUSTOM_KEYWORDS_BY_EMOJI[glyph] ?? []),
    ])

    return {
      glyph,
      name: metadata.name,
      keywords,
      group: metadata.group,
      order,
      searchText: buildSearchText(glyph, metadata.name, metadata.group, keywords),
    }
  })
  .filter((entry): entry is EmojiEntry => entry !== null)