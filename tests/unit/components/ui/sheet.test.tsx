import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetOverlay,
  SheetPortal,
} from '@/components/ui/sheet';

describe('Sheet Component', () => {
  describe('Rendering', () => {
    it('renders sheet trigger without crashing', () => {
      render(
        <Sheet>
          <SheetTrigger data-testid="trigger">Open Sheet</SheetTrigger>
        </Sheet>,
      );
      expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('renders trigger with correct text', () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
        </Sheet>,
      );
      expect(screen.getByText('Open Sheet')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.queryByText('Sheet Title')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen is true', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
    });
  });

  describe('Open/Close Behavior', () => {
    it('opens sheet when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();

      await user.click(screen.getByText('Open Sheet'));

      await waitFor(() => {
        expect(screen.getByText('Sheet Content')).toBeInTheDocument();
      });
    });

    it('closes sheet when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Sheet Content')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));

      await waitFor(() => {
        expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
      });
    });

    it('closes sheet when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Sheet Content')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();
      });
    });

    it('calls onOpenChange when sheet state changes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      await user.click(screen.getByText('Open Sheet'));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('supports controlled open state', async () => {
      const { rerender } = render(
        <Sheet open={false}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.queryByText('Sheet Content')).not.toBeInTheDocument();

      rerender(
        <Sheet open={true}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Sheet Content')).toBeInTheDocument();
    });
  });

  describe('SheetClose Component', () => {
    it('closes sheet when SheetClose is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Content</SheetTitle>
            <SheetClose data-testid="custom-close">Close Me</SheetClose>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByTestId('custom-close'));

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });
});

describe('SheetContent Component', () => {
  describe('Side Variants', () => {
    it('renders with default right side', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent data-testid="content">
            <SheetTitle>Right Side Sheet</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('right-0');
    });

    it('renders with left side', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left" data-testid="content">
            <SheetTitle>Left Side Sheet</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('left-0');
    });

    it('renders with top side', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top" data-testid="content">
            <SheetTitle>Top Side Sheet</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('top-0');
    });

    it('renders with bottom side', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom" data-testid="content">
            <SheetTitle>Bottom Side Sheet</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('bottom-0');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent className="custom-sheet" data-testid="content">
            <SheetTitle>Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-sheet');
      expect(content).toHaveClass('fixed', 'z-50', 'gap-4', 'bg-background', 'p-6', 'shadow-lg');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetContent.displayName).toBe('DialogContent');
    });
  });

  describe('Close button', () => {
    it('renders close button with screen reader text', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('close button has sr-only text', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton.querySelector('.sr-only')).toHaveTextContent('Close');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to content element', () => {
      const ref = vi.fn();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent ref={ref}>
            <SheetTitle>Content</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('SheetHeader Component', () => {
  describe('Rendering', () => {
    it('renders header element', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader data-testid="header">
              <SheetTitle>Header Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      const header = screen.getByTestId('header');
      expect(header.tagName).toBe('DIV');
    });

    it('applies default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader data-testid="header">
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-2', 'text-center', 'sm:text-left');
    });

    it('renders children correctly', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>My Title</SheetTitle>
              <SheetDescription>My Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('My Title')).toBeInTheDocument();
      expect(screen.getByText('My Description')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader className="custom-header" data-testid="header">
              <SheetTitle>Title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex', 'flex-col');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetHeader.displayName).toBe('SheetHeader');
    });
  });
});

describe('SheetFooter Component', () => {
  describe('Rendering', () => {
    it('renders footer element', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetFooter data-testid="footer">
              <button>Submit</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      const footer = screen.getByTestId('footer');
      expect(footer.tagName).toBe('DIV');
    });

    it('applies default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetFooter data-testid="footer">
              <button>Submit</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass(
        'flex',
        'flex-col-reverse',
        'sm:flex-row',
        'sm:justify-end',
        'sm:space-x-2',
      );
    });

    it('renders children correctly', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetFooter>
              <button>Cancel</button>
              <button>Save</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetFooter className="custom-footer" data-testid="footer">
              <button>Submit</button>
            </SheetFooter>
          </SheetContent>
        </Sheet>,
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex', 'flex-col-reverse');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetFooter.displayName).toBe('SheetFooter');
    });
  });
});

describe('SheetTitle Component', () => {
  describe('Rendering', () => {
    it('renders title element', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle data-testid="title">My Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByTestId('title')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle data-testid="title">My Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-foreground');
    });

    it('renders children correctly', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title Text</SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('Sheet Title Text')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle className="custom-title" data-testid="title">
              Title
            </SheetTitle>
          </SheetContent>
        </Sheet>,
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetTitle.displayName).toBe('DialogTitle');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to title element', () => {
      const ref = vi.fn();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle ref={ref}>Title</SheetTitle>
          </SheetContent>
        </Sheet>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('SheetDescription Component', () => {
  describe('Rendering', () => {
    it('renders description element', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription data-testid="description">My Description</SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByTestId('description')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription data-testid="description">Description</SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('renders children correctly', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>This is the sheet description text</SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      expect(screen.getByText('This is the sheet description text')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription className="custom-description" data-testid="description">
              Description
            </SheetDescription>
          </SheetContent>
        </Sheet>,
      );

      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-description');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetDescription.displayName).toBe('DialogDescription');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to description element', () => {
      const ref = vi.fn();
      render(
        <Sheet defaultOpen>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription ref={ref}>Description</SheetDescription>
          </SheetContent>
        </Sheet>,
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('SheetOverlay Component', () => {
  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(SheetOverlay.displayName).toBe('DialogOverlay');
    });
  });
});

describe('Complete Sheet Structure', () => {
  it('renders a complete sheet with all components', () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open Complete Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Complete Sheet Title</SheetTitle>
            <SheetDescription>Complete sheet description here</SheetDescription>
          </SheetHeader>
          <div>Sheet body content</div>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
            <button>Submit</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText('Complete Sheet Title')).toBeInTheDocument();
    expect(screen.getByText('Complete sheet description here')).toBeInTheDocument();
    expect(screen.getByText('Sheet body content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('supports multiple interactive elements in content', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Interactive Sheet</SheetTitle>
          <button onClick={handleClick}>Action Button</button>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByText('Action Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('maintains focus trap within sheet', async () => {
    const user = userEvent.setup();

    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Focus Test</SheetTitle>
          <input data-testid="input-1" />
          <input data-testid="input-2" />
        </SheetContent>
      </Sheet>,
    );

    const input1 = screen.getByTestId('input-1');
    const input2 = screen.getByTestId('input-2');

    await user.click(input1);
    expect(input1).toHaveFocus();

    await user.tab();
    expect(input2).toHaveFocus();
  });
});

describe('Props Forwarding', () => {
  it('forwards data attributes to SheetContent', () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent data-testid="content" data-custom="value">
          <SheetTitle>Content</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId('content')).toHaveAttribute('data-custom', 'value');
  });

  it('forwards aria attributes to SheetTrigger', () => {
    render(
      <Sheet>
        <SheetTrigger aria-label="Open menu" data-testid="trigger">
          Open
        </SheetTrigger>
      </Sheet>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-label', 'Open menu');
  });

  it('forwards id attribute to SheetTitle', () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle id="sheet-title-1" data-testid="title">
            Title
          </SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByTestId('title')).toHaveAttribute('id', 'sheet-title-1');
  });

  it('forwards onClick to SheetTrigger', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger onClick={handleClick} data-testid="trigger">
          Open Sheet
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Content</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByTestId('trigger'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Accessibility', () => {
  it('has correct dialog role', () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Accessible Sheet</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('close button is keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Content</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();
    expect(closeButton).toHaveFocus();

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('trigger button expands dialog', () => {
    render(
      <Sheet>
        <SheetTrigger data-testid="trigger">Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Content</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('trigger has correct aria-expanded when open', () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger data-testid="trigger">Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Content</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
