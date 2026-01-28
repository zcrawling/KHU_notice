import { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, XCircle, Globe } from 'lucide-react';
import type { Site } from '../App';

interface SiteManagementProps {
  sites: Site[];
  onClose: () => void;
  onAddSite: (site: Omit<Site, 'id'>) => void;
  onDeleteSite: (siteId: string) => void;
  onUpdateSite: (siteId: string, site: Omit<Site, 'id'>) => void;
}

export function SiteManagement({
  sites,
  onClose,
  onAddSite,
  onDeleteSite,
  onUpdateSite,
}: SiteManagementProps) {
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '',
  });

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.url && formData.category) {
      onAddSite(formData);
      setFormData({ name: '', url: '', category: '' });
      setShowAddForm(false);
    }
  };

  const handleSubmitEdit = (siteId: string) => {
    if (formData.name && formData.url && formData.category) {
      onUpdateSite(siteId, formData);
      setEditingSiteId(null);
      setFormData({ name: '', url: '', category: '' });
    }
  };

  const handleStartEdit = (site: Site) => {
    setEditingSiteId(site.id);
    setFormData({
      name: site.name,
      url: site.url,
      category: site.category,
    });
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingSiteId(null);
    setFormData({ name: '', url: '', category: '' });
  };

  const groupedSites = sites.reduce((acc, site) => {
    if (!acc[site.category]) {
      acc[site.category] = [];
    }
    acc[site.category].push(site);
    return acc;
  }, {} as Record<string, Site[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">크롤링 대상 사이트 관리</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Button */}
          {!showAddForm && !editingSiteId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">새 사이트 추가</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmitAdd} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">새 사이트 추가</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사이트 이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 전자공학과"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.khu.ac.kr"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 학과"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>추가</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', url: '', category: '' });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>취소</span>
                </button>
              </div>
            </form>
          )}

          {/* Sites List */}
          <div className="space-y-6">
            {Object.entries(groupedSites).map(([category, sitesInCategory]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {sitesInCategory.map((site) => (
                    <div key={site.id}>
                      {editingSiteId === site.id ? (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                사이트 이름
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL
                              </label>
                              <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                카테고리
                              </label>
                              <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleSubmitEdit(site.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>저장</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>취소</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900">{site.name}</h4>
                              <p className="text-sm text-gray-500 truncate">{site.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleStartEdit(site)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="수정"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`"${site.name}" 사이트를 삭제하시겠습니까?`)) {
                                  onDeleteSite(site.id);
                                }
                              }}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>총 {sites.length}개의 사이트</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
