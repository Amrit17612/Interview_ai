
import { Dialog, type DialogProps } from './Dialog';

// Modal is an alias for Dialog in this design system, often used for critical focus flows.
export function Modal(props: DialogProps) {
  return <Dialog {...props} />;
}
