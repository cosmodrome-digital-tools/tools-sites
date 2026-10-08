import { describe, expect, it } from 'vitest';
import site, { isPlaceholderDomain } from './site.config.mjs';

describe('site.config', () => {
  it('uses the Home & Yard Calcs display name', () => {
    expect(site.name).toBe('Home & Yard Calcs');
  });
  it('keeps the slug and domain placeholder unchanged by the rebrand', () => {
    expect(site.slug).toBe('home-project-calcs');
    expect(site.domain).toBe('todo-domain.example');
    expect(isPlaceholderDomain).toBe(true);
  });
  it('says on the About page that the author name is a pen name (matches Disclaimer 3.3)', () => {
    expect(site.author.name).toBe('Drew Kessler');
    expect(site.author.penNameNote).toBe('Drew Kessler is a pen name used by the Home & Yard Calcs team.');
  });
});
