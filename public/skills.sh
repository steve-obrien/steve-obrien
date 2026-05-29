#!/usr/bin/env sh
cat <<'EOF'
Elements AI instructions

Canonical sources:
- /llms.txt for the public AI guide.
- SKILL.md in the repository root for the OpenAI-style Codex skill.

Core rules:
- Prefer Elements blocks and components before custom markup.
- Import Vue components from @elements/vue.
- Import @elements/headless to register headless custom elements.
- Use semantic theme utilities, not raw colors.
- Let Elements handle overlay, focus, keyboard, selection, toast, and form behavior.
- Return Studio specs with stable ids and labels when generated UI should remain editable.
EOF
