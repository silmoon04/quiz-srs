import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders with default classes', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass(
      'rounded-lg',
      'border',
      'bg-card',
      'text-card-foreground',
      'shadow-sm',
    );
  });

  it('merges custom className with default classes', () => {
    render(
      <Card data-testid="card" className="custom-class">
        Card content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg', 'custom-class');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Card ref={ref}>Card content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through additional props', () => {
    render(
      <Card data-testid="card" aria-label="Test card">
        Card content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });
});

describe('CardHeader', () => {
  it('renders with default classes', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('merges custom className with default classes', () => {
    render(
      <CardHeader data-testid="header" className="custom-header">
        Header content
      </CardHeader>,
    );
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('flex', 'custom-header');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<CardHeader ref={ref}>Header content</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('renders with default classes', () => {
    render(<CardTitle data-testid="title">Title content</CardTitle>);
    const title = screen.getByTestId('title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
  });

  it('merges custom className with default classes', () => {
    render(
      <CardTitle data-testid="title" className="custom-title">
        Title content
      </CardTitle>,
    );
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('text-2xl', 'custom-title');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<CardTitle ref={ref}>Title content</CardTitle>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardDescription', () => {
  it('renders with default classes', () => {
    render(<CardDescription data-testid="description">Description content</CardDescription>);
    const description = screen.getByTestId('description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('merges custom className with default classes', () => {
    render(
      <CardDescription data-testid="description" className="custom-description">
        Description content
      </CardDescription>,
    );
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-sm', 'custom-description');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<CardDescription ref={ref}>Description content</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardContent', () => {
  it('renders with default classes', () => {
    render(<CardContent data-testid="content">Content area</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('merges custom className with default classes', () => {
    render(
      <CardContent data-testid="content" className="custom-content">
        Content area
      </CardContent>,
    );
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('p-6', 'custom-content');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<CardContent ref={ref}>Content area</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('renders with default classes', () => {
    render(<CardFooter data-testid="footer">Footer content</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('merges custom className with default classes', () => {
    render(
      <CardFooter data-testid="footer" className="custom-footer">
        Footer content
      </CardFooter>,
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('flex', 'custom-footer');
  });

  it('forwards ref to the div element', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<CardFooter ref={ref}>Footer content</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card composition', () => {
  it('renders a complete card with all parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Card Title</CardTitle>
          <CardDescription data-testid="description">Card Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Card Content</CardContent>
        <CardFooter data-testid="footer">Card Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('Card Title');
    expect(screen.getByTestId('description')).toHaveTextContent('Card Description');
    expect(screen.getByTestId('content')).toHaveTextContent('Card Content');
    expect(screen.getByTestId('footer')).toHaveTextContent('Card Footer');
  });

  it('maintains proper nesting structure', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent data-testid="content">Content</CardContent>
      </Card>,
    );

    const card = screen.getByTestId('card');
    const header = screen.getByTestId('header');
    const content = screen.getByTestId('content');

    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
  });

  it('renders card with only some parts', () => {
    render(
      <Card data-testid="card">
        <CardContent data-testid="content">Just content</CardContent>
      </Card>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toHaveTextContent('Just content');
  });
});
