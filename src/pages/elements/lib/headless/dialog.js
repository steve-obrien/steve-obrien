import { ElementBase, defineElement, isBrowser } from './base.js';

// <element-dialog id="my-dialog">
//   <!-- trigger slot optional — omit when opening via commandfor or .open() -->
//   <h2>Title</h2>
//   <p>Body content.</p>
//   <button data-close>Close</button>
// </element-dialog>
//
// <button command="open" commandfor="my-dialog">Open</button>
//
// const dlg = document.getElementById('my-dialog');
// dlg.open(); dlg.close(); dlg.toggle();

let TEMPLATE = null;
function getTemplate() {
	if (TEMPLATE || !isBrowser) return TEMPLATE;
	TEMPLATE = document.createElement('template');
	TEMPLATE.innerHTML = `
<style>
	:host { display: contents; }
	dialog {
		border: 0;
		padding: 0;
		margin: auto;
		background: transparent;
		color: inherit;
		max-width: 100vw;
		max-height: 100vh;
		/* UA default is overflow:auto, which clips box-shadow on slotted content */
		overflow: visible;
		opacity: 0;
		transition:
			opacity 140ms ease,
			overlay 140ms ease allow-discrete,
			display 140ms ease allow-discrete;
	}
	dialog[open] { opacity: 1; }
	@starting-style {
		dialog[open] { opacity: 0; }
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		opacity: 0;
		transition:
			opacity 140ms ease,
			overlay 140ms ease allow-discrete,
			display 140ms ease allow-discrete;
	}
	dialog[open]::backdrop { opacity: 1; }
	@starting-style {
		dialog[open]::backdrop { opacity: 0; }
	}
</style>
<slot name="trigger"></slot>
<dialog part="dialog"><slot></slot></dialog>
`;
	return TEMPLATE;
}

const OPEN_COMMANDS = new Set(['open', 'show-modal']);

export class ElementDialog extends ElementBase {
	static get observedAttributes() { return ['open']; }

	static __doc = {
		name: 'element-dialog',
		description: 'Self-contained wrapper around the native HTML <dialog>. Top-layer rendering, nested stacking, ::backdrop and Esc-to-close are all native. Trigger slot is optional — open via commandfor, the open attribute, or .open() / .close() / .toggle().',
		slots: [
			{ name: 'trigger', description: 'Optional. Element that opens the dialog when clicked. Omit when using commandfor or programmatic control.' },
			{ name: '(default)', description: 'Dialog body. Anything that is not the trigger goes here.' },
		],
		attributes: [
			{ name: 'id', type: 'string', description: 'Host id — used by commandfor on external buttons (e.g. commandfor="my-dialog").' },
			{ name: 'open', type: 'boolean', description: 'Reflects open state. Setting it shows the dialog (showModal), removing it closes it.' },
			{ name: 'static', type: 'boolean', description: 'Modal cannot be dismissed by backdrop click or Esc — only data-close, .close(), or removing open.' },
		],
		events: [
			{ name: 'el:open', description: 'Fired when the dialog opens.' },
			{ name: 'el:close', description: 'Fired when the dialog closes (Esc, .close(), backdrop, or data-close).' },
		],
		keyboard: [
			{ keys: 'Esc', action: 'Closes the topmost open dialog unless `static` is set.' },
			{ keys: 'Tab / Shift+Tab', action: 'Focus stays within the dialog while open (native top-layer).' },
			{ keys: 'Click backdrop', action: 'Dismisses the dialog (disable with `static`).' },
		],
		example: `<element-dialog id="confirm-dialog">
  <h2>Delete project?</h2>
  <p>This cannot be undone.</p>
  <button data-close>Cancel</button>
</element-dialog>

<button type="button" command="open" commandfor="confirm-dialog">Delete</button>

<script type="module">
  import '@elements/headless/dialog.js';
  const dlg = document.getElementById('confirm-dialog');
  dlg.addEventListener('el:close', () => console.log('closed'));
<\/script>`,
	};

	constructor() {
		super();
		if (!isBrowser) return;
		if (!this.shadowRoot) {
			const shadow = this.attachShadow({ mode: 'open' });
			shadow.appendChild(getTemplate().content.cloneNode(true));
		}
		this._dialog = this.shadowRoot.querySelector('dialog');
		this._syncing = false;
	}

	connectedCallback() {
		this._trigger = this.querySelector('[slot="trigger"]');
		if (this._trigger) {
			this._trigger.setAttribute('aria-haspopup', 'dialog');
			this._trigger.setAttribute('aria-expanded', String(this.isOpen));
			this.on(this._trigger, 'click', () => this._setOpen(true));
		}

		this.addEventListener('command', (e) => {
			if (e.target !== this) return;
			if (OPEN_COMMANDS.has(e.command)) this._setOpen(true);
			else if (e.command === 'close') this._setOpen(false);
		});

		this._wireCommandForButtons();

		this.on(this, 'click', (ev) => {
			const closer = ev.target.closest?.('[data-close]');
			if (closer && this.contains(closer)) this._setOpen(false);
		});

		this.on(this._dialog, 'click', (e) => {
			if (this.hasAttribute('static')) return;
			if (e.target === this._dialog) this._setOpen(false);
		});

		this.on(this._dialog, 'cancel', (e) => {
			if (this.hasAttribute('static')) e.preventDefault();
		});
		this.on(this._dialog, 'keydown', (e) => {
			if (this.hasAttribute('static') && e.key === 'Escape') e.preventDefault();
		});

		this.on(this._dialog, 'close', () => this._onNativeClose());

		if (this.boolAttr('open')) this._setOpen(true);
	}

	/** Fallback when Invoker Commands are unavailable — wire [commandfor] buttons by id. */
	_wireCommandForButtons() {
		const id = this.id;
		if (!id) return;
		for (const btn of document.querySelectorAll(`[commandfor="${id}"]`)) {
			this.on(btn, 'click', () => {
				const cmd = btn.getAttribute('command');
				if (OPEN_COMMANDS.has(cmd)) this._setOpen(true);
				else if (cmd === 'close') this._setOpen(false);
			});
		}
	}

	_onNativeClose() {
		if (!this.hasAttribute('open')) return;
		this._syncAttr(false);
		this._trigger?.setAttribute('aria-expanded', 'false');
		this.emit('el:close');
	}

	_syncAttr(open) {
		if (this._syncing) return;
		this._syncing = true;
		try {
			if (open) this.setAttribute('open', '');
			else this.removeAttribute('open');
		} finally {
			this._syncing = false;
		}
	}

	_setOpen(next) {
		if (!this._dialog || this._syncing) return;
		const isOpen = this._dialog.open;
		if (next === isOpen) {
			if (this.hasAttribute('open') !== next) this._syncAttr(next);
			return;
		}
		if (next) {
			this._dialog.showModal();
			this._syncAttr(true);
			this._trigger?.setAttribute('aria-expanded', 'true');
			this.emit('el:open');
		} else {
			this._dialog.close();
		}
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (!this.isConnected || !this._dialog || name !== 'open' || this._syncing) return;
		this._setOpen(newValue !== null);
	}

	/** Whether the modal is open (reads the internal &lt;dialog&gt;). */
	get isOpen() { return !!this._dialog?.open; }
	set isOpen(v) { this._setOpen(!!v); }

	open() { this._setOpen(true); }
	close() { this._setOpen(false); }
	toggle() { this._setOpen(!this.isOpen); }

	// Aliases
	show() { this.open(); }
	hide() { this.close(); }
}

defineElement('element-dialog', ElementDialog);
