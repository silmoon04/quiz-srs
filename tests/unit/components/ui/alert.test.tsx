import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert', () => {
  it('renders with default variant', () => {
    render(<Alert>Alert content</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Alert content');
  });

  it('renders with destructive variant', () => {
    render(<Alert variant="destructive">Destructive alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('text-destructive');
  });

  it('applies default variant classes when no variant specified', () => {
    render(<Alert>Default alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-background');
    expect(alert).toHaveClass('text-foreground');
  });

  it('merges custom className with variant classes', () => {
    render(<Alert className="custom-class">Alert with custom class</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
    expect(alert).toHaveClass('rounded-lg');
  });

  it('forwards ref to the alert element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Alert ref={ref}>Alert with ref</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to the alert element', () => {
    render(<Alert data-testid="custom-alert">Alert with props</Alert>);
    expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
  });
});

describe('AlertTitle', () => {
  it('renders as an h5 element', () => {
    render(<AlertTitle>Title text</AlertTitle>);
    const title = screen.getByRole('heading', { level: 5 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Title text');
  });

  it('applies default styling classes', () => {
    render(<AlertTitle>Styled title</AlertTitle>);
    const title = screen.getByRole('heading', { level: 5 });
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('merges custom className with default classes', () => {
    render(<AlertTitle className="custom-title-class">Custom title</AlertTitle>);
    const title = screen.getByRole('heading', { level: 5 });
    expect(title).toHaveClass('custom-title-class');
    expect(title).toHaveClass('font-medium');
  });

  it('forwards ref to the heading element', () => {
    const ref = { current: null } as React.RefObject<HTMLParagraphElement>;
    render(<AlertTitle ref={ref}>Title with ref</AlertTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });

  it('passes additional props to the heading element', () => {
    render(<AlertTitle data-testid="custom-title">Title with props</AlertTitle>);
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });
});

describe('AlertDescription', () => {
  it('renders as a div element', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    const description = screen.getByText('Description text');
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe('DIV');
  });

  it('applies default styling classes', () => {
    render(<AlertDescription>Styled description</AlertDescription>);
    const description = screen.getByText('Styled description');
    expect(description).toHaveClass('text-sm');
  });

  it('merges custom className with default classes', () => {
    render(<AlertDescription className="custom-desc-class">Custom description</AlertDescription>);
    const description = screen.getByText('Custom description');
    expect(description).toHaveClass('custom-desc-class');
    expect(description).toHaveClass('text-sm');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLParagraphElement>;
    render(<AlertDescription ref={ref}>Description with ref</AlertDescription>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional props to the div element', () => {
    render(<AlertDescription data-testid="custom-desc">Description with props</AlertDescription>);
    expect(screen.getByTestId('custom-desc')).toBeInTheDocument();
  });
});

describe('Alert composition', () => {
  it('renders Alert with AlertTitle and AlertDescription', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description content</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Alert Title');
    expect(screen.getByText('Alert description content')).toBeInTheDocument();
  });

  it('renders destructive Alert with title and description', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-destructive');
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
