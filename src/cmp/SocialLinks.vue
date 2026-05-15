<script setup>
const socialLinks = [
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/stevenaobrien/',
		icon: 'linkedin',
	},
	{
		label: 'GitHub',
		href: 'https://github.com/steve-obrien',
		icon: 'github',
	},
	{
		label: 'X',
		href: 'https://x.com/steveaob',
		icon: 'x',
	},
];
</script>

<template>
	<div class="flex items-center gap-3">
		<a
			v-for="link in socialLinks"
			:key="link.href"
			:href="link.href"
			target="_blank"
			rel="noreferrer"
			:aria-label="link.label"
			class="inline-flex rounded-full p-2 text-skin-secondary transition-colors hover:bg-skin-surface hover:text-skin-primary"
		>
			<svg
				v-if="link.icon === 'linkedin'"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
				/>
			</svg>
			<svg
				v-else-if="link.icon === 'github'"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.297C22 5.67 18.627.297 12 .297z"
				/>
			</svg>
			<svg
				v-else
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
				/>
			</svg>
		</a>
	</div>
</template>
