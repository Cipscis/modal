import * as keys from '@cipscis/keybinding';
import { trapFocus, untrapFocus } from './trap-focus.js';
import { focusable } from './focus-helpers.js';

interface ModalCallback {
	($modal: Element): void;
}

interface ModalInitOptions {
	onShow?: ModalCallback,
	onHide?: ModalCallback,
	triggerSelector?: string,
}

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

/** The active modal window
 *
 * @type {Element | null} */
let $focus: Element | null = null;

/** The element that had focus before opening the currently active modal window
 *
 * @type {HTMLElement | null} */
let $active: HTMLElement | null = null;

let _onShow: ModalCallback | null = null;
let _onHide: ModalCallback | null = null;

/**
 * Initialise the Modal module.
 *
 * @param {ModalInitOptions} options - An optional set of options.
 * @param {ModalCallback} [onShow] - A callback for when a modal is shown.
 * @param {ModalCallback} [onHide] - A callback for when a modal is hidden.
 * @param {string} [triggerSelector] - A selector to use for finding modal
 *   trigger elements.
 */
function init(options?: ModalInitOptions): void {
	options = options ?? {};

	if (options.onShow) {
		_onShow = options.onShow;
	}
	if (options.onHide) {
		_onHide = options.onHide;
	}
	if (options.triggerSelector) {
		selectors.trigger = options.triggerSelector;
	}

	_initEvents();
}

/**
 * Initialise events for the Modal module.
 */
function _initEvents(): void {
	document.addEventListener('click', _processTriggerClickEvent);
}

/**
 * Bind events that should be active when a modal is active.
 *
 * @throws {Error} - Modals must contain a body element.
 */
function _bindModalActiveEvents(): void {
	keys.bind('esc', _hide, { allowInInput: true });

	document.addEventListener('click', _hideEvent);
	document.addEventListener('click', _hideIfBackgroundClickEvent);

	// $active should never be null here because it's only called immediately after setting $active
	const $activeBody = ($active as HTMLElement).querySelector(selectors.body);
	if ($activeBody instanceof HTMLElement) {
		trapFocus($activeBody);
	} else {
		throw new Error('Modal: Could not find body element on active modal.');
	}
}

/**
 * Unbind events that should be active when no modal is active.
 */
function _unbindModalActiveEvents(): void {
	keys.unbind('esc', _hide);

	document.removeEventListener('click', _hideEvent);
	document.removeEventListener('click', _hideIfBackgroundClickEvent);

	untrapFocus();
}

/**
 * A callback called when a modal trigger is clicked.
 *
 * @param {Event} e
 */
function _processTriggerClickEvent(e: Event): void {
	const $target = e.target;

	if ($target instanceof HTMLElement) {
		const $trigger = $target.closest(selectors.trigger);
		if ($trigger instanceof HTMLElement) {
			e.preventDefault();

			const targetId = _getTargetId($trigger);

			if (targetId) {
				_showById(targetId);
			}
		}
	}
}

/**
 * Gets the ID of a modal from a trigger element, looking first at its href and then at its aria-controls attribute.
 *
 * @param  {HTMLElement} $trigger - A modal trigger element.
 *
 * @return {string} The ID of the modal this trigger activates.
 */
function _getTargetId($trigger: HTMLElement): string | null {
	let targetId = $trigger.getAttribute('href');

	if (targetId && /^#/.test(targetId) === true) {
		targetId = targetId.substring(1);
	} else {
		targetId = $trigger.getAttribute('aria-controls');
	}

	return targetId;
}

/**
 * A callback called when the user clicks outside the active modal, which hides the modal.
 *
 * @param {Event} e
 */
function _hideIfBackgroundClickEvent(e: Event): void {
	const $this = e.target;

	if ($this instanceof HTMLElement) {
		if ($this.closest(selectors.body)) {
			// Click was within the modal popup, so ignore it
			return;
		} else if ($this.closest(selectors.trigger)) {
			// Click was within the trigger, so ignore it
			return;
		} else {
			// Click was outside the modal popup, so close it
			_hide();
		}
	}
}

/**
 * Show a modal with a given ID.
 *
 * @param {string} id - The ID to use to find the modal to show.
 */
function _showById(id: string): void {
	const $modal = document.getElementById(id);

	if ($modal) {
		_show($modal);
	}
}

/**
 * Show a given modal element.
 *
 * @param {HTMLElement} $modal - The modal to show.
 */
function _show($modal: HTMLElement): void {
	if ($modal === $active) {
		// Do nothing if the modal is already open
		return;
	}

	if ($active) {
		// If there's already an active modal window,
		// keep remembering the same $focus element
		_hide();
	}

	$focus = document.activeElement;
	$active = $modal;

	$modal.setAttribute('aria-hidden', 'false');

	const bodyOpenClass = _getBodyOpenClass($modal);
	(document.querySelector('body') as HTMLElement).classList.add(bodyOpenClass);

	// Move focus within modal window
	const $focusable = _getFocusable();
	if ($focusable && $focusable.length) {
		$focusable[0].focus();
	}

	_bindModalActiveEvents();

	if (_onShow) {
		_onShow($modal);
	}
}

/**
 * A callback called when a modal is hidden.
 *
 * @param {Event} e
 */
function _hideEvent(e: Event): void {
	const $target = e.target;

	if ($target instanceof HTMLElement) {
		if ($target.closest(selectors.close)) {
			e.preventDefault();
			_hide();
		}
	}
}

/**
 * Hide the currently active modal.
 */
function _hide(): void {
	if ($active) {
		const $modal = $active;
		$modal.setAttribute('aria-hidden', 'true');

		const bodyOpenClass = _getBodyOpenClass($modal);
		(document.querySelector('body') as HTMLElement).classList.remove(bodyOpenClass);

		_unbindModalActiveEvents();

		// Return focus where it was
		if ($focus) {
			if (
				$focus instanceof HTMLElement
			) {
				$focus.focus();
			}
		}

		$active = null;
		$focus = null;

		if (_onHide) {
			_onHide($modal);
		}
	}
}

/**
 * Get the class that should be applied to the <body> element while a given modal is open.
 *
 * @param  {HTMLElement} $modal - The modal that will be open.
 *
 * @return {string} The class to be applied to the <body> element.
 */
function _getBodyOpenClass($modal: HTMLElement): string {
	const bodyOpenClass = $modal.getAttribute(dataAttributes.bodyOpenClass) || classes.bodyOpen;

	return bodyOpenClass;
}

/**
 * Get all elements within a given modal element, or the currently active one, that can receive keyboard focus.
 *
 * @param {(HTMLElement} $modal - The relevant modal element.
 */
function _getFocusable($modal: HTMLElement = $active as HTMLElement): (HTMLElement)[] | undefined {
	// $active always set because this is only called after setting it
	const $body = $modal.querySelector(selectors.body);

	if ($body instanceof HTMLElement) {
		const $descendents = $body.querySelectorAll('*');
		const $focusable: (HTMLElement)[] = Array.prototype.filter.call($descendents, focusable);

		if (focusable($body)) {
			$focusable.unshift($body);
		}

		return $focusable;
	} else {
		throw new Error('Modal: Could not find body element on active modal.');
	}
}

/**
 * Show a modal with a given ID.
 *
 * @param {string} id - The ID to use to find the modal to show.
 */
function show(id: string): void {
	return _showById(id);
}

/**
 * Hide the currently active modal.
 */
function hide(): void {
	return _hide();
};

export {
	init,
	show,
	hide,
};
