const visible = function ($el) {
	let style = window.getComputedStyle($el);

	let visibility = style.visibility;
	let display = style.display;

	let isVisible = visibility !== 'hidden' && display !== 'none';

	return isVisible;
};

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

const tabbable = function ($el) {
	const isFocusable = focusable($el);
	const untabbableTabIndex = $el.matches('[tabindex="-1"]');

	const isTabbable = isFocusable && !untabbableTabIndex;

	return isTabbable;
};

export {
	visible,
	focusable,
	tabbable,
};
