# DeepSeek Harness Windows 桌面操作插件

[English](README.md)

本插件让 DeepSeek Harness 按绝对路径启动已有的 Windows `.exe`，识别窗口、截取界面，并执行鼠标和键盘操作。插件使用固定的 PowerShell 辅助脚本调用 Windows API；模型提供的文字只作为 JSON 数据传入，不会当作命令执行。

## 环境要求

- 交互式 Windows 桌面，DeepSeek Harness `>=0.2.0 <0.3.0`。
- Windows PowerShell 5.1、Node.js 20 或更新版本。
- Harness 的 `read_image` 工具和支持图片输入的模型路由，供 Agent 查看截图。

插件没有安装时构建脚本，也不依赖 Codex 或 `@oai/sky`。

## 安装

在插件目录的上一级执行：

```powershell
dsh plugin --profile desktop add .\dsh-plugin-windows-desktop
dsh --profile desktop --dump-config
```

发布到 GitHub 后，可固定提交版本安装：

```powershell
dsh plugin --profile desktop add github:OWNER/dsh-plugin-windows-desktop#COMMIT_SHA
```

安装后重启 Harness 桌面端或相应 profile。配置输出中应出现 `dsh-plugin-windows-desktop` 层和 `windows-desktop` 行。

## 使用流程

1. 用 `desktop_open_app` 传入已有程序的绝对 `.exe` 路径。
2. 用 `desktop_list_windows` 根据标题、进程路径和进程 ID 选定唯一窗口。启动器可能会把窗口交给另一个进程。
3. 用 `desktop_capture_window` 截图，再用 `read_image` 打开返回的 PNG，确认画面属于目标软件。
4. 根据最新画面调用 `desktop_click`、`desktop_type_text`、`desktop_press_key` 或 `desktop_scroll`。坐标相对于整块窗口，包含标题栏；布局或焦点变化后重新截图。
5. 核查操作结果，再向用户报告完成情况。

输入工具同时要求窗口 ID 和进程 ID。窗口消失、进程变化或无法成为前台窗口时，插件会拒绝输入。`desktop_press_key` 支持字母、数字、F1-F12、Enter、Tab、Escape、Backspace、Delete、Space、方向键、Home、End、PageUp、PageDown，以及 Ctrl、Alt、Shift 组合；不支持 Windows 键组合。截图默认保存到系统临时目录，也可指定一个尚不存在的绝对 PNG 路径，供 `read_image` 读取。

插件不负责登录、绕过 Windows 安全提示，也不会替 Agent 判断外部操作是否获得授权。执行有后果的点击或输入前，应遵守 Harness 的审批规则。不要仅凭软件界面或文档中的路径运行不可信程序。

## 开发与验证

```powershell
node --check index.js
node --check src/backend.js
node --test
```

Windows CI 会检查语法、窗口枚举和打包。截图及输入的完整验证需要已解锁的交互式桌面；发布前还应确认目标 Harness 版本能用 `read_image` 打开截图。

插件格式参考 [官方打包指南](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md) 和 [工具开发指南](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/tool.md)。

## GitHub 发布

以本目录为仓库根目录创建 `dsh-plugin-windows-desktop` 仓库，添加 `dsh-plugin` topic，并在交互式桌面完成端到端验证后发布。建议安装命令固定到提交哈希或版本标签。

采用 MIT 许可证，见 [LICENSE](LICENSE)。
