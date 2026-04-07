import { EmojiEntry, EmojiGroup } from "./types"

function normalizeSearchText(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").toLowerCase()
}

function splitWords(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function scoreEntry(entry: EmojiEntry, query: string) {
  const name = normalizeSearchText(entry.name)
  const group = normalizeSearchText(entry.group)
  const keywords = entry.keywords.map(normalizeSearchText)
  const nameWords = splitWords(name)
  const tokens = query.split(/\s+/).filter(Boolean)

  let score = 0

  if (entry.glyph === query) {
    score += 20000
  }

  if (name === query) {
    score += 12000
  }

  if (nameWords.includes(query)) {
    score += 11500
  }

  if (keywords.includes(query)) {
    score += 10000
  }

  if (name.startsWith(query)) {
    score += 7000
  }

  for (const word of nameWords) {
    if (word.startsWith(query)) {
      score += 6500
      break
    }
  }

  for (const keyword of keywords) {
    if (keyword.startsWith(query)) {
      score += 6000
      break
    }
  }

  for (const token of tokens) {
    if (name === token) {
      score += 5000
    }

    if (nameWords.includes(token)) {
      score += 4500
    }

    if (keywords.includes(token)) {
      score += 4000
    }

    if (name.startsWith(token)) {
      score += 2500
    }

    for (const word of nameWords) {
      if (word.startsWith(token)) {
        score += 2200
        break
      }
    }

    for (const keyword of keywords) {
      if (keyword.startsWith(token)) {
        score += 2000
        break
      }
    }
  }

  const nameIndex = name.indexOf(query)
  if (nameIndex !== -1) {
    score += Math.max(0, 3000 - nameIndex * 25)
  }

  for (const keyword of keywords) {
    const keywordIndex = keyword.indexOf(query)
    if (keywordIndex !== -1) {
      score += Math.max(0, 2000 - keywordIndex * 20)
      break
    }
  }

  const groupIndex = group.indexOf(query)
  if (groupIndex !== -1) {
    score += Math.max(0, 300 - groupIndex * 10)
  }

  score += Math.max(0, 120 - name.length)

  if (name.includes(query) && !keywords.includes(query)) {
    score += 900
  }

  return score
}

export function filterEmojiEntries(entries: EmojiEntry[], query: string) {
  const trimmed = normalizeSearchText(query.trim())

  if (!trimmed) {
    return [...entries].sort((left, right) => left.order - right.order)
  }

  return entries
    .filter((entry) => entry.searchText.includes(trimmed))
    .sort((left, right) => {
      const scoreDelta = scoreEntry(right, trimmed) - scoreEntry(left, trimmed)

      if (scoreDelta !== 0) {
        return scoreDelta
      }

      return left.order - right.order
    })
}

export function groupEmojiEntries(entries: EmojiEntry[]): EmojiGroup[] {
  const groups = new Map<string, EmojiEntry[]>()

  for (const entry of entries) {
    const groupEntries = groups.get(entry.group) ?? []
    groupEntries.push(entry)
    groups.set(entry.group, groupEntries)
  }

  return [...groups.entries()].map(([name, groupedEntries]) => ({
    name,
    entries: groupedEntries,
  }))
}

export function pickFocusedEntry(entries: EmojiEntry[], focusIndex: number) {
  if (entries.length === 0) {
    return null
  }

  return entries[Math.min(Math.max(focusIndex, 0), entries.length - 1)]
}