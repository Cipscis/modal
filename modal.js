// import { activate } from 'activate';
import * as keys from 'keybinding';
// import { subscribe } from 'pubsub';

const modal = (function (
	// activate,
	keys,
	// subscribe,
) {
	const selectors = {
		modal: '.js-modal',
		body: '.js-modal__body',
		trigger: '.js-modal__trigger',
		close: '.js-modal__close'
	};

	const dataSelectors = {
		bodyOpenClass: 'modal-body-open-class'
	};

	const classes = {
		bodyOpen: 'modal__body-open'
	};

	const events = {
		show: '/modal/show',
		hide: '/modal/hide'
	};

	let $focus = undefined; // The active modal window
	let $active = undefined; // The element that had focus before opening the modal window

	const visible = function ($el) {
		let style = window.getComputedStyle($el);

		let visibility = style.visibility;
		let display = style.display;

		let isVisible = visibility !== 'hidden' && display !== 'none';

		return isVisible;
	};

	// Callback for passing into Array.prototype.filter
	const focusable = function ($el) {
		let focusIfNotDisabled = $el.matches('input, select, textarea, button, object');
		let isNotDisabled = $el.disabled === false;

		let focusThroughHref = $el.matches('a, area') && $el.matches('[href]');
		let focusThroughTabindex = $el.matches('[tabindex]');

		let isFocusable;
		if (focusIfNotDisabled) {
			isFocusable = isNotDisabled;
		} else {
			isFocusable = focusThroughHref || focusThroughTabindex;
		}

		let isVisible = visible($el);

		isFocusable = isFocusable && isVisible;

		return isFocusable;
	};

	// Callback for passing into Array.prototype.filter
	const tabbable = function ($el) {
		let isFocusable = focusable($el);
		let untabbableTabIndex = $el.matches('[tabindex="-1"]');

		return isFocusable && !untabbableTabIndex;
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
			// if (subscribe) {
			// 	subscribe(events.show, module._showById);
			// 	subscribe(events.hide, module._hide);
			// }
		},

		_bindModalActiveEvents: function () {
			keys.bind('escape', module._hide, true);

			document.addEventListener('click', module._hideIfBackgroundClick);
			document.querySelectorAll('*').forEach(el => el.addEventListener('focus', module._wrapTab));
		},

		_unbindModalActiveEvents: function () {
			keys.unbind('escape', module._hide);

			document.removeEventListener('click', module._hideIfBackgroundClick);
			document.querySelectorAll('*').forEach(el => el.removeEventListener('focus', module._wrapTab));
		},

		// Event callbacks
		_processTriggerClick: function (e) {
			let $trigger = e.target.closest(selectors.trigger);
			let targetId = $trigger.getAttribute('href');

			e.preventDefault();

			if (/^#/.test(targetId) === true) {
				targetId = targetId.substring(1);
			} else {
				targetId = $trigger.getAttribute('aria-controls');
			}

			module._showById(targetId);
		},

		_wrapTab: function (e) {
			let $target = e.target;
			let $body = $active.querySelector(selectors.body);
			let isInModal = !!$target.closest(selectors.body);
			let afterModal = $body.compareDocumentPosition($target) === Node.DOCUMENT_POSITION_FOLLOWING;

			if (!isInModal) {
				e.preventDefault();

				let $tabbable = module._getTabbable();

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
			let $this = e.target;

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
			let $modal = document.querySelector('#' + id);

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
			let bodyOpenClass = module._getBodyOpenClass($modal);
			document.querySelector('body').classList.add(bodyOpenClass);

			module._onShow($modal);

			// Move focus within modal window
			let $focusable = module._getFocusable();
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
				let bodyOpenClass = module._getBodyOpenClass($active);
				document.querySelector('body').classList.remove(bodyOpenClass);

				module._unbindModalActiveEvents();

				// Return focus where it was
				if ($focus) {
					$focus.focus();
				}

				$active = undefined;
				$focus = undefined;
			}
		},

		_getBodyOpenClass: function ($modal) {
			let bodyOpenClass = $modal.getAttribute(`data-${dataSelectors.bodyOpenClass}`) || classes.bodyOpen;

			return bodyOpenClass;
		},

		// Focus management
		_getFocusable: function ($modal) {
			$modal = $modal || $active;
			let $body = $modal.querySelector(selectors.body);

			let $descendents = $body.querySelectorAll('*');
			let $focusable = Array.prototype.filter.call($descendents, focusable);

			return $focusable;
		},

		_getTabbable: function ($modal) {
			$modal = $modal || $active;
			let $body = $modal.querySelector(selectors.body);

			let $descendents = $body.querySelectorAll('*');
			let $tabbable = Array.prototype.filter.call($descendents, tabbable);

			return $tabbable;
		}
	};

	return {
		init: module.init
	};
})(
	// activate,
	keys,
	// subscribe,
);

export { modal };
export default modal;
