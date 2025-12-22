const { test, expect } = require('@jest/globals');

test('simple test should pass', () => {
    expect(1 + 1).toBe(2);
});