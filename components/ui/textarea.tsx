import * as React from 'react';
import { inputClassName } from './input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={[inputClassName, 'min-h-[100px] resize-y', className].join(' ')} {...props} />;
}
