import type { ReactNode } from 'react';

export interface DataTableColumn {
  readonly label: string;
  /** Monospace cells, for names, types and values. */
  readonly code?: boolean;
  /** `--text-muted` cells, for descriptions. */
  readonly muted?: boolean;
}

export interface DataTableRow {
  /** Unique within the table. */
  readonly key: string;
  /** One cell per column. The first heads the row. */
  readonly cells: readonly ReactNode[];
}

export interface DataTableProps {
  readonly columns: readonly DataTableColumn[];
  readonly rows: readonly DataTableRow[];
}
