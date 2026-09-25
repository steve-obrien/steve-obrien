# Project instructions

- Use tabs for indentation.
- Add good production standard doc block comments for all functions.

## Steve’s tone of voice

Read and follow [docs/tone-of-voice.md](docs/tone-of-voice.md) before drafting or editing website copy in Steve’s voice, including articles, project descriptions, daily work notes and weekly reviews. This is the canonical voice guide, based on the mantras. Preserve his personal wording and examples, and follow his latest explicit direction when it differs from the guide.

## Browser testing ownership and cleanup

- Use a dedicated, clearly named Codex testing tab/session for feature testing. Never navigate, reload, resize, or otherwise take over the user's existing working tabs unless explicitly asked.
- Prefer creating an agent-owned Chrome tab with a session name such as "🧪 Codex testing" through the browser tools. Reuse that tab within the task instead of opening repeated tabs or browser instances.
- Track the tabs, browser sessions, and processes created by the task. Close agent-owned test tabs and shut down any test browser instances and Playwright CLI daemons launched by the task when verification finishes, including on failure. Use finally blocks or shell traps for scripted browser lifecycle cleanup.
- Leave a testing tab open only when the user requests it or it is an intentional review handoff; identify it in the final response.
- Before terminating leftover browser processes, verify ownership from the process command, parent, and temporary automation profile. Never use blanket Chrome kill commands or terminate the user's normal Chrome profile or another active task's browser.
- Verify cleanup succeeded and report any test sessions that could not be closed.
