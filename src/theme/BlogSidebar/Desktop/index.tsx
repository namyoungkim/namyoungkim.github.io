import React, {memo, useState, useCallback, useMemo, useEffect} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import type {Props as BlogSidebarContentProps} from '@theme/BlogSidebar/Content';
import type {Props} from '@theme/BlogSidebar/Desktop';
import TopicFilter, {type TopicId} from '../TopicFilter';

import styles from './styles.module.css';

// 태그 매핑 타입
type TagMap = Record<string, string[]>;

// localStorage 키
const STORAGE_KEY_COLLAPSED = 'blog-sidebar-collapsed';
const STORAGE_KEY_TOPIC = 'blog-sidebar-topic';

// SSR 안전한 localStorage 접근
function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    if (stored === 'null') return null as T;
    return stored as T;
  } catch {
    return defaultValue;
  }
}

function setStorageValue(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      localStorage.setItem(key, 'null');
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // localStorage 사용 불가 시 무시
  }
}

const ListComponent: BlogSidebarContentProps['ListComponent'] = ({items}) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({sidebar}: Props) {
  const allItems = useVisibleBlogSidebarItems(sidebar.items);

  // 태그 맵 로드
  const [tagMap, setTagMap] = useState<TagMap>({});
  const tagMapUrl = useBaseUrl('/blog-tags.json');

  useEffect(() => {
    fetch(tagMapUrl)
      .then((res) => res.json())
      .then((data: TagMap) => setTagMap(data))
      .catch((err) => console.error('[BlogSidebar] Failed to load tag map:', err));
  }, [tagMapUrl]);

  // 사이드바 접힘 상태
  const [isCollapsed, setIsCollapsed] = useState(() =>
    getStorageValue(STORAGE_KEY_COLLAPSED, 'false') === 'true'
  );

  // 선택된 주제 필터
  const [selectedTopic, setSelectedTopic] = useState<TopicId>(() =>
    getStorageValue<TopicId>(STORAGE_KEY_TOPIC, null)
  );

  // 사이드바 토글
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      setStorageValue(STORAGE_KEY_COLLAPSED, String(newValue));
      return newValue;
    });
  }, []);

  // 주제 선택
  const handleTopicSelect = useCallback((topic: TopicId) => {
    setSelectedTopic(topic);
    setStorageValue(STORAGE_KEY_TOPIC, topic);
  }, []);

  // 주제별 필터링
  const filteredItems = useMemo(() => {
    if (!selectedTopic) return allItems;

    return allItems.filter((item) => {
      const tags = tagMap[item.permalink];
      if (!tags) return false;
      return tags.includes(selectedTopic);
    });
  }, [allItems, selectedTopic, tagMap]);

  // 접힌 상태일 때
  if (isCollapsed) {
    return (
      <aside className={styles.collapsedSidebar}>
        <button
          type="button"
          className={styles.expandButton}
          onClick={toggleSidebar}
          aria-label="사이드바 펼치기"
          title="사이드바 펼치기"
        >
          <span className={styles.expandIcon}>▶</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="col col--3">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}>
        {/* 주제 필터 */}
        <TopicFilter
          selected={selectedTopic}
          onSelect={handleTopicSelect}
        />

        {/* 사이드바 헤더 + 토글 버튼 */}
        <div className={styles.sidebarHeader}>
          <div className={clsx(styles.sidebarItemTitle)}>
            {sidebar.title}
            {selectedTopic && (
              <span className={styles.filterBadge}>
                {filteredItems.length}개
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={toggleSidebar}
            aria-label="사이드바 접기"
            title="사이드바 접기"
          >
            <span className={styles.collapseIcon}>◀</span>
          </button>
        </div>

        {/* 포스트 목록 */}
        {filteredItems.length > 0 ? (
          <BlogSidebarContent
            items={filteredItems}
            ListComponent={ListComponent}
            yearGroupHeadingClassName={styles.yearGroupHeading}
          />
        ) : (
          <div className={styles.emptyMessage}>
            해당 주제의 포스트가 없습니다.
          </div>
        )}
      </nav>
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
