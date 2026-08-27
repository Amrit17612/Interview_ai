
import { Spinner } from './Spinner';

export function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-gray-500">
      <Spinner className="h-8 w-8 text-brand-600" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
