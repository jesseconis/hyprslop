declare const SRC: string
declare const DEBUG: boolean | undefined

declare module "gi://AstalHyprland?version=0.1" {
  import GObject from "gi://GObject?version=2.0"

  export class Workspace extends GObject.Object {
    get id(): number
    get name(): string
  }

  export class Hyprland extends GObject.Object {
    static get_default(): Hyprland
    get focusedWorkspace(): Workspace | null
    get focused_workspace(): Workspace | null
  }

  const AstalHyprland: {
    Hyprland: typeof Hyprland
    Workspace: typeof Workspace
  }

  export default AstalHyprland
}

declare module "inline:*" {
  const content: string
  export default content
}

declare module "*.scss" {
  const content: string
  export default content
}

declare module "*.blp" {
  const content: string
  export default content
}

declare module "*.css" {
  const content: string
  export default content
}

declare module "unicode-emoji-json/data-by-emoji.json" {
  export interface UnicodeEmojiMetadata {
    name: string
    slug: string
    group: string
    emoji_version: string
    unicode_version: string
    skin_tone_support: boolean
    skin_tone_support_unicode_version?: string
  }

  const content: Record<string, UnicodeEmojiMetadata>
  export default content
}

declare module "emojilib/dist/emoji-en-US.json" {
  const content: Record<string, string[]>
  export default content
}

declare module "unicode-emoji-json/data-ordered-emoji.json" {
  const content: string[]
  export default content
}
