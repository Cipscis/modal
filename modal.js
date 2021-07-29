import * as keys from 'keybinding';
import { trapFocus, untrapFocus } from './trap-focus.js';
import { focusable } from './focus-helpers.js';

const selectors = {
	modal: '.js-modal',
	body: '.js-modal__body',
	trigger: '.js-modal__trigger',
	close: '.js-modal__close',
};

const dataAttributes = Object.freeze({
	bodyOpenClass: 'data-modal-body-open-class',
});

const classes = Object.freeze({
	bodyOpen: 'modal__body-open',
});

let $focus; // The active modal window
let $active; // The element that had focus before opening the modal window

const module = {
	init: function (options) {
		options = options ?? {};

		if (options.onShow) {
			module._onShow = options.onShow;
		}
		if (options.onHide) {
			module._onHide = options.onHide;
		}
		if (options.triggerSelector) {
			selectors.trigger = options.triggerSelector;
		}

		module._initEvents();
	},

	_initEvents: function () {
		document.addEventListener('click', module._processTriggerClickEvent);
	},

	_bindModalActiveEvents: function () {
		keys.bind('esc', module._hide, { allowInInput: true });

		document.addEventListener('click', module._hideEvent);
		document.addEventListener('click', module._hideIfBackgroundClickEvent);

		trapFocus($active.querySelector(selectors.body));
	},

	_unbindModalActiveEvents: function () {
		keys.unbind('esc', module._hide);

		document.removeEventListener('click', module._hideEvent);
		document.removeEventListener('click', module._hideIfBackgroundClickEvent);

		untrapFocus();
	},

	// Event callbacks
	_processTriggerClickEvent: function (e) {
		const $trigger = e.target.closest(selectors.trigger);
		if ($trigger) {
			e.preventDefault();

			const targetId = module._getTargetId($trigger);

			module._showById(targetId);
		}
	},

	_getTargetId: function ($trigger) {
		let targetId = $trigger.getAttribute('href');

		if (/^#/.test(targetId) === true) {
			targetId = targetId.substring(1);
		} else {
			targetId = $trigger.getAttribute('aria-controls');
		}

		return targetId;
	},

	_hideIfBackgroundClickEvent: function (e) {
		const $this = e.target;

		if ($this.closest(selectors.body)) {
			// Click was within the modal popup, so ignore it
			return;
		} else if ($this.closest(selectors.trigger)) {
			// Click was within the trigger, so ignore it
			return;
		} else {
			// Click was outside the modal popup, so close it
			module._hide();
		}
	},

	// Hide/Show functions
	_showById: function (id) {
		const $modal = document.getElementById(id);

		if ($modal) {
			module._show($modal);
		}
	},

	_show: function ($modal) {
		if ($modal === $active) {
			// Do nothing if the modal is already open
			return;
		}

		if ($active) {
			// If there's already an active modal window,
			// keep remembering the same $focus element
			module._hide();
		}

		$focus = document.activeElement;
		$active = $modal;

		$modal.setAttribute('aria-hidden', false);

		const bodyOpenClass = module._getBodyOpenClass($modal);
		document.querySelector('body').classList.add(bodyOpenClass);

		// Move focus within modal window
		const $focusable = module._getFocusable();
		if ($focusable.length) {
			$focusable[0].focus();
		}

		module._bindModalActiveEvents();

		if (module._onShow) {
			module._onShow($modal);
		}
	},

	_hideEvent: function (e) {
		const $target = e.target;
		if ($target.closest(selectors.close)) {
			e.preventDefault();
			module._hide();
		}
	},

	_hide: function () {
		if ($active) {
			const $modal = $active;
			$modal.setAttribute('aria-hidden', true);

			const bodyOpenClass = module._getBodyOpenClass($modal);
			document.querySelector('body').classList.remove(bodyOpenClass);

			module._unbindModalActiveEvents();

			// Return focus where it was
			if ($focus) {
				$focus.focus();
			}

			$active = null;
			$focus = null;

			if (module._onHide) {
				module._onHide($modal);
			}
		}
	},

	_getBodyOpenClass: function ($modal) {
		const bodyOpenClass = $modal.getAttribute(dataAttributes.bodyOpenClass) || classes.bodyOpen;

		return bodyOpenClass;
	},

	// Focus management
	_getFocusable: function ($modal) {
		$modal = $modal || $active;
		const $body = $modal.querySelector(selectors.body);

		const $descendents = $body.querySelectorAll('*');
		const $focusable = Array.prototype.filter.call($descendents, focusable);

		if (focusable($body)) {
			$focusable.unshift($body);
		}

		return $focusable;
	},

	// Exports
	show: function (id) {
		return module._showById(id);
	},

	hide: function () {
		return module._hide();
	},
};

export const {
	init,
	show,
	hide,
} = module;
