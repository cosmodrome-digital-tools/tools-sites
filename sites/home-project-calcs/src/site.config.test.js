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
});
