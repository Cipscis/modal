// Using import from '/filename', Webpack will
// bundle files from outside the docs directory
// even though it is the root for the server
// both locally and on GitHub Pages

import * as modal from '/modal.js';

modal.init({
	onShow: console.log,
});

const selectors = Object.freeze({
	show: '.js-example__show',
	hide: '.js-example__hide',
});

const showExample = (e) => {
	e.stopPropagation();

	modal.show('modal-show-example');
};
document.querySelectorAll(selectors.show).forEach(($el) => $el.addEventListener('click', showExample));

document.querySelectorAll(selectors.hide).forEach(($el) => $el.addEventListener('click', modal.hide));
