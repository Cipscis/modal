import * as keys from 'keybinding';
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

	const visible = function ($el) {
		let style = window.getComputedStyle($el);

		let visibility = style.visibility;
		let display = style.display;

		let isVisible = visibility !== 'hidden' && display !== 'none';

		return isVisible;
	};

	// Callback for passing into Array.prototype.filter
	const focusable = function ($el) {
		const focusIfNotDisabled = $el.matches('input, select, textarea, button, object');
		const isNotDisabled = $el.disabled === false;

		let isFocusable;
		if (focusIfNotDisabled) {
			isFocusable = isNotDisabled;
		} else {
			const focusThroughHref = $el.matches('a, area') && $el.matches('[href]');
			const focusThroughTabindex = $el.matches('[tabindex]');

			isFocusable = focusThroughHref || focusThroughTabindex;
		}

		const isVisible = visible($el);

		isFocusable = isFocusable && isVisible;

		return isFocusable;
	};

	// Callback for passing into Array.prototype.filter
	const tabbable = function ($el) {
		const isFocusable = focusable($el);
		const untabbableTabIndex = $el.matches('[tabindex="-1"]');

		const isTabbable = isFocusable && !untabbableTabIndex;

		return isTabbable;
	};

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
			document.querySelectorAll('*').forEach(el => el.addEventListener('focus', module._wrapTab));
		},

		_unbindModalActiveEvents: function () {
			keys.unbind('esc', module._hide);

			document.removeEventListener('click', module._hideIfBackgroundClick);
			document.querySelectorAll('*').forEach(el => el.removeEventListener('focus', module._wrapTab));
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

		_wrapTab: function (e) {
			const $target = e.target;

			const isInModal = !!$target.closest(selectors.body);
			if (!isInModal) {
				e.preventDefault();

				const $tabbable = module._getTabbable();

				const $body = $active.querySelector(selectors.body);
				const afterModal = $body.compareDocumentPosition($target) === Node.DOCUMENT_POSITION_FOLLOWING;

				if (afterModal) {
					// Wrap to start
					$tabbable[0].focus();
				} else {
					// Wrap to end
					$tabbable[$tabbable.length-1].focus();
				}
			}
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

			return $focusable;
		},

		_getTabbable: function ($modal) {
			$modal = $modal || $active;
			const $body = $modal.querySelector(selectors.body);

			const $descendents = $body.querySelectorAll('*');
			const $tabbable = Array.prototype.filter.call($descendents, tabbable);

			return $tabbable;
		}
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
