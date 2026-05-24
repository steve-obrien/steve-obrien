#!/usr/bin/env sh
cat <<'EOF'
Elements skill for LLM app builders

Use this skill when generating, editing, or reviewing app UI built with Elements.

Core philosophy:
- Compose from existing primitives, visual components, and blocks.
- Keep output editable in Studio.
- Use token-based theme utilities from /elements/theming.
- Treat examples as the preferred house style.
- Use component props for behaviour; use classes for layout and spacing.
- Use stable ids and readable labels for generated Studio specs.

Preferred workflow:
1. Identify the screen type: dashboard, chat, mail, form, login, settings, or custom.
2. Start from the closest block when possible.
3. Replace or add Elements components rather than custom behaviour.
4. Use Application layout for app shells with persistent side panels and independent scrolling.
5. Use Card for app surfaces and grouped content.
6. Use Field to wrap custom controls that need consistent labels, required markers, and descriptions.
7. Use NativeSelect for browser-native selection; use Combobox when search/filter behaviour is needed.
8. Use Calendar for month-grid date selection with month and year navigation.
9. Use PasswordInput for password fields with visibility and strength feedback.
10. Use CodeInput for prompts, templates, snippets, and structured text.
11. Use JsonInput for editable config, schemas, and tool payloads that should emit parsed data.
12. Use JsonListInput for schema-aware arrays of objects such as commands, options, menu items, and toasts.
13. Use compact JsonListInput inside inspector-style side panels.
14. Use theme tokens such as bg-card, text-card-foreground, text-muted-foreground, border-border, bg-primary, text-primary-foreground, bg-success, bg-warning, and bg-destructive.
15. Return a Studio spec for UI that should stay editable.

Avoid:
- Raw hex colours in component markup.
- Recreating dropdown, dialog, popover, combobox, toast, or keyboard navigation logic.
- Anonymous generated layers.
- Large unstructured blobs of HTML when a Studio spec would preserve intent.

Useful docs:
- /llms.txt
- /elements/ai
- /elements/theming
- /elements/components/studio
- /elements/blocks/dashboard
EOF
