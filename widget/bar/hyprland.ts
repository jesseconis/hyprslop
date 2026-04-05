import GIRepository from "gi://GIRepository?version=3.0"
import type GIRepository from "gi://GIRepository?version=3.0"

type GIRepositoryStatic = {
  Repository: {
    dup_default(): {
      prepend_search_path(path: string): void
      prepend_library_path(path: string): void
    }
  }
}

export type HyprlandWorkspace = {
  id: number
  name: string
}

type HyprlandService = {
  dispatch(dispatcher: string, args: string): void
}

const repository = (GIRepository as unknown as GIRepositoryStatic).Repository.dup_default()
repository.prepend_search_path("/usr/local/lib/girepository-1.0")
repository.prepend_library_path("/usr/local/lib")

export const hyprland = await import("gi://AstalHyprland?version=0.1")
  .then(
    (module) =>
      (module as unknown as { default: { Hyprland: { get_default(): HyprlandService } } }).default
        .Hyprland.get_default(),
  )
  .catch((error) => {
    console.warn(
      `[hyprbar] failed to load AstalHyprland 0.1 :: ${error instanceof Error ? error.message : String(error)}`,
    )

    return null
  })

export function focusWorkspace(id: number) {
  hyprland?.dispatch("workspace", String(id))
}