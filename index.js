import { defineTool } from '@deepseek-ai/dsh-tools'
import {
  captureWindow,
  clickWindow,
  listWindows,
  openApp,
  pressKey,
  scrollWindow,
  typeText,
} from './src/backend.js'

export const name = 'windows-desktop'
export const inject = ['tools']

const output = {
  schema: { type: 'string' },
  render: (_args, value) => [{ type: 'text', text: value }],
}

function register(ctx, definition) {
  ctx.tools.register(defineTool({ ...definition, output }))
}

export function apply(ctx) {
  register(ctx, {
    name: 'desktop_open_app',
    description: 'Launch an existing Windows .exe by absolute path. Then inspect desktop_list_windows before selecting a window. Never pass commands or scripts as a path.',
    parameters: {
      path: { type: 'string', required: true, description: 'Absolute path to an existing .exe file' },
    },
    async execute(args, exec) {
      return JSON.stringify(await openApp(args.path, exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_list_windows',
    description: 'List visible desktop windows with IDs, process IDs, titles, executable paths, and bounds. Identify exactly one target before acting.',
    parameters: {},
    async execute(_args, exec) {
      return JSON.stringify(await listWindows(exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_capture_window',
    description: 'Activate and capture one selected window. Call read_image on the returned PNG path to inspect it before coordinate input. A model route without image input cannot inspect screenshots.',
    parameters: {
      windowId: { type: 'number', required: true, description: 'Window ID from desktop_list_windows' },
      processId: { type: 'number', required: true, description: 'Process ID from the same window row' },
      outputPath: { type: 'string', description: 'Optional absolute PNG output path accessible to read_image' },
    },
    async execute(args, exec) {
      return JSON.stringify(await captureWindow(args, exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_click',
    description: 'Click window-relative coordinates from a recent desktop_capture_window image. Re-capture after any layout or focus change.',
    parameters: {
      windowId: { type: 'number', required: true },
      processId: { type: 'number', required: true },
      x: { type: 'number', required: true, description: 'X coordinate relative to the captured window' },
      y: { type: 'number', required: true, description: 'Y coordinate relative to the captured window' },
    },
    async execute(args, exec) {
      return JSON.stringify(await clickWindow(args, exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_type_text',
    description: 'Type literal Unicode text into the focused control of the selected window. Verify focus in a fresh screenshot first; this does not send Enter.',
    parameters: {
      windowId: { type: 'number', required: true },
      processId: { type: 'number', required: true },
      text: { type: 'string', required: true, description: 'Literal text to type' },
    },
    async execute(args, exec) {
      return JSON.stringify(await typeText(args, exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_press_key',
    description: 'Press a key or chord in the selected window, for example Enter, Escape, Ctrl+S, or Shift+Tab. Windows-key chords are unavailable.',
    parameters: {
      windowId: { type: 'number', required: true },
      processId: { type: 'number', required: true },
      key: { type: 'string', required: true, description: 'Supported key or chord' },
    },
    async execute(args, exec) {
      return JSON.stringify(await pressKey(args, exec.signal))
    },
  })

  register(ctx, {
    name: 'desktop_scroll',
    description: 'Scroll from window-relative coordinates. Positive delta scrolls up; negative delta scrolls down. Re-capture afterward.',
    parameters: {
      windowId: { type: 'number', required: true },
      processId: { type: 'number', required: true },
      x: { type: 'number', required: true },
      y: { type: 'number', required: true },
      delta: { type: 'number', required: true, description: 'Mouse wheel delta, usually 120 or -120' },
    },
    async execute(args, exec) {
      return JSON.stringify(await scrollWindow(args, exec.signal))
    },
  })
}
