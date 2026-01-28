import { useState } from 'react';
import { PostList } from './components/PostList';
import { SiteSelector } from './components/SiteSelector';
import { SearchAndFilter } from './components/SearchAndFilter';
import { SiteManagement } from './components/SiteManagement';
import { Settings } from 'lucide-react';

export interface Site {
  id: string;
  name: string;
  url: string;
  category: string;
}

export interface Post {
  id: string;
  title: string;
  siteId: string;
  siteName: string;
  date: string;
  url: string;
  isNew?: boolean;
}

const AVAILABLE_SITES: Site[] = [
  { id: 'general', name: '경희대학교 일반공지', url: 'https://www.khu.ac.kr/kor/notice', category: '학교' },
  { id: 'academic', name: '학사공지', url: 'https://www.khu.ac.kr/kor/notice/academic', category: '학사' },
  { id: 'scholarship', name: '장학공지', url: 'https://www.khu.ac.kr/kor/notice/scholarship', category: '장학' },
  { id: 'career', name: '취업/채용공지', url: 'https://www.khu.ac.kr/kor/notice/career', category: '취업' },
  { id: 'dorm', name: '생활관공지', url: 'https://dorm.khu.ac.kr', category: '생활' },
  { id: 'library', name: '중앙도서관공지', url: 'https://library.khu.ac.kr', category: '도서관' },
  { id: 'cs', name: '컴퓨터공학과', url: 'https://ce.khu.ac.kr', category: '학과' },
  { id: 'sw', name: '소프트웨어융합학과', url: 'https://sw.khu.ac.kr', category: '학과' },
];

// Mock data for demonstration
const MOCK_POSTS: Post[] = [
  { id: '1', title: '2025학년도 1학기 수강신청 일정 안내', siteId: 'academic', siteName: '학사공지', date: '2025-01-25', url: '#', isNew: true },
  { id: '2', title: '2025학년도 1학기 국가장학금 신청 안내', siteId: 'scholarship', siteName: '장학공지', date: '2025-01-25', url: '#', isNew: true },
  { id: '3', title: '캠퍼스 출입 시 학생증 지참 필수 안내', siteId: 'general', siteName: '경희대학교 일반공지', date: '2025-01-24', url: '#' },
  { id: '4', title: '중앙도서관 시험기간 연장운영 안내', siteId: 'library', siteName: '중앙도서관공지', date: '2025-01-24', url: '#' },
  { id: '5', title: '2025 상반기 채용박람회 개최 안내', siteId: 'career', siteName: '취업/채용공지', date: '2025-01-23', url: '#' },
  { id: '6', title: '생활관 입사신청 일정 공지', siteId: 'dorm', siteName: '생활관공지', date: '2025-01-23', url: '#' },
  { id: '7', title: '졸업논문 제출 일정 안내', siteId: 'academic', siteName: '학사공지', date: '2025-01-22', url: '#' },
  { id: '8', title: '2025-1학기 소프트웨어융합학과 전공설명회', siteId: 'sw', siteName: '소프트웨어융합학과', date: '2025-01-22', url: '#' },
  { id: '9', title: '컴퓨터공학과 캡스톤 디자인 발표회 안내', siteId: 'cs', siteName: '컴퓨터공학과', date: '2025-01-21', url: '#' },
  { id: '10', title: '2025학년도 복수전공/부전공 신청 안내', siteId: 'academic', siteName: '학사공지', date: '2025-01-21', url: '#' },
  { id: '11', title: '우수학생 장학금 신청 안내', siteId: 'scholarship', siteName: '장학공지', date: '2025-01-20', url: '#' },
  { id: '12', title: '도서관 좌석예약 시스템 점검 안내', siteId: 'library', siteName: '중앙도서관공지', date: '2025-01-20', url: '#' },
];

export default function App() {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>(
    AVAILABLE_SITES.map(site => site.id)
  );
  const [sites, setSites] = useState<Site[]>(AVAILABLE_SITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'site'>('date');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showSiteManagement, setShowSiteManagement] = useState(false);

  const handleSiteToggle = (siteId: string) => {
    setSelectedSiteIds(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSiteIds(sites.map(site => site.id));
  };

  const handleDeselectAll = () => {
    setSelectedSiteIds([]);
  };

  const handleAddSite = (site: Omit<Site, 'id'>) => {
    const newSite = { ...site, id: `custom-${Date.now()}` };
    setSites(prev => [...prev, newSite]);
  };

  const handleDeleteSite = (siteId: string) => {
    setSites(prev => prev.filter(site => site.id !== siteId));
    setSelectedSiteIds(prev => prev.filter(id => id !== siteId));
  };

  const handleUpdateSite = (siteId: string, updatedSite: Omit<Site, 'id'>) => {
    setSites(prev =>
      prev.map(site => (site.id === siteId ? { ...updatedSite, id: siteId } : site))
    );
  };

  // Filter and sort posts
  let filteredPosts = MOCK_POSTS.filter(post =>
    selectedSiteIds.includes(post.siteId)
  );

  // Apply search filter
  if (searchQuery) {
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply date range filter
  if (dateRange.start) {
    filteredPosts = filteredPosts.filter(post => post.date >= dateRange.start);
  }
  if (dateRange.end) {
    filteredPosts = filteredPosts.filter(post => post.date <= dateRange.end);
  }

  // Apply sorting
  filteredPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'date') {
      return b.date.localeCompare(a.date); // 최신순
    } else {
      // 사이트별 정렬 (사이트명으로 먼저, 같으면 날짜순)
      const siteCompare = a.siteName.localeCompare(b.siteName);
      return siteCompare !== 0 ? siteCompare : b.date.localeCompare(a.date);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900">경희대 공지사항 통합 조회</h1>
              <p className="text-sm text-gray-600 mt-1">여러 사이트의 공지사항을 한눈에 확인하세요</p>
            </div>
            <button
              onClick={() => setShowSiteManagement(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">사이트 관리</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <SiteSelector
              sites={sites}
              selectedSiteIds={selectedSiteIds}
              onSiteToggle={handleSiteToggle}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          </aside>

          <main className="lg:col-span-3 space-y-4">
            <SearchAndFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <PostList posts={filteredPosts} selectedCount={selectedSiteIds.length} />
          </main>
        </div>
      </div>

      {showSiteManagement && (
        <SiteManagement
          sites={sites}
          onClose={() => setShowSiteManagement(false)}
          onAddSite={handleAddSite}
          onDeleteSite={handleDeleteSite}
          onUpdateSite={handleUpdateSite}
        />
      )}
    </div>
  );
}