import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlannerPage from '@/app/planner/page';
import { samplePlan } from '@/lib/ai/sample-plan';
import { axe } from 'vitest-axe';

describe('planner component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has no detectable accessibility violations in the initial planner view', async () => {
    const { container } = render(<PlannerPage />);
    // jsdom has no layout engine, so axe's contrast heuristic cannot be evaluated here.
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });

  it('offers Gemini section generation without presenting demo fallback as AI output', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, demoMode: true })
    } as Response);
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /timeline/i }));
    fireEvent.click(screen.getByRole('button', { name: /generate timeline with gemini/i }));

    expect(await screen.findByText(/Gemini is not configured/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/plan/section', expect.objectContaining({ method: 'POST' }));
    expect(screen.getByRole('button', { name: /load sample timeline suggestions/i })).toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it('applies a returned Gemini section to the editable plan', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, demoMode: false, section: { starters: ['Fresh mango chaat'], mains: ['Paneer pulao'], desserts: ['Kesar kulfi'], drinks: ['Nimbu pani'] } })
    } as Response);
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /menu/i }));
    fireEvent.click(screen.getByRole('button', { name: /generate menu with gemini/i }));

    expect(await screen.findByText('Fresh mango chaat')).toBeInTheDocument();
    expect(screen.getByText(/Generated menu with Gemini/i)).toBeInTheDocument();
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({ section: 'menu' });
    fetchMock.mockRestore();
  });

  it('keeps budget allocation deterministic rather than labeling it as Gemini output', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /^budget$/i }));

    expect(screen.getByText('Budget split is calculated to match your total.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /generate budget with gemini/i })).not.toBeInTheDocument();
  });

  it('updates all dietary options and keeps none exclusive', async () => {
    render(<PlannerPage />);
    const vegetarian = screen.getByRole('button', { name: 'vegetarian' });
    const vegan = screen.getByRole('button', { name: 'vegan' });
    const none = screen.getByRole('button', { name: 'none' });

    for (const name of ['vegan', 'jain', 'halal', 'gluten free', 'none']) {
      fireEvent.click(screen.getByRole('button', { name }));
    }
    await waitFor(() => expect(none).toHaveAttribute('aria-pressed', 'true'));
    expect(vegetarian).toHaveAttribute('aria-pressed', 'false');
    expect(vegan).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'jain' }));
    await waitFor(() => expect(none).toHaveAttribute('aria-pressed', 'false'));
    expect(screen.getByRole('button', { name: 'jain' })).toHaveAttribute('aria-pressed', 'true');
    expect(vegetarian).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows validation errors and does not submit an incomplete event', async () => {
    const fetchMock = vi.spyOn(global, 'fetch');
    render(<PlannerPage />);
    fireEvent.click(screen.getByRole('button', { name: /generate my event plan/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it('updates guest list actions', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /guests/i }));
    fireEvent.change(screen.getByPlaceholderText('Guest name'), { target: { value: 'Nisha' } });
    fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
    expect(await screen.findByText('Nisha')).toBeInTheDocument();
  });

  it('supports task creation and removal', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /timeline/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /new task/i }), { target: { value: 'Book sound system' } });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(await screen.findByText('Book sound system')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remove book sound system/i }));
    await waitFor(() => expect(screen.queryByText('Book sound system')).not.toBeInTheDocument());
  });

  it('filters guests by RSVP', async () => {
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(samplePlan));
    window.localStorage.setItem('celebrate-ai-guests', JSON.stringify([{ id: 'a', name: 'Asha', rsvp: 'yes' }, { id: 'b', name: 'Dev', rsvp: 'no' }]));
    render(<PlannerPage />);
    fireEvent.click(await screen.findByRole('tab', { name: /guests/i }));
    const filters = screen.getByRole('group', { name: /filter guests by rsvp/i });
    fireEvent.click(within(filters).getByRole('button', { name: /^yes$/i }));
    expect(screen.getByText('Asha')).toBeInTheDocument();
    expect(screen.queryByText('Dev')).not.toBeInTheDocument();
  });
});
