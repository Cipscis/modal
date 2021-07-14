import * as keys from 'keybinding';
import { trapFocus, untrapFocus } from './trap-focus.js';
import { focusable } from './focus-helpers.js';
// import { subscribe } from 'pubsub';

const modal = (function (
	keys,
	subscribe,
) {
	const selectors = Object.freeze({
		modal: '.js-modal',
		body: '.js-modal__body',
		trigger: '.js-modal__trigger',
		close: '.js-modal__close'
	});

	const dataAttributes = Object.freeze({
		bodyOpenClass: 'data-modal-body-open-class'
	});

	const classes = Object.freeze({
		bodyOpen: 'modal__body-open'
	});

	// TODO
	const events = Object.freeze({
		show: '/modal/show',
		hide: '/modal/hide'
	});

	let $focus; // The active modal window
	let $active; // The element that had focus before opening the modal window

	const module = {
		init: function (options) {
			options = options || {};

			module._onShow = options.onShow || (() => {});

			module._initEvents();
			module._initSubscriptions();
		},

		_initEvents: function () {
			document.querySelectorAll(selectors.trigger).forEach(($trigger) => $trigger.addEventListener('click', module._processTriggerClick));
			document.querySelectorAll(selectors.close).forEach(($close) => $close.addEventListener('click', module._hideEvent));
		},

		_initSubscriptions: function () {
			// TODO
			if (subscribe) {
				subscribe(events.show, module._showById);
				subscribe(events.hide, module._hide);
			}
		},

		_bindModalActiveEvents: function () {
			keys.bind('esc', module._hide, { allowInInput: true });

			document.addEventListener('click', module._hideIfBackgroundClick);

			trapFocus($active.querySelector(selectors.body));
		},

		_unbindModalActiveEvents: function () {
			keys.unbind('esc', module._hide);

			document.removeEventListener('click', module._hideIfBackgroundClick);

			untrapFocus();
		},

		// Event callbacks
		_processTriggerClick: function (e) {
			e.preventDefault();

			const $trigger = e.target.closest(selectors.trigger);
			const targetId = module._getTargetId($trigger);

			module._showById(targetId);
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

		_hideIfBackgroundClick: function (e) {
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

			module._show($modal);
		},

		_show: function ($modal) {
			if ($active) {
				// If there's already an active modal window,
				// keep remembering the same $focus element
				$active.setAttribute('aria-hidden', true);
			} else {
				$focus = document.activeElement;
			}
			$active = $modal;

			$modal.setAttribute('aria-hidden', false);

			const bodyOpenClass = module._getBodyOpenClass($modal);
			document.querySelector('body').classList.add(bodyOpenClass);

			module._onShow($modal);

			// Move focus within modal window
			const $focusable = module._getFocusable();
			if ($focusable.length) {
				$focusable[0].focus();
			}

			module._bindModalActiveEvents();
		},

		_hideEvent: function (e) {
			e.preventDefault();
			module._hide();
		},

		_hide: function () {
			if ($active) {
				$active.setAttribute('aria-hidden', true);

				const bodyOpenClass = module._getBodyOpenClass($active);
				document.querySelector('body').classList.remove(bodyOpenClass);

				module._unbindModalActiveEvents();

				// Return focus where it was
				if ($focus) {
					$focus.focus();
				}

				$active = null;
				$focus = null;
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
	};

	return {
		init: module.init
	};
})(
	keys,
	// subscribe,
);

export { modal };
export default modal;
