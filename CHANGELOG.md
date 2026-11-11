# Changelog

## 0.8.5

- The key you sign in with is now called the DevMatrix Key, in the commands, prompts, messages
  and settings. It is the same key and works the same way: a key stored by an earlier version is
  still used, and nothing has to be signed in again.
- DMX highlighting and completion recognise alert receivers in the observability block, with
  the alert severities each one receives.
- Version 0.8.4 carried only one of these two changes on each store: the alert receivers on the
  Visual Studio Marketplace, the DevMatrix Key on Open VSX. 0.8.5 carries both on both.

## 0.8.3

- The Marketplace listing is named "DevMatrix DMX", because the name "DevMatrix" is already taken
  there. Versions 0.8.1 and 0.8.2 were not published on the Marketplace. The extension id stays
  `Dev-Matrix.devmatrix-dmx`.

## 0.8.2

- The extension id is now `Dev-Matrix.devmatrix-dmx`, because the name `devmatrix` is already
  taken on the Visual Studio Marketplace. The display name is still DevMatrix. Version 0.8.1 was
  not published there, so there is nothing to migrate: install `Dev-Matrix.devmatrix-dmx`.

## 0.8.1

- The Marketplace publisher is `Dev-Matrix`, so the extension id is `Dev-Matrix.devmatrix`; the
  Open VSX namespace is the same. The manifest names DevMatrix Inc. as author.
- The extension no longer lists activation events VS Code derives on its own from the
  language and views it contributes. It still starts when you open a `.dmx` file or the
  DevMatrix view, and when a `devmatrix:` spec is opened.

## 0.8.0

### Connecting to DevMatrix

- Your Workshop key is sent only over `https://`, the local stack included, and only to
  the destination it was checked against: each destination keeps its own key. The key is
  never written into your project or copied to the clipboard.
- **Connect Claude Code** registers the DevMatrix MCP server with browser sign-in. The
  `.mcp.json` it writes holds the server address and nothing else: no key. An existing
  `.mcp.json` that cannot be read is left untouched instead of being replaced.
- The **Select MCP Destination** command is removed. Choose where the extension connects
  with **Set Backend URL**, then run **Connect Claude Code**: it registers that backend's
  MCP server, and Claude Code signs you in through your browser. A
  `~/.config/devmatrix/destination` file left by an earlier version is not deleted;
  nothing reads it any more, so you can remove it.
- **Set Backend URL** lists Production first. Production stays the default; Dev and the
  local stack are used only when you choose them.
- The extension now tells you, once per value, when `devmatrix.apiBaseUrl` or
  `devmatrix.mcpUrl` holds a value it cannot use (for example an old `http://` address),
  with buttons to reset that setting or open Settings. Nothing is changed unless you choose
  to.
- It also tells you when an earlier setup left a DevMatrix MCP entry that sends a key:
  in this workspace's `.mcp.json` it offers to replace the entry, and for entries in Claude
  Code's own configuration it gives you the exact commands to remove them. That file is
  never edited by the extension.

### Working with specs

- Deep validation of a `.dmx` file on disk checks it as the spec type its top-level
  block declares (platform, service, or standalone when it has neither). A file with
  both roots, or with no top-level block, is not sent, and the Problems panel says why.
- A monolith is shown and validated as one unit: its platform spec.
- **Validate All** lists every platform and spec it could not validate, and why.
- Each spec shows which pack compiles it, as the Workshop does.
- Deep validation reports in English, names the checks that did not run, says so when a
  spec is above the size the backend accepts, and keeps your markers when it could not
  validate.

### Editor

- Highlighting, completion and hover follow the current DMX language, including the new
  entity and field annotations and the `$query` helpers.
- Panels follow your color theme: light, dark and high contrast.
- The Command Palette shows a DevMatrix command only where it can act.

## 0.7.1

- Completion and hover descriptions for sequence settings updated to match current DMX.

## 0.7.0

- Completion now offers the allowed values for more settings, depending on where the
  cursor is (for example inside a block that only accepts a fixed set of values).

## 0.6.0

- Highlighting, completion and hover now cover the full current DMX language and stay in
  step with it.

## 0.5.0

- Highlighting and completion for `precondition` blocks, the `observability` block and
  new `security` keys.

## 0.4.0

- Spec status updates arrive live when a spec changes elsewhere, without waiting for the
  next refresh.

## 0.3.3

- A status change made elsewhere now replaces a stale local badge on the next refresh.
  Specs with unsaved edits keep their "needs revalidation" badge.

## 0.3.2

- Compilable specs show their own green `▶` badge.

## 0.3.1

- Valid specs show a green badge; editing a validated spec switches it to "needs
  revalidation" right away.

## 0.3.0

- New commands: **DMX Language Reference** and **DMX Grammar (live)**.

## 0.2.10

- Uploading several wiki documents at once works reliably.
- **Diff with Previous Version** button on each spec and in the editor toolbar.

## 0.2.9

- Fixed spec names showing `.dmx` twice.

## 0.2.8

- **Delete Wiki Doc** action.
- Fixed multi-file wiki upload.

## 0.2.7

- **Spec Version History**: browse versions, diff any of them against the current spec,
  or open one read-only.

## 0.2.6

- **Get Started** walkthrough.
- **Manage Workshop Keys** opens key management in the web Workshop.

## 0.2.5

- Platforms are labelled by their application name.
- **Change Workshop Key**, **Sign Out & Reset**, connection status in the status bar,
  **Apply DevMatrix Dark Theme** and **Open Workshop in Browser**.
- **Upload Wiki** button in the view toolbar.

## 0.2.4

- Fixed the logo on the extension page.

## 0.2.3

- Branded extension page and sign-in view.

## 0.2.2

- **Connect Claude Code (MCP)** works without an open folder: copy the command or pick a
  folder.

## 0.2.1

- Status badges on specs, **Validate All Specs** and **Make Compilable**.
- Open editors reload when a spec changes on the server.

## 0.2.0

- **Connect Claude Code (MCP)**, **Set Backend URL**, hover documentation, **Match
  Workshop Colors**.
- Per-spec **Validate** with a list of issues by line.
- Open specs reload when they change on the server; unsaved edits are never overwritten.
- Status badges, dashboard status pills, branded sign-in view and dashboard.

## 0.1.0

- DMX language support: highlighting, **DevMatrix Dark** theme, brackets, indentation and
  comments.
- Completion and snippets.
- Sign in with a Workshop API key, stored in VS Code SecretStorage.
- Platforms view with specs and wikis; edit specs and save them to the server.
- Validation results in the Problems panel.
