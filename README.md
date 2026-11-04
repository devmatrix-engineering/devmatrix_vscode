<div align="center">

<img src="https://devmatrix.dev/logo-readme.png" alt="DevMatrix" width="320" />

# DevMatrix

**Define the system. DevMatrix compiles it.**

[Website](https://devmatrix.dev) ·
[How it works](https://devmatrix.dev/docs/pipeline) ·
[DMX reference](https://devmatrix.dev/docs/dmx-reference) ·
[Builds](https://devmatrix.dev/builds) ·
[Pricing](https://devmatrix.dev/pricing) ·
[Request beta access](https://devmatrix.dev/request-beta)

</div>

---

## What is DevMatrix

[DevMatrix](https://devmatrix.dev) is a compiler for complete systems. You
describe the system in DMX, its specification language, and DevMatrix
deterministically compiles it into production code, tests, migrations,
infrastructure and evidence. Same spec in, same artifacts out, every run.

- **Bring your own model for authoring.** Claude, Codex, Cursor or your own
  model helps you write the spec. Compilation itself calls no model.
- **Production output.** Services, database schema and migrations, access
  policies, contract and security tests, and the infrastructure to run them.
- **Evidence with every build.** A software bill of materials and a signed
  certificate that lets anyone replay the build and check the result.
- **You own the code.**

## What this extension does

This extension brings the DevMatrix Workshop into VS Code (and editors that
install from Open VSX): it understands DMX, validates it against your
DevMatrix account, and opens your platform specs and wikis as ordinary editor
documents.

You need a DevMatrix account and a Workshop API key to use the online
features. Editing `.dmx` files locally (highlighting, completion, snippets)
works without signing in.

## Install

- **VS Code**: search for **DevMatrix** in the Extensions view, or visit the
  [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Dev-Matrix.devmatrix-dmx).
- **Cursor, VSCodium, Windsurf and other Open VSX editors**: search for
  **DevMatrix** in the Extensions view, or visit
  [Open VSX](https://open-vsx.org/extension/Dev-Matrix/devmatrix-dmx).

## Features

### The DMX language
- Syntax highlighting for the whole language: blocks, data types,
  annotations, `$`-tokens, flow actions and triggers.
- Completion for blocks, annotations (`@…`), `$`-tokens, flow actions,
  trigger templates and HTTP methods, with snippets ready to fill in.
- Descriptions on hover for keywords and annotations.
- The **DevMatrix Dark** theme, auto-indent, bracket matching and comment
  toggling.

### Validation
- **On save or on demand**: the spec is checked against the DMX grammar.
- **As you type** (optional): the DevMatrix backend runs its semantic checks
  and the results appear in the Problems panel.

### Your Workshop in the editor
- Browse the platforms your key can reach in the DevMatrix view of the
  activity bar.
- Open `.dmx` specs as editor documents; saving stores a new version in
  DevMatrix. Compare a spec with its previous version and browse its history.
- Read platform wikis and upload new versions.
- Mark a spec compilable, open the DMX language reference, and open the
  Workshop in your browser.
- Optionally register the DevMatrix MCP server for Claude Code in the current
  workspace (**DevMatrix: Connect Claude Code (MCP)**). Claude Code signs you
  in to DevMatrix in your browser the first time it connects (OAuth); your
  Workshop key is not used for it.

## Getting started

1. Install the extension.
2. Open the **DevMatrix** view in the activity bar and select **Sign in**.
3. Paste your Workshop API key (`dm_live_…`). You can create one in the
   DevMatrix Workshop under **Settings → API Keys**, or with
   **DevMatrix: Manage Workshop Keys (web)**.
4. Your platforms appear in the view. Open a spec, edit it and save.

A Workshop key can read and author specs and wikis. It cannot start a
compilation.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `devmatrix.apiBaseUrl` | `https://devmatrix.dev` | DevMatrix backend the extension connects to. Only `https` is accepted. User settings only. |
| `devmatrix.deepValidate.enabled` | `true` | Validate the open spec as you type. |
| `devmatrix.deepValidate.debounceMs` | `800` | Pause, in milliseconds, before an as-you-type validation request. |
| `devmatrix.mcpUrl` | *(derived)* | MCP gateway used by **Connect Claude Code**. Empty means it is derived from `devmatrix.apiBaseUrl`. Only `https` is accepted. User settings only. |

In an untrusted workspace the extension runs in restricted mode: the backend
and MCP addresses can only come from your user settings.

## Requirements

- VS Code 1.90 or later, or a compatible editor.
- A DevMatrix account and a Workshop API key for the online features.

## Data and privacy

The extension sends data only to the DevMatrix backend set in
`devmatrix.apiBaseUrl` (by default `https://devmatrix.dev`), and only to
do what you ask:

| What is sent | When | Why |
| --- | --- | --- |
| Your Workshop API key, in the request header | Every request after you sign in | To authenticate you |
| The text of the spec you are editing | When you validate, save, or type with as-you-type validation on | To validate and store it |
| Wiki documents you upload | When you upload | To store them |
| Requests for your platforms, specs, versions and wikis | When you browse or open them | To show them |

- The key is stored by VS Code's SecretStorage (your operating system's
  keychain), separately for each backend address. It is never written to
  settings or files and never logged.
- **Connect Claude Code** writes a `.mcp.json` file to the workspace that
  names the DevMatrix MCP gateway (by default `https://mcp.devmatrix.dev/mcp`)
  and nothing else: no key and no credential. Claude Code connects to that
  gateway itself and signs you in with OAuth in your browser; the extension
  does not connect to it and does not share your Workshop key with it.
- The extension collects **no telemetry** and sends nothing to third parties.

Read the full [Privacy policy](https://devmatrix.dev/privacy).

## Support

- Questions and bug reports: [GitHub issues](https://github.com/devmatrix-engineering/devmatrix_vscode/issues).
- Security issues: see [SECURITY.md](https://github.com/devmatrix-engineering/devmatrix_vscode/blob/main/SECURITY.md).
- Product: [devmatrix.dev](https://devmatrix.dev).

## License

Proprietary. See the LICENSE file included with the extension. Third-party
components are listed with their licenses in ThirdPartyNotices.txt, also
included with the extension.

## Trademarks

Claude and Claude Code are trademarks of Anthropic, PBC. Visual Studio Code is
a trademark of Microsoft Corporation. Other product names mentioned here are
trademarks of their respective owners. They are named only to say what this
extension works with; DevMatrix is not affiliated with or endorsed by any of
them.

---

<div align="center">
<sub>© 2026 DevMatrix Inc. All rights reserved.</sub>
</div>
