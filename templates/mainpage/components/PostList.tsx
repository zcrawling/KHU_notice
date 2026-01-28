import { Calendar, ExternalLink, FileText } from 'lucide-react';
import type { Post } from '../App';

interface PostListProps {
  posts: Post[];
  selectedCount: number;
}

export function PostList({ posts, selectedCount }: PostListProps) {
  if (selectedCount === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">조회할 사이트를 선택해주세요</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">선택한 사이트에 게시글이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">공지사항</h2>
          <span className="text-sm text-gray-500">총 {posts.length}개</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {posts.map(post => (
          <a
            key={post.id}
            href={post.url}
            className="block p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {post.siteName}
                  </span>
                  {post.isNew && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
