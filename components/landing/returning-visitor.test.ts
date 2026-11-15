import { APP_VISITED_KEY, RETURNING_VISITOR_SCRIPT } from './returning-visitor';

/** Runs the head script against a fake page; returns where it sent the visitor, or null. */
function run(url: string, stored: Record<string, string> = {}): string | null {
  const { pathname, search, hash } = new URL(url, 'https://wickglow.test');
  let target: string | null = null;
  const location = { pathname, search, hash, replace: (to: string) => (target = to) };
  const window = { localStorage: { getItem: (key: string) => stored[key] ?? null } };
  new Function('window', 'location', RETURNING_VISITOR_SCRIPT)(window, location);
  return target;
}

describe('returning visitor script', () => {
  it('leaves a first-time visitor on the landing page', () => {
    expect(run('/')).toBeNull();
  });

  it('sends a visitor who opened the app before to /app', () => {
    expect(run('/', { [APP_VISITED_KEY]: '1' })).toBe('/app');
  });

  it('recognises visitors from before the mark by their saved state, old key too', () => {
    expect(run('/', { 'wickglow:state': '{}' })).toBe('/app');
    expect(run('/', { 'lumifi:state': '{}' })).toBe('/app');
  });

  it('keeps the query and hash', () => {
    expect(run('/?utm_source=x#top', { [APP_VISITED_KEY]: '1' })).toBe('/app?utm_source=x#top');
  });

  it('also handles the old /download address', () => {
    expect(run('/download', { [APP_VISITED_KEY]: '1' })).toBe('/app');
    expect(run('/download/', { [APP_VISITED_KEY]: '1' })).toBe('/app');
  });

  it('shows the landing page anyway with ?home', () => {
    expect(run('/?home', { [APP_VISITED_KEY]: '1' })).toBeNull();
    expect(run('/?a=1&home=1', { [APP_VISITED_KEY]: '1' })).toBeNull();
  });

  it('does nothing on other pages', () => {
    expect(run('/app', { [APP_VISITED_KEY]: '1' })).toBeNull();
    expect(run('/privacy', { [APP_VISITED_KEY]: '1' })).toBeNull();
  });

  it('does not throw when storage is blocked', () => {
    const location = { pathname: '/', search: '', hash: '', replace: jest.fn() };
    const window = {
      get localStorage(): never {
        throw new Error('blocked');
      },
    };
    expect(() => new Function('window', 'location', RETURNING_VISITOR_SCRIPT)(window, location)).not.toThrow();
    expect(location.replace).not.toHaveBeenCalled();
  });
});
