var isSSR = function isSSR() {
  return typeof window === 'undefined';
};
function isBrowser() {
  return typeof window !== 'undefined';
}

export { isBrowser, isSSR };
