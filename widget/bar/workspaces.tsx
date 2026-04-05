import { For, createBinding, createComputed } from "gnim"
import { focusWorkspace, hyprland, HyprlandWorkspace } from "./hyprland"

export default function WorkspaceStrip() {
  const workspaces = hyprland
    ? createComputed(() => {
        const items = [...((createBinding(hyprland as any, "workspaces")() as HyprlandWorkspace[] | null) ?? [])]

        return items
          .filter((workspace) => workspace.id > 0)
          .sort((left, right) => left.id - right.id)
      })
    : createComputed<HyprlandWorkspace[]>(() => [])

  const focusedWorkspaceId = hyprland
    ? createComputed(() => createBinding(hyprland as any, "focusedWorkspace", "id")() ?? -1)
    : createComputed(() => -1)

  return (
    <box class="workspace-strip">
      <For each={workspaces}>
        {(workspace) => (
          <button
            class={createComputed(() => {
              const active = focusedWorkspaceId() === workspace.id
              return active ? "workspace-pill workspace-pill-active" : "workspace-pill"
            })}
            tooltipText={workspace.name}
            onClicked={() => focusWorkspace(workspace.id)}
          >
            <label label={`${workspace.id}`} />
          </button>
        )}
      </For>
    </box>
  )
}