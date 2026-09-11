import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../services/api.client';

export function LegacyBundleMigrator({ onMigrationComplete }: { onMigrationComplete: () => void }) {
  const [legacyBundles, setLegacyBundles] = useState<any[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const TARGET_IDS = ['custom_1789137476792', 'custom_1789138569742'];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('interview_ai_custom_bundles');
      if (stored) {
        const parsed = JSON.parse(stored);
        const targets = parsed.filter((b: any) => TARGET_IDS.includes(b.bundleId || b._id));
        setLegacyBundles(targets);
      }
    } catch (e) {
      console.error('Failed to read localStorage', e);
    }
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResult(null);
    try {
      let successCount = 0;
      for (const bundle of legacyBundles) {
        if (!TARGET_IDS.includes(bundle.bundleId || bundle._id)) {
          throw new Error(`Unauthorized bundle ID: ${bundle.bundleId}`);
        }
        
        // POST to the backend
        await apiClient.post('/admin/custom-bundle-prices', bundle);
        successCount++;
      }
      setResult(`Successfully migrated ${successCount} legacy bundles.`);
      onMigrationComplete();
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  if (legacyBundles.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl mb-8">
      <h3 className="text-amber-800 font-bold text-lg mb-2">Legacy Bundle Migration Available</h3>
      <p className="text-amber-700 text-sm mb-4">
        We detected {legacyBundles.length} old custom bundles in your browser that need to be migrated to the backend database.
      </p>
      
      <div className="space-y-4 mb-6">
        {legacyBundles.map((b, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-amber-100 text-sm text-gray-800 grid grid-cols-1 md:grid-cols-2 gap-2">
            <h4 className="font-bold text-gray-900 md:col-span-2 text-base mb-2">{b.name || 'Unknown Name'}</h4>
            <div><span className="font-semibold text-gray-600">bundleId:</span> {b.bundleId || b._id}</div>
            <div><span className="font-semibold text-gray-600">name:</span> {b.name}</div>
            <div><span className="font-semibold text-gray-600">type:</span> {b.type}</div>
            <div><span className="font-semibold text-gray-600">price:</span> {b.price}</div>
            <div><span className="font-semibold text-gray-600">description:</span> {b.description || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">features:</span> {b.features ? JSON.stringify(b.features) : 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">modules:</span> {b.modules ? JSON.stringify(b.modules) : 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">category:</span> {b.category || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">originalPrice:</span> {b.originalPrice || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">iconType:</span> {b.iconType || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">visibility:</span> {b.visibility || 'N/A'}</div>
            <div><span className="font-semibold text-gray-600">logo:</span> {b.logo || 'N/A'}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <Button onClick={handleMigrate} disabled={isMigrating} className="bg-amber-600 hover:bg-amber-700 text-white">
          {isMigrating ? 'Migrating...' : 'Restore Legacy Bundles'}
        </Button>
        {result && <span className="text-sm font-medium text-amber-900">{result}</span>}
      </div>
    </div>
  );
}
