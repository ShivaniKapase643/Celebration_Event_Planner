import * as React from 'react';
import { inputClassName } from './input';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select className={[inputClassName, className].join(' ')} {...props}>
      {children}
    </select>
  );
}
