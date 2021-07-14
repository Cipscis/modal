import { visible, focusable, tabbable } from './focus-helpers.js';

const classes = Object.freeze({
	trap: 'js-focus-trap',
});

const selectors = Object.freeze({
	trap: `.${classes.trap}`,
});

// There can only be one
let $trap;

/*
Adding these dummy elements is necessary in case the focus trap
is the first or last tabbable area on the page, in which case
the user moving focus may move it out of the DOM and therefore
won't be picked up by 'focus' events
*/
const $dummyStart = document.createElement('div');
$dummyStart.setAttribute('tabindex', 0);
// <div tabindex="0"></div>

const $dummyEnd = document.createElement('div');
$dummyEnd.setAttribute('tabindex', 0);
// <div tabindex="0"></div>

const trapFocus = function ($el) {
	// Remove any existing focus traps
	if ($trap) {
		untrapFocus();
	}

	// Record current focus trap
	$trap = $el;
	$trap.classList.add(classes.trap);

	// Add dummy elements for detecting last tab
	$trap.parentNode.insertBefore($dummyStart, $trap);
	$trap.parentNode.insertBefore($dummyEnd, $trap.nextSibling);

	document.querySelectorAll('*').forEach((el) => el.addEventListener('focus', wrapTab));
};

const untrapFocus = function () {
	document.querySelectorAll('*').forEach((el) => el.removeEventListener('focus', wrapTab));

	$trap.classList.remove(classes.trap);
	$trap = null;

	$dummyStart.remove();
	$dummyEnd.remove();
};

const wrapTab = function (e) {
	const $focus = e.target;

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
};

export {
	trapFocus,
	untrapFocus,
};
