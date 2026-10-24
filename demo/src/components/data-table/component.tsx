import type { DataTableColumn, DataTableProps } from './types';
import './style.css';

const cellClass = ({ code, muted }: DataTableColumn): string | undefined =>
  [code && 'data-table-code', muted && 'data-table-muted']
    .filter(Boolean)
    .join(' ') || undefined;

/**
 * A table whose first cell heads each row, in a frame that scrolls sideways
 * on phones (README, "Props table" and "Articles").
 */
export const DataTable = ({ columns, rows }: DataTableProps) => (
  <div className="data-table-frame">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.label} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {columns.map((column, index) => {
              const className = cellClass(column);
              const cell = row.cells[index];
              return index === 0 ? (
                <th key={column.label} scope="row" className={className}>
                  {cell}
                </th>
              ) : (
                <td key={column.label} className={className}>
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
