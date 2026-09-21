import { ValueTransformer } from 'typeorm';

// pg returns NUMERIC/DECIMAL columns as strings to avoid silent precision
// loss; every money column needs this to round-trip as a JS number.
export const numericColumnTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
