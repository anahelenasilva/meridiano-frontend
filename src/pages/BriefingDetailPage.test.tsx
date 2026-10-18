import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BriefingDetailPage from './BriefingDetailPage';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: 'b-1' }),
  };
});

vi.mock('@/hooks/useApi', () => ({
  useBriefing: () => ({
    data: {
      id: 'b-1',
      generated_at: '2026-10-01T08:00:00Z',
      feed_profile: 'tech',
      brief_markdown: '## Markets\n\nChips are **up** this week.',
    },
    isLoading: false,
    error: null,
  }),
  useUpdateBriefingTitle: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('BriefingDetailPage', () => {
  it('renders the briefing markdown as formatted text', () => {
    render(
      <MemoryRouter>
        <BriefingDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Markets' })).toBeInTheDocument();
    expect(screen.getByText('up', { selector: 'strong' })).toBeInTheDocument();
  });
});
