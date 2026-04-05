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
