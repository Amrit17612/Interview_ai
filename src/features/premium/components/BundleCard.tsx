import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Check, Lock, Unlock, Building, Code2, Play } from 'lucide-react';
import type { BundleMetadata } from '../../../types/bundle.types';
import { useAccess } from '../hooks/useAccess';
import { cn } from '../../../utils/cn';

interface BundleCardProps {
  bundle: BundleMetadata;
  onPreviewClick: (bundleId: string) => void;
  onPurchaseClick: (bundleId: string) => void;
  isProcessing?: boolean;
}

export function BundleCard({ bundle, onPreviewClick, onPurchaseClick, isProcessing = false }: BundleCardProps) {
  const { hasAccessToBundle } = useAccess();
  const hasAccess = hasAccessToBundle(bundle.id, bundle.type);

  const getIcon = () => {
    switch (bundle.type) {
      case 'company': return <Building className="h-6 w-6 text-brand-600" />;
      case 'domain': return <Code2 className="h-6 w-6 text-brand-600" />;
      default: return <Building className="h-6 w-6 text-brand-600" />;
    }
  };

  return (
    <Card className={cn(
      "flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-md",
      hasAccess ? "border-brand-200" : "border-gray-200"
    )}>
      {bundle.isPopular && !hasAccess && (
        <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg z-10">
          Popular
        </div>
      )}
      
      {hasAccess && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg z-10 flex items-center gap-1">
          <Unlock className="h-3 w-3" /> Purchased
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              {bundle.category}
            </div>
            <CardTitle className="text-lg leading-tight">{bundle.name}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {bundle.description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow pt-0 pb-4">
        <div className="mb-4">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">₹{bundle.price}</span>
            {bundle.originalPrice && (
              <span className="text-sm text-gray-400 line-through mb-1">₹{bundle.originalPrice}</span>
            )}
            <span className="text-xs text-gray-500 mb-1.5 ml-1">one-time</span>
          </div>
        </div>
        
        <ul className="space-y-2">
          {bundle.features.slice(0, 4).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
          {bundle.features.length > 4 && (
            <li className="text-xs text-gray-400 font-medium pl-6">
              + {bundle.features.length - 4} more features
            </li>
          )}
        </ul>
      </CardContent>
      
      <CardFooter className="pt-0 border-t border-gray-50 mt-auto p-4 flex gap-2">
        {hasAccess ? (
          <Button 
            className="w-full bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            onClick={() => onPreviewClick(bundle.id)}
          >
            <Play className="mr-2 h-4 w-4" /> Start Practicing
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="flex-1 bg-white"
              onClick={() => onPreviewClick(bundle.id)}
            >
              Preview
            </Button>
            <Button 
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => onPurchaseClick(bundle.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Securing...</>
              ) : (
                <><Lock className="mr-2 h-4 w-4" /> Unlock</>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
