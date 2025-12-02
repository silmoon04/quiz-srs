import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content here</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open Dialog'));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog content here')).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open Dialog'));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('renders as controlled component', async () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();

    rerender(
      <Dialog open={true}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });
  });
});

describe('DialogTrigger', () => {
  it('renders as a button by default', () => {
    render(
      <Dialog>
        <DialogTrigger>Click me</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Click me' });
    expect(trigger).toBeInTheDocument();
  });

  it('renders as child element with asChild prop', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <span data-testid="custom-trigger">Custom Trigger</span>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });
});

describe('DialogContent', () => {
  it('renders children correctly', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Title</DialogTitle>
          <p>Custom content</p>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });

  it('includes close button with screen reader text', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  it('merges custom className with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-class" data-testid="dialog-content">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('custom-class');
    });
  });

  it('forwards ref to the content element', async () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent ref={ref}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('DialogOverlay', () => {
  it('renders overlay when dialog is open', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const overlay = document.querySelector('[data-state="open"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  it('closes dialog when overlay is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    // Click on the overlay (outside the dialog content)
    const overlay = document.querySelector('[class*="fixed inset-0"]');
    if (overlay) {
      await user.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });
});

describe('DialogHeader', () => {
  it('renders with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
    });
  });

  it('merges custom className with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader data-testid="header" className="custom-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'custom-header');
    });
  });

  it('passes through additional props', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader data-testid="header" aria-label="Dialog header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const header = screen.getByTestId('header');
      expect(header).toHaveAttribute('aria-label', 'Dialog header');
    });
  });
});

describe('DialogFooter', () => {
  it('renders with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'flex-col-reverse');
    });
  });

  it('merges custom className with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer" className="custom-footer">
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'custom-footer');
    });
  });

  it('renders children correctly', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Cancel</button>
            <button>Submit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });
});

describe('DialogTitle', () => {
  it('renders with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle data-testid="title">My Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const title = screen.getByTestId('title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none', 'tracking-tight');
    });
  });

  it('merges custom className with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle data-testid="title" className="custom-title">
            My Title
          </DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-lg', 'custom-title');
    });
  });

  it('forwards ref to the title element', async () => {
    const ref = { current: null } as React.RefObject<HTMLHeadingElement>;
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle ref={ref}>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });
});

describe('DialogDescription', () => {
  it('renders with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription data-testid="description">This is a description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const description = screen.getByTestId('description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  it('merges custom className with default classes', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription data-testid="description" className="custom-description">
            This is a description
          </DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm', 'custom-description');
    });
  });

  it('forwards ref to the description element', async () => {
    const ref = { current: null } as React.RefObject<HTMLParagraphElement>;
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription ref={ref}>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });
});

describe('Dialog composition', () => {
  it('renders a complete dialog with all parts', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogHeader data-testid="header">
            <DialogTitle data-testid="title">Dialog Title</DialogTitle>
            <DialogDescription data-testid="description">Dialog Description</DialogDescription>
          </DialogHeader>
          <div data-testid="body">Dialog Body Content</div>
          <DialogFooter data-testid="footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open Dialog'));

    await waitFor(() => {
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent('Dialog Title');
      expect(screen.getByTestId('description')).toHaveTextContent('Dialog Description');
      expect(screen.getByTestId('body')).toHaveTextContent('Dialog Body Content');
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('maintains proper nesting structure', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid="content">
          <DialogHeader data-testid="header">
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      const content = screen.getByTestId('content');
      const header = screen.getByTestId('header');
      const title = screen.getByTestId('title');

      expect(content).toContainElement(header);
      expect(header).toContainElement(title);
    });
  });

  it('closes dialog when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('handles onOpenChange callback', async () => {
    let isOpen = false;
    const handleOpenChange = (open: boolean) => {
      isOpen = open;
    };

    const user = userEvent.setup();
    render(
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(isOpen).toBe(true);
    });
  });
});
