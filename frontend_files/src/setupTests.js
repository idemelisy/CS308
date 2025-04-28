// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/user-event';

// test/setupFiles.js
import { TextEncoder } from 'text-encoding';
// Add any global test setup here
beforeEach(() => {
    localStorage.clear();
  });
  // test/setupFiles.js


global.TextEncoder = TextEncoder;

