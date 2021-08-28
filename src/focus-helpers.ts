/**
 * Check visibility in terms of if an element may be focusable.
 *
 * @param  {Element} $el - The Element to check.
 *
 * @return {boolean}
 */
function visible($el: Element): boolean {
	// Check visibility in terms of if an element may be focusable

	let isVisible = true;

	const style = window.getComputedStyle($el);

	if (
		($el instanceof HTMLElement) &&
		(style.position !== 'fixed') &&
		!($el instanceof HTMLBodyElement || $el instanceof HTMLHtmlElement)
	) {
		// For HTML elements that aren't fixed position, <body>, or <html>,
		// their offsetParent will be null if they or an ancestor is display: none;
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
		if ($el.offsetParent === null) {
			isVisible = false;
		}
	} else {
		const visibility = style.visibility;
		const display = style.display;

		if (display === 'none') {
			isVisible = false;
		} else if (visibility === 'hidden') {
			isVisible = false;
		} else {
			// Check if an element is hidden because of an ancestor's style
			for (let $ancestor = $el.parentElement; !!$ancestor; $ancestor = $ancestor.parentElement) {
				const ancestorStyle = window.getComputedStyle($el);

				// If a ancestor is display: none, this element is hidden
				if (ancestorStyle.display === 'none') {
					isVisible = false;
					break;
				}
			}
		}
	}

	return isVisible;
}

/**
 * Check if an Element can receive keyboard focus.
 *
 * @param  {Element} $el - The Element to check.
 *
 * @return {boolean}
 */
function focusable($el: Element): boolean {
	let isFocusable = false;

	if (
		$el instanceof HTMLElement ||
		$el instanceof SVGElement
	) {
		if ($el instanceof HTMLElement) {
			if (
				$el instanceof HTMLInputElement ||
				$el instanceof HTMLSelectElement ||
				$el instanceof HTMLTextAreaElement ||
				$el instanceof HTMLButtonElement
			) {
				// Focus if not disabled
				const isNotDisabled = $el.disabled === false;

				if (isNotDisabled) {
					isFocusable = true;
				}
			} else if ($el instanceof HTMLObjectElement) {
				// Focus if not disabled, but no disabled property
				const isNotDisabled = $el.matches('[disabled]') && !$el.matches('[disabled="false"]');

				if (isNotDisabled) {
					isFocusable = true;
				}
			} else if (
				$el instanceof HTMLAnchorElement ||
				$el instanceof HTMLAreaElement
			) {
				// Focus through href attribute
				const hasHrefAttribute = $el.matches('[href]');

				if (hasHrefAttribute) {
					isFocusable = true;
				}
			} else if ($el.contentEditable === 'true') {
				// Focus through contentEditable
				isFocusable = true;
			}
		}

		if ($el.matches('[tabindex]')) {
			// Focus through tabindex attribute
			isFocusable = true;
		}
	}

	if (isFocusable) {
		const isVisible = visible($el);

		if (!isVisible) {
			isFocusable = false;
		}
	}

	return isFocusable;
}

/**
 * Check if an HTMLElement can receive focus by pressing the "tab" key.
 *
 * @param  {HTMLElement} $el - The HTMLElement to check.
 *
 * @return {boolean}.
 */
function tabbable($el: HTMLElement): boolean {
	let isTabbable = false;

	const isFocusable = focusable($el);
	if (isFocusable) {
		// Can receive focus, therefore tababble unless tabindex="-1"
		const untabbableTabIndex = $el.tabIndex === -1;

		isTabbable = !untabbableTabIndex;
	}

	return isTabbable;
}

export {
	visible,
	focusable,
	tabbable,
};
