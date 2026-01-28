// 초기 데이터
const INITIAL_SITES = [
    { id: 'general', name: '경희대학교 일반공지', url: 'https://www.khu.ac.kr/kor/notice', category: '학교' },
    { id: 'academic', name: '학사공지', url: 'https://www.khu.ac.kr/kor/notice/academic', category: '학사' },
    { id: 'scholarship', name: '장학공지', url: 'https://www.khu.ac.kr/kor/notice/scholarship', category: '장학' },
    { id: 'career', name: '취업/채용공지', url: 'https://www.khu.ac.kr/kor/notice/career', category: '취업' },
    { id: 'dorm', name: '생활관공지', url: 'https://dorm.khu.ac.kr', category: '생활' },
    { id: 'library', name: '중앙도서관공지', url: 'https://library.khu.ac.kr', category: '도서관' },
    { id: 'cs', name: '컴퓨터공학과', url: 'https://ce.khu.ac.kr', category: '학과' },
    { id: 'sw', name: '소프트웨어융합학과', url: 'https://sw.khu.ac.kr', category: '학과' },
];

const MOCK_POSTS = [
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

// 상태 관리
let state = {
    sites: [...INITIAL_SITES],
    selectedSiteIds: INITIAL_SITES.map(site => site.id),
    searchQuery: '',
    sortBy: 'date',
    dateRange: { start: '', end: '' },
    editingSiteId: null,
};

// DOM 요소
const elements = {
    siteSelectorList: document.getElementById('siteSelectorList'),
    postList: document.getElementById('postList'),
    siteCounter: document.getElementById('siteCounter'),
    postCounter: document.getElementById('postCounter'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    resetFilterSection: document.getElementById('resetFilterSection'),
    siteManagementModal: document.getElementById('siteManagementModal'),
    managementSiteList: document.getElementById('managementSiteList'),
    totalSitesCounter: document.getElementById('totalSitesCounter'),
    addSiteForm: document.getElementById('addSiteForm'),
};

// 사이트를 카테고리별로 그룹화
function groupSitesByCategory(sites) {
    return sites.reduce((acc, site) => {
        if (!acc[site.category]) {
            acc[site.category] = [];
        }
        acc[site.category].push(site);
        return acc;
    }, {});
}

// 사이트 선택기 렌더링
function renderSiteSelector() {
    const grouped = groupSitesByCategory(state.sites);
    let html = '';

    Object.entries(grouped).forEach(([category, sites]) => {
        html += `
            <div>
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    ${category}
                </div>
                <div class="space-y-1">
                    ${sites.map(site => {
                        const isSelected = state.selectedSiteIds.includes(site.id);
                        return `
                            <button class="site-toggle-btn w-full flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors text-left group" data-site-id="${site.id}">
                                <div class="mt-0.5 flex-shrink-0">
                                    ${isSelected ? `
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                        </svg>
                                    ` : `
                                        <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                    `}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}">
                                        ${site.name}
                                    </div>
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    elements.siteSelectorList.innerHTML = html;
    elements.siteCounter.textContent = `${state.selectedSiteIds.length}/${state.sites.length}`;

    // 이벤트 리스너 추가
    document.querySelectorAll('.site-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = e.currentTarget.dataset.siteId;
            toggleSite(siteId);
        });
    });
}

// 게시글 필터링 및 정렬
function getFilteredPosts() {
    let filtered = MOCK_POSTS.filter(post => state.selectedSiteIds.includes(post.siteId));

    // 검색 필터
    if (state.searchQuery) {
        filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }

    // 날짜 범위 필터
    if (state.dateRange.start) {
        filtered = filtered.filter(post => post.date >= state.dateRange.start);
    }
    if (state.dateRange.end) {
        filtered = filtered.filter(post => post.date <= state.dateRange.end);
    }

    // 정렬
    filtered.sort((a, b) => {
        if (state.sortBy === 'date') {
            return b.date.localeCompare(a.date);
        } else {
            const siteCompare = a.siteName.localeCompare(b.siteName);
            return siteCompare !== 0 ? siteCompare : b.date.localeCompare(a.date);
        }
    });

    return filtered;
}

// 게시글 목록 렌더링
function renderPostList() {
    const posts = getFilteredPosts();
    elements.postCounter.textContent = `총 ${posts.length}개`;

    if (state.selectedSiteIds.length === 0) {
        elements.postList.innerHTML = `
            <div class="p-12 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-600">조회할 사이트를 선택해주세요</p>
            </div>
        `;
        return;
    }

    if (posts.length === 0) {
        elements.postList.innerHTML = `
            <div class="p-12 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-600">선택한 사이트에 게시글이 없습니다</p>
            </div>
        `;
        return;
    }

    const html = posts.map(post => `
        <a href="${post.url}" class="block p-4 hover:bg-gray-50 transition-colors group">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            ${post.siteName}
                        </span>
                        ${post.isNew ? `
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                NEW
                            </span>
                        ` : ''}
                    </div>
                    <h3 class="text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        ${post.title}
                    </h3>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>${post.date}</span>
                        </div>
                    </div>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
            </div>
        </a>
    `).join('');

    elements.postList.innerHTML = html;
}

// 사이트 관리 목록 렌더링
function renderManagementSiteList() {
    const grouped = groupSitesByCategory(state.sites);
    let html = '';

    Object.entries(grouped).forEach(([category, sites]) => {
        html += `
            <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    ${category}
                </h3>
                <div class="space-y-2">
                    ${sites.map(site => {
                        if (state.editingSiteId === site.id) {
                            return `
                                <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div class="space-y-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">사이트 이름</label>
                                            <input type="text" id="editSiteName" value="${site.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                            <input type="url" id="editSiteUrl" value="${site.url}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                            <input type="text" id="editSiteCategory" value="${site.category}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                    </div>
                                    <div class="flex gap-2 mt-4">
                                        <button class="save-edit-btn flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" data-site-id="${site.id}">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span>저장</span>
                                        </button>
                                        <button class="cancel-edit-btn flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            <span>취소</span>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                        return `
                            <div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                <div class="flex items-start gap-3 flex-1 min-w-0">
                                    <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-medium text-gray-900">${site.name}</h4>
                                        <p class="text-sm text-gray-500 truncate">${site.url}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 ml-4">
                                    <button class="edit-site-btn p-2 hover:bg-gray-100 rounded-lg transition-colors" data-site-id="${site.id}" title="수정">
                                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button class="delete-site-btn p-2 hover:bg-red-50 rounded-lg transition-colors" data-site-id="${site.id}" data-site-name="${site.name}" title="삭제">
                                        <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    elements.managementSiteList.innerHTML = html;
    elements.totalSitesCounter.textContent = `총 ${state.sites.length}개의 사이트`;

    // 이벤트 리스너 추가
    document.querySelectorAll('.edit-site-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = e.currentTarget.dataset.siteId;
            startEditSite(siteId);
        });
    });

    document.querySelectorAll('.delete-site-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = e.currentTarget.dataset.siteId;
            const siteName = e.currentTarget.dataset.siteName;
            if (confirm(`"${siteName}" 사이트를 삭제하시겠습니까?`)) {
                deleteSite(siteId);
            }
        });
    });

    document.querySelectorAll('.save-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const siteId = e.currentTarget.dataset.siteId;
            saveEditSite(siteId);
        });
    });

    document.querySelectorAll('.cancel-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.editingSiteId = null;
            renderManagementSiteList();
        });
    });
}

// 액션 함수들
function toggleSite(siteId) {
    if (state.selectedSiteIds.includes(siteId)) {
        state.selectedSiteIds = state.selectedSiteIds.filter(id => id !== siteId);
    } else {
        state.selectedSiteIds.push(siteId);
    }
    render();
}

function selectAllSites() {
    state.selectedSiteIds = state.sites.map(site => site.id);
    render();
}

function deselectAllSites() {
    state.selectedSiteIds = [];
    render();
}

function updateSearch(query) {
    state.searchQuery = query;
    render();
}

function updateSort(sortBy) {
    state.sortBy = sortBy;
    render();
}

function updateDateRange(start, end) {
    state.dateRange = { start, end };
    render();
}

function resetFilters() {
    state.searchQuery = '';
    state.dateRange = { start: '', end: '' };
    elements.searchInput.value = '';
    elements.startDate.value = '';
    elements.endDate.value = '';
    render();
}

function addSite(name, url, category) {
    const newSite = {
        id: `custom-${Date.now()}`,
        name,
        url,
        category,
    };
    state.sites.push(newSite);
    render();
    renderManagementSiteList();
}

function deleteSite(siteId) {
    state.sites = state.sites.filter(site => site.id !== siteId);
    state.selectedSiteIds = state.selectedSiteIds.filter(id => id !== siteId);
    render();
    renderManagementSiteList();
}

function startEditSite(siteId) {
    state.editingSiteId = siteId;
    elements.addSiteForm.classList.add('hidden');
    document.getElementById('showAddFormBtn').classList.remove('hidden');
    renderManagementSiteList();
}

function saveEditSite(siteId) {
    const name = document.getElementById('editSiteName').value;
    const url = document.getElementById('editSiteUrl').value;
    const category = document.getElementById('editSiteCategory').value;

    if (name && url && category) {
        state.sites = state.sites.map(site => 
            site.id === siteId ? { ...site, name, url, category } : site
        );
        state.editingSiteId = null;
        render();
        renderManagementSiteList();
    }
}

// 렌더 함수
function render() {
    renderSiteSelector();
    renderPostList();
    
    // 필터 초기화 버튼 표시 여부
    if (state.searchQuery || state.dateRange.start || state.dateRange.end) {
        elements.resetFilterSection.classList.remove('hidden');
    } else {
        elements.resetFilterSection.classList.add('hidden');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 사이트 선택
    document.getElementById('selectAllBtn').addEventListener('click', selectAllSites);
    document.getElementById('deselectAllBtn').addEventListener('click', deselectAllSites);

    // 검색 및 필터
    elements.searchInput.addEventListener('input', (e) => updateSearch(e.target.value));
    elements.sortSelect.addEventListener('change', (e) => updateSort(e.target.value));
    elements.startDate.addEventListener('change', (e) => 
        updateDateRange(e.target.value, state.dateRange.end)
    );
    elements.endDate.addEventListener('change', (e) => 
        updateDateRange(state.dateRange.start, e.target.value)
    );

    // 빠른 필터
    document.getElementById('todayBtn').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        elements.startDate.value = today;
        elements.endDate.value = today;
        updateDateRange(today, today);
    });

    document.getElementById('weekBtn').addEventListener('click', () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const start = weekAgo.toISOString().split('T')[0];
        const end = today.toISOString().split('T')[0];
        elements.startDate.value = start;
        elements.endDate.value = end;
        updateDateRange(start, end);
    });

    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);

    // 모달
    document.getElementById('siteManagementBtn').addEventListener('click', () => {
        elements.siteManagementModal.classList.remove('hidden');
        renderManagementSiteList();
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        elements.siteManagementModal.classList.add('hidden');
        state.editingSiteId = null;
    });

    document.getElementById('closeModalBtn2').addEventListener('click', () => {
        elements.siteManagementModal.classList.add('hidden');
        state.editingSiteId = null;
    });

    // 사이트 추가 폼
    document.getElementById('showAddFormBtn').addEventListener('click', () => {
        elements.addSiteForm.classList.remove('hidden');
        document.getElementById('showAddFormBtn').classList.add('hidden');
        state.editingSiteId = null;
        renderManagementSiteList();
    });

    document.getElementById('cancelAddBtn').addEventListener('click', () => {
        elements.addSiteForm.classList.add('hidden');
        document.getElementById('showAddFormBtn').classList.remove('hidden');
        elements.addSiteForm.reset();
    });

    elements.addSiteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('addSiteName').value;
        const url = document.getElementById('addSiteUrl').value;
        const category = document.getElementById('addSiteCategory').value;
        addSite(name, url, category);
        elements.addSiteForm.reset();
        elements.addSiteForm.classList.add('hidden');
        document.getElementById('showAddFormBtn').classList.remove('hidden');
    });

    // 모달 외부 클릭시 닫기
    elements.siteManagementModal.addEventListener('click', (e) => {
        if (e.target === elements.siteManagementModal) {
            elements.siteManagementModal.classList.add('hidden');
            state.editingSiteId = null;
        }
    });
}

// 초기화
function init() {
    setupEventListeners();
    render();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
