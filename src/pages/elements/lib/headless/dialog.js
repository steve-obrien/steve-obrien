import { ElementBase, defineElement, isBrowser } from './base.js';

// <element-dialog>
//   <button slot="trigger">Open</button>
//   <h2>Title</h2>
//   <p>Body content.</p>
//   <button data-close>Close</button>
// </element-dialog>
//
// A self-contained wrapper around the native <dialog> element. The native
// dialog (with its top-layer rendering, scroll lock and ::backdrop) lives in
// the shadow root — authors never need to write a <dialog> tag themselves.
//
// - `slot="trigger"` is projected outside the dialog and stays visible.
// - Anything else (the default slot) is projected into the internal <dialog>
//   and only renders when it's open.
// - Buttons marked `data-close` dismiss the dialog.
// - Backdrop click dismisses unless the host has the `static` attribute.

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
		background: transparent;
		color: inherit;
		max-width: 100vw;
		max-height: 100vh;
		margin: auto;
		opacity: 0;
		transform: scale(0.98);
		transition:
			opacity 140ms ease,
			transform 140ms ease,
			overlay 140ms ease allow-discrete,
			display 140ms ease allow-discrete;
	}
	dialog[open] { opacity: 1; transform: scale(1); }
	@starting-style {
		dialog[open] { opacity: 0; transform: scale(0.98); }
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

export class ElementDialog extends ElementBase {
	static get observedAttributes() { return ['open']; }

	constructor() {
		super();
		if (!isBrowser) return;
		if (!this.shadowRoot) {
			const shadow = this.attachShadow({ mode: 'open' });
			shadow.appendChild(getTemplate().content.cloneNode(true));
		}
		this._dialog = this.shadowRoot.querySelector('dialog');
	}

	connectedCallback() {
		this._trigger = this.querySelector('[slot="trigger"]');
		if (this._trigger) {
			this._trigger.setAttribute('aria-haspopup', 'dialog');
			this.on(this._trigger, 'click', () => { this.open = true; });
		}

		// Light-DOM data-close — works for any descendant. Inside the shadow
		// dialog, clicks on slotted content still bubble out to the host.
		this.on(this, 'click', (e) => {
			const closer = e.target.closest?.('[data-close]');
			if (closer && this.contains(closer)) this.open = false;
		});

		// Backdrop dismiss — when the dialog itself is the click target the
		// user clicked the ::backdrop pseudo. Slotted content retargets to the
		// shadow <slot>, so this comparison stays exclusive to backdrop hits.
		this.on(this._dialog, 'click', (e) => {
			if (this.hasAttribute('static')) return;
			if (e.target === this._dialog) this.open = false;
		});

		// Native close event (Esc, .close()) — keep host attribute + listeners in sync.
		this.on(this._dialog, 'close', () => {
			if (this.hasAttribute('open')) this.setBoolAttr('open', false);
			this.emit('el:close');
		});

		if (this.hasAttribute('open') && !this._dialog.open) this._showModal();
	}

	attributeChangedCallback(name, _oldValue, newValue) {
		if (!this.isConnected || !this._dialog) return;
		if (name === 'open') {
			const next = newValue !== null;
			if (next && !this._dialog.open) this._showModal();
			else if (!next && this._dialog.open) this._dialog.close();
		}
	}

	_showModal() {
		this._dialog.showModal();
		this.emit('el:open');
	}

	get open() { return this._dialog?.open ?? false; }
	set open(v) { this.setBoolAttr('open', !!v); }
}

defineElement('element-dialog', ElementDialog);
