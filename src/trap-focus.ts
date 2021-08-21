import { visible, focusable, tabbable } from './focus-helpers.js';

const classes = Object.freeze({
	trap: 'js-focus-trap',
});

const selectors = Object.freeze({
	trap: `.${classes.trap}`,
});

// There can only be one
let $trap: HTMLElement | null = null;

/*
Adding these dummy elements is necessary in case the focus trap
is the first or last tabbable area on the page, in which case
the user moving focus may move it out of the DOM and therefore
won't be picked up by 'focus' events
*/
const $dummyStart = document.createElement('div');
$dummyStart.setAttribute('tabindex', '0');
// <div tabindex="0"></div>

const $dummyEnd = document.createElement('div');
$dummyEnd.setAttribute('tabindex', '0');
// <div tabindex="0"></div>

/**
 * Trap focus within a certain HTMLElement, by detecting when focus would leave
 *   it and forcing it to return. Only one element can trap focus at a time.
 *
 * @param {HTMLElement} $el - The element that should have focus trapped within
 *   it.
 *
 * @throws {Error} - $el must have a parentNode for the focus detection elements
 *   to be inserted before and after it.
 */
function trapFocus($el: HTMLElement): void {
	// Remove any existing focus traps
	untrapFocus();

	// Record current focus trap
	$trap = $el;
	$trap.classList.add(classes.trap);

	// Add dummy elements for detecting last tab
	let $parent = $trap.parentNode;
	if ($parent) {
		$parent.insertBefore($dummyStart, $trap);
		$parent.insertBefore($dummyEnd, $trap.nextSibling);
	} else {
		throw new Error('Modal: Focus trap element has no parentNode');
	}

	document.querySelectorAll('*').forEach((el) => el.addEventListener('focus', _wrapTab));
};

/**
 * Removes the currently active focus trap, returning focus to where it was
 *   before the trap was created.
 */
function untrapFocus(): void {
	if ($trap) {
		document.querySelectorAll('*').forEach((el) => el.removeEventListener('focus', _wrapTab));

		$trap.classList.remove(classes.trap);
		$trap = null;

		$dummyStart.remove();
		$dummyEnd.remove();
	}
}

/**
 * Returns focus to the correct position within the focus trap, based on where focus has been moved to.
 *
 * @param {Event} e
 */
function _wrapTab(e: Event): void {
	const $focus = e.target;

	if (($focus instanceof HTMLElement) && $trap) {
		const isInTrap = !!$focus.closest(selectors.trap);

		if (!isInTrap) {
			const $descendants = $trap.querySelectorAll('*');
			const $tabbable = Array.prototype.filter.call($descendants, tabbable);

			const afterTrap = $trap.compareDocumentPosition($focus) === Node.DOCUMENT_POSITION_FOLLOWING;

			if (afterTrap) {
				// Wrap to start
				$tabbable[0].focus();
			} else {
				// Wrap to end
				$tabbable[$tabbable.length-1].focus();
			}
		}
	}
}

export {
	trapFocus,
	untrapFocus,
};
