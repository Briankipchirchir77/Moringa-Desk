import { render, screen, fireEvent } from '@testing-library/react';
import TagBadge from './TagBadge';

describe('TagBadge', () => {
  test('renders a plain span when there is no onClick', () => {
    render(<TagBadge label="React" />);
    const badge = screen.getByText('React');
    expect(badge.tagName).toBe('SPAN');
  });

  test('renders a button and fires onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TagBadge label="Python" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Python' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies the active class when active', () => {
    render(<TagBadge label="Git" active onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Git' })).toHaveClass('active');
  });
});