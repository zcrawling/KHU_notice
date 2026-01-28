import { Check, CheckSquare, Square } from 'lucide-react';
import type { Site } from '../App';

interface SiteSelectorProps {
  sites: Site[];
  selectedSiteIds: string[];
  onSiteToggle: (siteId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SiteSelector({
  sites,
  selectedSiteIds,
  onSiteToggle,
  onSelectAll,
  onDeselectAll,
}: SiteSelectorProps) {
  const groupedSites = sites.reduce((acc, site) => {
    if (!acc[site.category]) {
      acc[site.category] = [];
    }
    acc[site.category].push(site);
    return acc;
  }, {} as Record<string, Site[]>);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">사이트 선택</h2>
        <span className="text-sm text-gray-500">
          {selectedSiteIds.length}/{sites.length}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={onSelectAll}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          전체선택
        </button>
        <button
          onClick={onDeselectAll}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          전체해제
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSites).map(([category, sitesInCategory]) => (
          <div key={category}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {category}
            </div>
            <div className="space-y-1">
              {sitesInCategory.map(site => {
                const isSelected = selectedSiteIds.includes(site.id);
                return (
                  <button
                    key={site.id}
                    onClick={() => onSiteToggle(site.id)}
                    className="w-full flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {site.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
