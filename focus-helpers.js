const visible = function ($el) {
	// Check visibility in terms of if an element may be focusable

	let isVisible = true;

	if (
		(style.position !== 'fixed') &&
		((['body', 'html']).includes($el.tagName.toLowerCase())) === false
	) {
		// For elements that aren't fixed position, <body>, or <html>,
		// their offsetParent will be null if they or an ancestor is display: none;
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
		if ($el.offsetParent === null) {
			isVisible = false;
		}
	} else {
		// If the offsetParent shorthand can't be used, use getComputedStyle
		const style = window.getComputedStyle($el);

		const visibility = style.visibility;
		const display = style.display;

		if (display === 'none') {
			isVisible = false;
		} else if (visibility === 'hidden') {
			isVisible = false;
		} else {
			// Check if an element is hidden because of an ancestor's style
			for (const $ancestor = $el.ancestorElement; !!$ancestor; $ancestor = $el.ancestorElement) {
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
};

const focusable = function ($el) {
	let isFocusable;

	if ($el.matches('input, select, textarea, button, object')) {
		// Focus if not disabled
		const isNotDisabled = $el.disabled === false;

		isFocusable = isNotDisabled;
	} else if ($el.matches('a, area')) {
		// Focus through href attribute
		const hasHrefAttribute = $el.matches('[href]');

		isFocusable = hasHrefAttribute;
	} else if ($el.matches('[tabindex]')) {
		// Focus through tabindex attribute
		isFocusable = true;
	} else if ($el.matches('[contentEditable="true"]')) {
		// Focus through contentEditable
		isFocusable = true;
	}

	if (isFocusable) {
		const isVisible = visible($el);

		isFocusable = isVisible;
	}

	return isFocusable;
};

const tabbable = function ($el) {
	let isTabbable = false;

	const isFocusable = focusable($el);
	if (isFocusable) {
		// Can receive focus, therefore tababble unless tabindex="-1"
		const untabbableTabIndex = $el.matches('[tabindex="-1"]');

		isTabbable = !untabbableTabIndex;
	}

	return isTabbable;
};

export {
	visible,
	focusable,
	tabbable,
};
