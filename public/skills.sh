#!/usr/bin/env sh
cat <<'EOF'
DOM Studio AI instructions

The Elements framework has moved out of this website.

Canonical sources:
- https://getdom.studio/llms.txt for the public AI guide.
- SKILL.md in the getdom.studio repository for Codex workflow notes.

Core rules:
- Prefer DOM Studio blocks and components before custom markup.
- Import Vue components from @getdom/studio/vue.
- Import @getdom/studio/headless to register headless custom elements.
- Import @getdom/studio/style.css when consuming the styled Vue layer.
- Use semantic theme utilities, not raw colors.
- Let DOM Studio handle overlay, focus, keyboard, selection, toast, and form behavior.
- Return Studio specs with stable ids and labels when generated UI should remain editable.
EOF
