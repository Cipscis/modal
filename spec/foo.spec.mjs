import { foo } from '../main.js';

describe('foo', () => {
	it('returns true', () => {
		expect(foo()).toBe(true);
	});
});
