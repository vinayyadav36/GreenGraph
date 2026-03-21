import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../components/ui/Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders all variants without error', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders all sizes without error', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount();
    });
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    const svg = btn.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(<Button isLoading onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(<Button><span>Child Element</span></Button>);
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});
