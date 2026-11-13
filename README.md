# Windows Desktop Control for DeepSeek Harness

[中文说明](README.zh.md)

A Windows-only DeepSeek Harness bundle that lets the agent launch an existing `.exe` by path, identify its window, capture its visible UI, and perform mouse and keyboard actions. It uses a fixed PowerShell helper with Windows APIs. Model-provided text is passed as JSON data, never evaluated as a command.

## Requirements

- DeepSeek Harness `>=0.2.0 <0.3.0` on an interactive Windows desktop.
- Windows PowerShell 5.1 and Node.js 20 or newer.
- The Harness `read_image` tool and an image-capable model route to inspect screenshots.

This package has no install-time build script or third-party runtime dependencies. It is not a Codex plugin and does not depend on `@oai/sky`.

## Install

From a local checkout:

```powershell
dsh plugin --profile desktop add .\dsh-plugin-windows-desktop
dsh --profile desktop --dump-config
```

After publishing this repository to GitHub, users can install a pinned revision:

```powershell
dsh plugin --profile desktop add github:OWNER/dsh-plugin-windows-desktop#COMMIT_SHA
```

Restart the Harness desktop app or profile after installation. The config dump should include a `dsh-plugin-windows-desktop` layer and a `windows-desktop` row. The host profile must already provide the standard `tools` service.

## Agent workflow

1. Call `desktop_open_app` with an absolute path to an existing local `.exe`.
2. Call `desktop_list_windows` and select one window from its title, executable path, and process ID. A launcher can hand off to another process.
3. Call `desktop_capture_window`, then `read_image` on its returned PNG path. Check that the image matches the intended app.
4. Use `desktop_click`, `desktop_type_text`, `desktop_press_key`, or `desktop_scroll`. Coordinates are relative to the captured window, including its title bar. Capture again after focus or layout changes.
5. Verify the resulting UI state before reporting completion.

All input calls require both `windowId` and `processId`; the helper refuses input when the window is gone, its process changed, or it cannot be brought to the foreground. `desktop_press_key` accepts letters, digits, F1-F12, Enter, Tab, Escape, Backspace, Delete, Space, arrows, Home, End, PageUp, and PageDown, with optional Ctrl, Alt, and Shift modifiers. Windows-key shortcuts are unavailable. Screenshot output defaults to a unique PNG under the system temporary directory; `outputPath` can select another new absolute PNG path accessible to `read_image`.

The tools do not manage authentication, bypass Windows security prompts, or make decisions about whether an external action is authorized. Apply the host's approval policy before using input tools for consequential actions. Do not run untrusted executables solely because a path appears in an app or document.

## Development

```powershell
node --check index.js
node --check src/backend.js
node --test
```

The native enumeration test runs on Windows. A full screenshot and input smoke test needs an unlocked interactive desktop; headless CI cannot supply a target foreground window. The workflow also checks the package with `npm pack --dry-run` on Windows.

Plugin format follows the [DeepSeek Harness bundle guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md) and [tool authoring guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/tool.md).

## Publishing

Create a GitHub repository named `dsh-plugin-windows-desktop`, push this directory as its root, and add the `dsh-plugin` topic. Pin a commit in installation instructions until a release tag is available. Before announcing support, run the interactive smoke test in the target Harness desktop version and confirm that `read_image` can open a captured PNG.

MIT licensed; see [LICENSE](LICENSE).
