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

- **Bring your own model for authoring.** Claude, Codex or your own model
  helps you write the spec. Compilation itself calls no model.
- **Production output.** Services, database schema and migrations, access
  policies, contract and security tests, and the infrastructure to run them.
- **Evidence with every build.** A software bill of materials and a signed
  certificate that lets anyone replay the build and check the result.
- **You own the code.**

## What this extension does

This extension brings the DevMatrix Workshop into Visual Studio Code: it
understands DMX, validates it against your
DevMatrix account, and opens your platform specs and wikis as ordinary editor
documents.

You need a DevMatrix account to use the online
features. Editing `.dmx` files locally (highlighting, completion, snippets)
works without signing in.

## Install

Search for **DevMatrix** in the Extensions view of Visual Studio Code, or
visit the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Dev-Matrix.devmatrix-dmx).

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
- Browse the applications your account can reach in the DevMatrix view of the
  activity bar, A to Z, each with its status, its grade and whether it is
  self-attested and sealed, as DevMatrix shows them. Open an application's
  specs, wiki, latest build (wherever it was started), seal and details.
- Open `.dmx` specs as editor documents; saving stores a new version in
  DevMatrix. Compare a spec with its previous version and browse its history.
- Read platform wikis and upload new versions.
- Mark a spec compilable, open the DMX language reference, and open the
  Workshop in your browser.
- Compile a platform (**DevMatrix: Compile…**, or the ▶ button on a platform)
  and follow it: the status bar shows the build while it runs, the platform
  shows a **Builds** node with the builds started in this window, and when the
  build ends a notification opens its result on DevMatrix.
- Download the code of a build that ended (the download button on the build):
  the archive is checked against the size and checksum DevMatrix declares and
  unzipped into the extension's own storage folder, outside your workspace.
- Run a downloaded build's tests on this machine (the beaker button on the
  build): **this runs the downloaded build's code on your computer.** For each
  module DevMatrix offers, the extension runs the build's own test runner (a
  Python program that comes in the build, started with the first Python the
  build declares for your system that answers: `py -3`, `python` or `python3`
  on Windows, `python3` elsewhere, and on macOS also `python3` in
  `/opt/homebrew/bin` or `/usr/local/bin`), which
  starts the module's application with **Docker Compose**, runs its
  tests and stops it. It needs Docker Compose and Python (the version the
  build names, 3.11 or later) installed. A window lists what will run and
  asks you before anything starts; each module runs in a terminal you can
  see. Closing that terminal, or the window, stops it the way Ctrl+C does:
  the runner takes the application down before it ends, and the modules
  after it are not started. On Windows a run cannot be stopped from the
  editor; it goes on until it ends, and takes the application down itself.
- Upload a module's test results (the upload button on the module, under
  **Local run**): a window lists the files that would go to DevMatrix, with
  their sizes and SHA-256, the end of the live log, and DevMatrix's consent
  text word for word. Nothing is sent unless you click **Upload**. Only those
  files go up, exactly as they were when you agreed; a file changed since is
  not sent. The module then shows how DevMatrix judged the run.
- Seal an application (the lock button on a platform): a dialog asks first,
  and nothing is sent until you click **Seal**. A seal signs the latest build
  of each service, as DevMatrix shows them, and cannot be undone. When
  DevMatrix refuses, every reason it gives is shown, with each service it
  names. The platform shows its seal (class, grade, time and hash) when you
  expand it, including a seal taken on devmatrix.dev.
- Publish a build's attestation (the upload button on an ended build): a
  preview opens first and shows exactly what would be published, where, and
  whether it can be. To publish, press **Publish…** in the preview's title
  bar; a dialog asks first, and nothing is sent until you click **Publish**.
  DevMatrix then writes it to its public GitHub repository, where anyone can
  read it and it **cannot be withdrawn**. It needs **Publish** turned on for
  this editor in **Settings → VS Code** on devmatrix.dev (off until you turn
  it on), and an application that is sealed. A seal's record is published
  the same way, from the upload button on the platform's **Sealed** line.
- Optionally register the DevMatrix MCP server for Claude Code in the current
  workspace (**DevMatrix: Connect Claude Code (MCP)**). Claude Code signs you
  in to DevMatrix in your browser the first time it connects (OAuth). A
  dialog names the `.mcp.json` it writes, and nothing is written until you
  click **Write**.
- VS Code's own agent can use DevMatrix: the extension offers it the
  DevMatrix MCP server and four tools. One reads what this window holds (the
  open spec and its problems, your builds, test runs and seals); the other
  three open DevMatrix's own Run Tests, Seal and Publication dialogs for you.
  Running, sealing and publishing still need your yes in DevMatrix's dialog.

## Getting started

1. Install the extension.
2. Open the **DevMatrix** view in the activity bar and select **Sign in**.
3. Your browser opens DevMatrix. Sign in there and approve the editor; the
   browser hands the sign-in back to Visual Studio Code.
4. Your platforms appear in the view. Open a spec, edit it and save.

The editor's sign-in can read and author specs and wikis, and start a
compilation. Starting one asks you first, and it counts toward your plan.
Whether this editor may compile is your choice in **Settings → VS Code** on
DevMatrix; it is on until you turn it off. A sign-in made with an earlier
version of the extension cannot compile; sign in again to compile.

Downloading a build's code and running its tests need **Run builds on this
machine**, also in **Settings → VS Code**; it is off until you turn it on. A
sign-in made with an earlier version of the extension cannot download builds;
sign in again.

DevMatrix Keys are being retired. A key stored by an earlier version keeps
working until DevMatrix stops accepting keys; the extension asks you to sign
in with DevMatrix instead, and signing in replaces the key.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `devmatrix.apiBaseUrl` | `https://devmatrix.dev` | DevMatrix backend the extension connects to. Only `https` is accepted. User settings only. |
| `devmatrix.deepValidate.enabled` | `true` | Validate the open spec as you type. |
| `devmatrix.deepValidate.debounceMs` | `800` | Pause, in milliseconds, before an as-you-type validation request. |
| `devmatrix.mcpUrl` | *(derived)* | MCP gateway used by **Connect Claude Code**. Empty means it is derived from `devmatrix.apiBaseUrl`. Only `https` is accepted. User settings only. |

### Settings it changes

Two commands change an editor setting, and only when you run them:

- **DevMatrix: Apply DevMatrix Dark Theme** sets `workbench.colorTheme` to DevMatrix Dark.
- **DevMatrix: Match Workshop Colors (DMX)** adds the DMX color rules to
  `editor.tokenColorCustomizations`, keeping your other rules.

The extension changes no other setting outside `devmatrix.*`.

In an untrusted workspace the extension runs in restricted mode: the backend
and MCP addresses can only come from your user settings.

## Requirements

- Visual Studio Code 1.101 or later.
- A DevMatrix account for the online features.

## Data and privacy

The extension sends data only to the DevMatrix backend set in
`devmatrix.apiBaseUrl` (by default `https://devmatrix.dev`), and, when you
sign in, reads the public sign-in description of the DevMatrix MCP gateway
(`devmatrix.mcpUrl`, by default `https://mcp.devmatrix.dev/mcp`) without
sending it anything about you. It downloads a build's code only when you
ask, into its own storage folder outside your workspace.

It runs a program on your machine only when you ask it to run a downloaded
build's tests, and only after you confirm: the build's own test runner (a
Python program that comes in the build, started with the first Python the build declares for your
system that answers), which starts and stops the build's
application with Docker Compose. It runs it from a fresh copy of the archive
it checked at download, and refuses if that archive changed since. It checks
first that DevMatrix offers exactly that runner for each module, and runs it
as given, never through a shell. Before asking you, it runs
`docker compose version`, and `--version` on each Python the build declares for your system in
order (on Windows `py -3`, `python`, `python3`; elsewhere `python3`, and on macOS also in
`/opt/homebrew/bin` and `/usr/local/bin`), to check they are installed. On macOS it never runs
`/usr/bin/python3` unless `xcode-select -p` answers, since without the Command Line Tools that
file only opens an installer; it then asks you to install Python 3 or the Command Line Tools. The runner is given only these environment variables of your
editor, when they are set: `PATH`, `HOME`, `TMPDIR`, `XDG_RUNTIME_DIR`,
`DOCKER_HOST`, `DOCKER_CONFIG`, `DOCKER_CONTEXT`, `DOCKER_CERT_PATH`,
`DOCKER_TLS_VERIFY`, `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` (and their
lowercase proxy forms), and on Windows also `SYSTEMROOT`, `USERPROFILE`,
`APPDATA`, `LOCALAPPDATA`, `TEMP`, `TMP` and `PATHEXT`. Nothing else your
editor holds, such as your DevMatrix sign-in, reaches it.

To sign in, it opens DevMatrix in your browser and, for that sign-in only,
listens on your own computer (`127.0.0.1`, a free port) for the browser to
hand the sign-in back; it stops listening as soon as it arrives, or after
five minutes.

The DevMatrix MCP server it offers VS Code's agent holds the gateway address
only. That traffic goes from VS Code to the gateway under VS Code's own
sign-in, which it asks you for; this extension's sign-in is never shared. The
four DevMatrix tools read this window, except that asking for the Seal dialog
lists your platforms to find the one named; they send nothing else.

### When data is sent

When you act: signing in, browsing or opening your platforms, specs and
wikis, validating, saving, uploading, starting a compilation, downloading a build's code, asking which modules of a build can run on this machine, uploading a module's test results, and, if you leave it on, validating as
you type (`devmatrix.deepValidate.enabled`).

And automatically in the background, while you are signed in, to show changes
made elsewhere (in the Workshop, or by an assistant connected to DevMatrix):

- every 18 seconds while the DevMatrix view is open, and each time the
  Visual Studio Code window regains focus, it asks for your platforms and for
  the current version of the DevMatrix specs you have open; switching to a
  spec opened from DevMatrix asks for that spec;
- it keeps a live connection to DevMatrix that receives status changes of
  your specs, and reopens it every 5 seconds if it drops;
- while a compilation you started in this window runs, it asks for that
  compilation every 10 seconds, and each time for the phase it is in, until
  the compilation ends, unless the compilation's live subscription has been
  acknowledged. Live progress triggers the same authoritative HTTP reads,
  coalesced over 300 milliseconds. It reconciles the compilation every 30 seconds
  even with a live subscription, so a lost final event does not leave it pending;
- after 5 seconds without a usable compilation socket, it resumes those
  10-second reads with an immediate read. Each reconnection rereads your current
  OAuth token. Signing out or changing the backend closes the old followers;
- while a local app runs, it checks a running app and its documentation every 2 seconds,
  on that app's declared loopback port and routes, to decide whether to offer Swagger.

Nothing is sent before you sign in. Editing `.dmx` files locally sends
nothing.

### What is sent

| What is sent | When | Why |
| --- | --- | --- |
| Your sign-in token, in the request header | Every request after you sign in, and to renew the sign-in | To authenticate you |
| Your current OAuth access token, in the socket handshake auth payload, and the served compiler run id | When following a compilation and on each reconnect | To receive only the live events that this connection may read; no token is put in the URL |
| The extension's version, your editor's name and version, your operating system (for example `win32`) and, in a remote window, the kind of remote (for example `wsl`) | Once, when you sign in | To name this editor and machine in **Settings → VS Code** on DevMatrix, so you can tell your signed-in editors apart and sign one out |
| The text of the spec you are editing | When you validate, save, or type with as-you-type validation on | To validate and store it |
| The id of a spec opened from DevMatrix | When you validate it | To validate it together with its platform |
| The id of the platform you compile, and a random identifier of that start | When you start a compilation | To start it once, even if the request has to be sent again |
| Requests for the state of a compilation you started | On live progress, every 30 seconds while subscribed, or every 10 seconds during polling, as described above | To show its progress and its authoritative result |
| Requests for the phase of a compilation you started | With each request for its state while it runs, as described above | To show the phase it is in |
| The id of a build whose code you download, then a request to the one-use link DevMatrix answers | When you download a build's code | To receive that build's code archive, once |
| The id of a build whose tests you run | When you run a build's tests | To learn which of its modules may run on this machine, and the runner each one uses. Nothing about the run is sent |
| The raw output of one module's run (up to four files: the list of collected tests, the live log, the run's record and the test report), their SHA-256 and sizes, and your yes to DevMatrix's consent text | When you click **Upload** on a module's results | So DevMatrix can judge the run and grade the build |
| Requests for an uploaded run | Every 10 seconds after you upload it, while DevMatrix judges it and grades its build | To show how it was judged |
| The id of the platform you seal | When you click **Seal** in the seal dialog, never before | To seal the latest build of each of its services (a seal cannot be undone) |
| Requests for a platform's seal | When you expand the platform in the DevMatrix view | To show its seal, including one taken on devmatrix.dev |
| The id of a build whose publication you preview | When you click the publish button on an ended build | To show what publishing its attestation would write, and where |
| That build's id and the digest of the preview you saw | When you click **Publish** in the publish dialog, never before | So DevMatrix publishes exactly that preview to its public GitHub repository, where it is public and cannot be withdrawn |
| The id of the platform and of the seal whose record you preview | When you click the publish button on a platform's **Sealed** line | To show what publishing that seal's record would write, and where |
| Those ids and the digest of the preview you saw | When you click **Publish** in the publish dialog, never before | So DevMatrix publishes exactly that seal record to its public GitHub repository, where it is public and cannot be withdrawn |
| Wiki documents you upload | When you upload | To store them |
| Requests for your platforms, specs, versions and wikis | When you browse or open them, and in the background as described above | To show them and their changes |
| A short-lived token for the live connection | When the connection opens | To receive status changes of your specs |

The extension collects **no telemetry**: no usage analytics, no crash
reports, and no system information beyond the editor and operating system
names it sends once when you sign in, listed above.

### How it is used, kept and shared

DevMatrix uses this data only to validate and store your specs and wikis,
to compile the platforms you ask it to compile, and to show them back to you, and the editor and operating system names
only to list your signed-in editors to you. Those names are kept with the
record of that sign-in in your DevMatrix account. Specs and wikis are kept
as versions in your DevMatrix account for as long as the account keeps
them. Retention periods and deletion are set out in the [Privacy policy](https://devmatrix.dev/privacy).
The extension sends nothing to third parties. Who DevMatrix shares data
with, if anyone, is set out in the Privacy policy.

When you publish a build's attestation or a seal's record, DevMatrix (not the extension) writes
the preview you confirmed to its public repository on GitHub
(github.com/<the repository the preview names>). That document is public:
anyone can read it, and it cannot be withdrawn. An attestation holds the
build's digests, counts, module identifiers and statuses; a seal record holds
the seal's digests, versions, statuses, grades and counts, with no application
or service name. Each is exactly as the preview shows it.

A build's code you download is written to the extension's storage folder on
your machine (VS Code's global storage for this extension), never to your
workspace, and stays there until you delete it. The checked archive is kept
beside it, and each run of the tests unzips it into a new folder there, where
the runner also writes its output. Nothing of it is uploaded unless you click
**Upload** on a module's results. The one-use upload credential is held in
memory only, sent only with those files, and never logged or stored.
The one-use download link is never logged or stored.

On your machine, the sign-in is stored by VS Code's SecretStorage (your
operating system's keychain), separately for each backend address. It is
never written to settings or files and never logged. Signing out ends the
sign-in at DevMatrix and deletes it from the keychain.

**Connect Claude Code** writes a `.mcp.json` file to the workspace that
names the DevMatrix MCP gateway (by default `https://mcp.devmatrix.dev/mcp`)
and nothing else: no key and no credential. Claude Code connects to that
gateway itself and signs you in with OAuth in your browser; the extension
does not connect to it and does not share its own sign-in with it.

### Where it is sent

To the DevMatrix servers at `devmatrix.dev`, which run in the European
Union (Finland). Some processing also takes place in the United States, so
data may be transferred there; which data, by whom, and under what
safeguards is set out in the [Privacy policy](https://devmatrix.dev/privacy).

### Whether personal data is anonymized

No. The spec text and wikis are your content and are stored as you wrote
them, linked to your account, so you can open them again. Your sign-in
token identifies your account on every request.

### Who receives it

DevMatrix, the publisher of this extension, and no one else. Read the full
[Privacy policy](https://devmatrix.dev/privacy).

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
