import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Component', () => {
  describe('Rendering', () => {
    it('renders table without crashing', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    it('renders table element', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('wraps table in overflow container', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const table = screen.getByTestId('table');
      expect(table.parentElement).toHaveClass('relative', 'w-full', 'overflow-auto');
    });

    it('applies default table classes', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const table = screen.getByTestId('table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default table classes', () => {
      render(
        <Table className="custom-table" data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      const table = screen.getByTestId('table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm', 'custom-table');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(Table.displayName).toBe('Table');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to table element', () => {
      const ref = vi.fn();
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableElement);
    });
  });
});

describe('TableHeader Component', () => {
  describe('Rendering', () => {
    it('renders thead element', () => {
      render(
        <table>
          <TableHeader data-testid="thead">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>,
      );
      const thead = screen.getByTestId('thead');
      expect(thead.tagName).toBe('THEAD');
    });

    it('applies default classes', () => {
      render(
        <table>
          <TableHeader data-testid="thead">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>,
      );
      const thead = screen.getByTestId('thead');
      expect(thead).toHaveClass('[&_tr]:border-b');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <TableHeader className="custom-header" data-testid="thead">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>,
      );
      const thead = screen.getByTestId('thead');
      expect(thead).toHaveClass('[&_tr]:border-b', 'custom-header');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableHeader.displayName).toBe('TableHeader');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to thead element', () => {
      const ref = vi.fn();
      render(
        <table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableSectionElement);
    });
  });
});

describe('TableBody Component', () => {
  describe('Rendering', () => {
    it('renders tbody element', () => {
      render(
        <table>
          <TableBody data-testid="tbody">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>,
      );
      const tbody = screen.getByTestId('tbody');
      expect(tbody.tagName).toBe('TBODY');
    });

    it('applies default classes', () => {
      render(
        <table>
          <TableBody data-testid="tbody">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>,
      );
      const tbody = screen.getByTestId('tbody');
      expect(tbody).toHaveClass('[&_tr:last-child]:border-0');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <TableBody className="custom-body" data-testid="tbody">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>,
      );
      const tbody = screen.getByTestId('tbody');
      expect(tbody).toHaveClass('[&_tr:last-child]:border-0', 'custom-body');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableBody.displayName).toBe('TableBody');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to tbody element', () => {
      const ref = vi.fn();
      render(
        <table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableSectionElement);
    });
  });
});

describe('TableFooter Component', () => {
  describe('Rendering', () => {
    it('renders tfoot element', () => {
      render(
        <table>
          <TableFooter data-testid="tfoot">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>,
      );
      const tfoot = screen.getByTestId('tfoot');
      expect(tfoot.tagName).toBe('TFOOT');
    });

    it('applies default classes', () => {
      render(
        <table>
          <TableFooter data-testid="tfoot">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>,
      );
      const tfoot = screen.getByTestId('tfoot');
      expect(tfoot).toHaveClass('border-t', 'bg-muted/50', 'font-medium');
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <TableFooter className="custom-footer" data-testid="tfoot">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>,
      );
      const tfoot = screen.getByTestId('tfoot');
      expect(tfoot).toHaveClass('border-t', 'bg-muted/50', 'font-medium', 'custom-footer');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableFooter.displayName).toBe('TableFooter');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to tfoot element', () => {
      const ref = vi.fn();
      render(
        <table>
          <TableFooter ref={ref}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableSectionElement);
    });
  });
});

describe('TableRow Component', () => {
  describe('Rendering', () => {
    it('renders tr element', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );
      const row = screen.getByTestId('row');
      expect(row.tagName).toBe('TR');
    });

    it('applies default classes', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );
      const row = screen.getByTestId('row');
      expect(row).toHaveClass('border-b', 'transition-colors');
    });

    it('renders children correctly', () => {
      render(
        <table>
          <tbody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <tbody>
            <TableRow className="custom-row" data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );
      const row = screen.getByTestId('row');
      expect(row).toHaveClass('border-b', 'transition-colors', 'custom-row');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableRow.displayName).toBe('TableRow');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to tr element', () => {
      const ref = vi.fn();
      render(
        <table>
          <tbody>
            <TableRow ref={ref}>
              <TableCell>Cell</TableCell>
            </TableRow>
          </tbody>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableRowElement);
    });
  });
});

describe('TableHead Component', () => {
  describe('Rendering', () => {
    it('renders th element', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="th">Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = screen.getByTestId('th');
      expect(th.tagName).toBe('TH');
    });

    it('applies default classes', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="th">Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = screen.getByTestId('th');
      expect(th).toHaveClass(
        'h-12',
        'px-4',
        'text-left',
        'align-middle',
        'font-medium',
        'text-muted-foreground',
      );
    });

    it('renders children correctly', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead>Column Name</TableHead>
            </tr>
          </thead>
        </table>,
      );
      expect(screen.getByText('Column Name')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead className="custom-head" data-testid="th">
                Header
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = screen.getByTestId('th');
      expect(th).toHaveClass('h-12', 'px-4', 'custom-head');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableHead.displayName).toBe('TableHead');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to th element', () => {
      const ref = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <TableHead ref={ref}>Header</TableHead>
            </tr>
          </thead>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableCellElement);
    });
  });

  describe('th attributes', () => {
    it('supports scope attribute', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead scope="col" data-testid="th">
                Header
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = screen.getByTestId('th');
      expect(th).toHaveAttribute('scope', 'col');
    });

    it('supports colSpan attribute', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead colSpan={2} data-testid="th">
                Header
              </TableHead>
            </tr>
          </thead>
        </table>,
      );
      const th = screen.getByTestId('th');
      expect(th).toHaveAttribute('colspan', '2');
    });
  });
});

describe('TableCell Component', () => {
  describe('Rendering', () => {
    it('renders td element', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="td">Cell</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = screen.getByTestId('td');
      expect(td.tagName).toBe('TD');
    });

    it('applies default classes', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="td">Cell</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = screen.getByTestId('td');
      expect(td).toHaveClass('p-4', 'align-middle');
    });

    it('renders children correctly', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      expect(screen.getByText('Cell Content')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell" data-testid="td">
                Cell
              </TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = screen.getByTestId('td');
      expect(td).toHaveClass('p-4', 'align-middle', 'custom-cell');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableCell.displayName).toBe('TableCell');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to td element', () => {
      const ref = vi.fn();
      render(
        <table>
          <tbody>
            <tr>
              <TableCell ref={ref}>Cell</TableCell>
            </tr>
          </tbody>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableCellElement);
    });
  });

  describe('td attributes', () => {
    it('supports colSpan attribute', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell colSpan={3} data-testid="td">
                Cell
              </TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = screen.getByTestId('td');
      expect(td).toHaveAttribute('colspan', '3');
    });

    it('supports rowSpan attribute', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell rowSpan={2} data-testid="td">
                Cell
              </TableCell>
            </tr>
          </tbody>
        </table>,
      );
      const td = screen.getByTestId('td');
      expect(td).toHaveAttribute('rowspan', '2');
    });
  });
});

describe('TableCaption Component', () => {
  describe('Rendering', () => {
    it('renders caption element', () => {
      render(
        <table>
          <TableCaption data-testid="caption">Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>,
      );
      const caption = screen.getByTestId('caption');
      expect(caption.tagName).toBe('CAPTION');
    });

    it('applies default classes', () => {
      render(
        <table>
          <TableCaption data-testid="caption">Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>,
      );
      const caption = screen.getByTestId('caption');
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground');
    });

    it('renders children correctly', () => {
      render(
        <table>
          <TableCaption>A list of items</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>,
      );
      expect(screen.getByText('A list of items')).toBeInTheDocument();
    });
  });

  describe('className merging', () => {
    it('merges custom className with default classes', () => {
      render(
        <table>
          <TableCaption className="custom-caption" data-testid="caption">
            Caption
          </TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>,
      );
      const caption = screen.getByTestId('caption');
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground', 'custom-caption');
    });
  });

  describe('displayName', () => {
    it('has correct displayName', () => {
      expect(TableCaption.displayName).toBe('TableCaption');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to caption element', () => {
      const ref = vi.fn();
      render(
        <table>
          <TableCaption ref={ref}>Caption</TableCaption>
          <tbody>
            <tr>
              <td>Cell</td>
            </tr>
          </tbody>
        </table>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableCaptionElement);
    });
  });
});

describe('Complete Table Structure', () => {
  it('renders a complete table with all components', () => {
    render(
      <Table data-testid="complete-table">
        <TableCaption>A complete table example</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>Inactive</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total: 2 users</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByTestId('complete-table')).toBeInTheDocument();
    expect(screen.getByText('A complete table example')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Total: 2 users')).toBeInTheDocument();
  });

  it('renders multiple rows correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Row 3</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3')).toBeInTheDocument();
  });

  it('renders multiple columns correctly', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Col 1</TableCell>
            <TableCell>Col 2</TableCell>
            <TableCell>Col 3</TableCell>
            <TableCell>Col 4</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Col 1')).toBeInTheDocument();
    expect(screen.getByText('Col 2')).toBeInTheDocument();
    expect(screen.getByText('Col 3')).toBeInTheDocument();
    expect(screen.getByText('Col 4')).toBeInTheDocument();
  });
});

describe('Props Forwarding', () => {
  it('forwards data attributes to Table', () => {
    render(
      <Table data-testid="table" data-custom="value">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId('table')).toHaveAttribute('data-custom', 'value');
  });

  it('forwards aria attributes to TableRow', () => {
    render(
      <table>
        <tbody>
          <TableRow aria-selected="true" data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row')).toHaveAttribute('aria-selected', 'true');
  });

  it('forwards onClick to TableRow', () => {
    const handleClick = vi.fn();
    render(
      <table>
        <tbody>
          <TableRow onClick={handleClick} data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </tbody>
      </table>,
    );
    screen.getByTestId('row').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards id attribute to TableCell', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell id="cell-1" data-testid="td">
              Cell
            </TableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('td')).toHaveAttribute('id', 'cell-1');
  });
});
