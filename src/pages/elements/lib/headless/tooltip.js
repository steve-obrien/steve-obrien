import { ElementBase, defineElement, uid } from './base.js';

// <element-tooltip text="…" placement="top|bottom|left|right" delay="150">
//   <button>trigger</button>
// </element-tooltip>
export class ElementTooltip extends ElementBase {
	static get observedAttributes() { return ['text', 'placement', 'delay']; }

	connectedCallback() {
		this._trigger = this.firstElementChild;
		if (!this._trigger) return;

		const id = uid('tip');
		this._bubble = document.createElement('div');
		this._bubble.id = `${id}-bubble`;
		this._bubble.setAttribute('role', 'tooltip');
		this._bubble.setAttribute('data-placement', this.getAttribute('placement') || 'top');
		this._bubble.dataset.elTooltip = '';
		this._bubble.hidden = true;
		this._bubble.textContent = this.getAttribute('text') || '';
		this.appendChild(this._bubble);
		this._trigger.setAttribute('aria-describedby', this._bubble.id);

		this.on(this._trigger, 'mouseenter', () => this._show());
		this.on(this._trigger, 'mouseleave', () => this._hide());
		this.on(this._trigger, 'focus', () => this._show());
		this.on(this._trigger, 'blur', () => this._hide());
	}

	_show() {
		const delay = Number(this.getAttribute('delay') || 120);
		clearTimeout(this._t);
		this._t = setTimeout(() => {
			this._bubble.hidden = false;
			this.emit('el:show');
		}, delay);
	}
	_hide() {
		clearTimeout(this._t);
		this._bubble.hidden = true;
		this.emit('el:hide');
	}

	attributeChangedCallback(name, _o, value) {
		if (!this._bubble) return;
		if (name === 'text') this._bubble.textContent = value || '';
		if (name === 'placement') this._bubble.setAttribute('data-placement', value || 'top');
	}
}

defineElement('element-tooltip', ElementTooltip);
