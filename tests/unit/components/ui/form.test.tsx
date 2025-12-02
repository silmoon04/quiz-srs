import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FieldErrors } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Mock ResizeObserver for Radix UI compatibility with JSDOM
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterAll(() => {
  vi.restoreAllMocks();
});

type TestFormValues = {
  username: string;
  email: string;
};

// Custom validation function
function validateForm(data: TestFormValues): FieldErrors<TestFormValues> {
  const errors: FieldErrors<TestFormValues> = {};

  if (!data.username || data.username.length < 3) {
    errors.username = {
      type: 'minLength',
      message: 'Username must be at least 3 characters',
    };
  }

  if (!data.email || !data.email.includes('@')) {
    errors.email = {
      type: 'pattern',
      message: 'Invalid email address',
    };
  }

  return errors;
}

// Helper component for testing form with react-hook-form
function TestForm({
  onSubmit = vi.fn(),
  defaultValues = { username: '', email: '' },
}: {
  onSubmit?: (data: TestFormValues) => void;
  defaultValues?: TestFormValues;
}) {
  const form = useForm<TestFormValues>({
    defaultValues,
    mode: 'onBlur',
  });

  const handleSubmit = (data: TestFormValues) => {
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        form.setError(field as keyof TestFormValues, error);
      });
      return;
    }
    onSubmit(data);
  };

  const handleBlur = (fieldName: keyof TestFormValues) => {
    const value = form.getValues(fieldName);
    const errors = validateForm({ ...form.getValues(), [fieldName]: value });
    if (errors[fieldName]) {
      form.setError(fieldName, errors[fieldName]);
    } else {
      form.clearErrors(fieldName);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem data-testid="username-item">
              <FormLabel data-testid="username-label">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter username"
                  data-testid="username-input"
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    handleBlur('username');
                  }}
                />
              </FormControl>
              <FormDescription data-testid="username-description">
                Your unique username
              </FormDescription>
              <FormMessage data-testid="username-message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem data-testid="email-item">
              <FormLabel data-testid="email-label">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email"
                  data-testid="email-input"
                  {...field}
                  onBlur={() => {
                    field.onBlur();
                    handleBlur('email');
                  }}
                />
              </FormControl>
              <FormDescription data-testid="email-description">Your email address</FormDescription>
              <FormMessage data-testid="email-message" />
            </FormItem>
          )}
        />
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    </Form>
  );
}

// Simple form without validation for basic rendering tests
function SimpleTestForm() {
  const form = useForm({
    defaultValues: { name: '' },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Enter your name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe('Form Component', () => {
  describe('Rendering', () => {
    it('renders Form component without crashing', () => {
      render(<SimpleTestForm />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('renders FormLabel with correct text', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-label')).toHaveTextContent('Username');
      expect(screen.getByTestId('email-label')).toHaveTextContent('Email');
    });

    it('renders FormControl with input element', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    it('renders FormDescription with correct text', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-description')).toHaveTextContent('Your unique username');
      expect(screen.getByTestId('email-description')).toHaveTextContent('Your email address');
    });

    it('renders FormItem as container', () => {
      render(<TestForm />);
      const usernameItem = screen.getByTestId('username-item');
      expect(usernameItem).toBeInTheDocument();
      expect(usernameItem.tagName).toBe('DIV');
    });

    it('renders multiple FormFields', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-item')).toBeInTheDocument();
      expect(screen.getByTestId('email-item')).toBeInTheDocument();
    });
  });

  describe('FormItem Component', () => {
    it('applies default className with space-y-2', () => {
      render(<TestForm />);
      const item = screen.getByTestId('username-item');
      expect(item).toHaveClass('space-y-2');
    });

    it('merges custom className with default', () => {
      function CustomClassForm() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem className="custom-class" data-testid="item">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<CustomClassForm />);
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('space-y-2');
      expect(item).toHaveClass('custom-class');
    });
  });

  describe('FormLabel Component', () => {
    it('renders as a label element', () => {
      render(<TestForm />);
      const label = screen.getByTestId('username-label');
      expect(label.tagName).toBe('LABEL');
    });

    it('has htmlFor attribute linked to form control', () => {
      render(<TestForm />);
      const label = screen.getByTestId('username-label');
      const input = screen.getByTestId('username-input');
      expect(label).toHaveAttribute('for', input.id);
    });

    it('applies custom className', () => {
      function LabelClassForm() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="custom-label" data-testid="label">
                      Test
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<LabelClassForm />);
      expect(screen.getByTestId('label')).toHaveClass('custom-label');
    });
  });

  describe('FormControl Component', () => {
    it('passes id to child input', () => {
      render(<TestForm />);
      const input = screen.getByTestId('username-input');
      expect(input).toHaveAttribute('id');
    });

    it('sets aria-describedby for description', () => {
      render(<TestForm />);
      const input = screen.getByTestId('username-input');
      const description = screen.getByTestId('username-description');
      expect(input.getAttribute('aria-describedby')).toContain(description.id);
    });

    it('sets aria-invalid to false when no error', () => {
      render(<TestForm />);
      const input = screen.getByTestId('username-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('FormDescription Component', () => {
    it('renders as a paragraph element', () => {
      render(<TestForm />);
      const description = screen.getByTestId('username-description');
      expect(description.tagName).toBe('P');
    });

    it('has correct id for aria-describedby', () => {
      render(<TestForm />);
      const input = screen.getByTestId('username-input');
      const description = screen.getByTestId('username-description');
      expect(input.getAttribute('aria-describedby')).toContain(description.id);
    });

    it('applies muted foreground text styling', () => {
      render(<TestForm />);
      const description = screen.getByTestId('username-description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('applies custom className', () => {
      function DescriptionClassForm() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="custom-description" data-testid="description">
                      Test description
                    </FormDescription>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<DescriptionClassForm />);
      expect(screen.getByTestId('description')).toHaveClass('custom-description');
    });
  });

  describe('FormMessage Component', () => {
    it('does not render when there is no error and no children', () => {
      render(<TestForm />);
      // FormMessage returns null when there's no error and no children
      const messageContainer = screen.queryByTestId('username-message');
      expect(messageContainer).not.toBeInTheDocument();
    });

    it('renders children when provided without error', () => {
      function MessageChildrenForm() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage data-testid="message">Custom message</FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<MessageChildrenForm />);
      expect(screen.getByTestId('message')).toHaveTextContent('Custom message');
    });

    it('applies destructive text styling', () => {
      function ErrorForm() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage data-testid="message">Error message</FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<ErrorForm />);
      const message = screen.getByTestId('message');
      expect(message).toHaveClass('text-sm');
      expect(message).toHaveClass('font-medium');
      expect(message).toHaveClass('text-destructive');
    });
  });

  describe('Form Validation Display', () => {
    it('displays validation error on blur with invalid input', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');
      await user.type(input, 'ab');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });
    });

    it('displays email validation error', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('clears error when input becomes valid', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');

      // Type invalid input
      await user.type(input, 'ab');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });

      // Fix the input
      await user.click(input);
      await user.type(input, 'c');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.queryByText('Username must be at least 3 characters'),
        ).not.toBeInTheDocument();
      });
    });

    it('displays multiple validation errors', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      // Submit without filling fields
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('sets aria-invalid to true on input with error', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('username-input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('adds error message id to aria-describedby when error exists', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        const describedBy = input.getAttribute('aria-describedby');
        expect(describedBy).toContain('form-item-message');
      });
    });

    it('applies destructive style to label when error exists', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('username-label')).toHaveClass('text-destructive');
      });
    });

    it('removes error styling when error is fixed', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      // Trigger error
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('username-label')).toHaveClass('text-destructive');
      });

      // Fix the error
      const input = screen.getByTestId('username-input');
      await user.type(input, 'validname');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId('username-label')).not.toHaveClass('text-destructive');
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      render(<TestForm onSubmit={handleSubmit} />);

      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
        });
      });
    });

    it('does not call onSubmit when validation fails', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      render(<TestForm onSubmit={handleSubmit} />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });

    it('prevents submission with partial valid data', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      render(<TestForm onSubmit={handleSubmit} />);

      await user.type(screen.getByTestId('username-input'), 'validuser');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });
  });

  describe('Default Values', () => {
    it('populates fields with default values', () => {
      render(
        <TestForm defaultValues={{ username: 'defaultuser', email: 'default@example.com' }} />,
      );

      expect(screen.getByTestId('username-input')).toHaveValue('defaultuser');
      expect(screen.getByTestId('email-input')).toHaveValue('default@example.com');
    });

    it('validates default values on submit', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();
      render(
        <TestForm onSubmit={handleSubmit} defaultValues={{ username: 'ab', email: 'invalid' }} />,
      );

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('links label to input via htmlFor', () => {
      render(<TestForm />);
      const label = screen.getByTestId('username-label');
      const input = screen.getByTestId('username-input');
      expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    });

    it('provides aria-describedby for screen readers', () => {
      render(<TestForm />);
      const input = screen.getByTestId('username-input');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('indicates invalid state via aria-invalid', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');
      expect(input).toHaveAttribute('aria-invalid', 'false');

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('error message has id for aria-describedby reference', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        const message = screen.getByText('Username must be at least 3 characters');
        expect(message).toHaveAttribute('id');
        const input = screen.getByTestId('username-input');
        expect(input.getAttribute('aria-describedby')).toContain(message.id);
      });
    });
  });

  describe('Component Exports', () => {
    it('exports Form component', () => {
      expect(Form).toBeDefined();
    });

    it('exports FormField component', () => {
      expect(FormField).toBeDefined();
    });

    it('exports FormItem component', () => {
      expect(FormItem).toBeDefined();
    });

    it('exports FormLabel component', () => {
      expect(FormLabel).toBeDefined();
    });

    it('exports FormControl component', () => {
      expect(FormControl).toBeDefined();
    });

    it('exports FormDescription component', () => {
      expect(FormDescription).toBeDefined();
    });

    it('exports FormMessage component', () => {
      expect(FormMessage).toBeDefined();
    });

    it('exports useFormField hook', () => {
      expect(useFormField).toBeDefined();
      expect(typeof useFormField).toBe('function');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards data attributes to FormItem', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-item')).toHaveAttribute('data-testid', 'username-item');
    });

    it('forwards data attributes to FormLabel', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-label')).toHaveAttribute('data-testid', 'username-label');
    });

    it('forwards data attributes to FormDescription', () => {
      render(<TestForm />);
      expect(screen.getByTestId('username-description')).toHaveAttribute(
        'data-testid',
        'username-description',
      );
    });

    it('forwards data attributes to FormMessage', () => {
      function MessageWithDataAttr() {
        const form = useForm({ defaultValues: { test: '' } });
        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="test"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage data-testid="message" data-custom="value">
                      Test
                    </FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      }
      render(<MessageWithDataAttr />);
      expect(screen.getByTestId('message')).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Input Interactions', () => {
    it('updates input value on type', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');
      await user.type(input, 'newvalue');

      expect(input).toHaveValue('newvalue');
    });

    it('handles clearing input', async () => {
      const user = userEvent.setup();
      render(<TestForm defaultValues={{ username: 'initial', email: 'test@test.com' }} />);

      const input = screen.getByTestId('username-input');
      await user.clear(input);

      expect(input).toHaveValue('');
    });

    it('maintains focus after typing', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const input = screen.getByTestId('username-input');
      await user.click(input);
      await user.type(input, 'test');

      expect(input).toHaveFocus();
    });

    it('allows tab navigation between fields', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const usernameInput = screen.getByTestId('username-input');
      const emailInput = screen.getByTestId('email-input');

      await user.click(usernameInput);
      expect(usernameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();
    });
  });
});
