import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// 주제 태그 정의 - 새 주제를 추가하려면 여기에 추가하세요
const TOPICS = [
  { id: null, label: '전체' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Data' },
  { id: 'dev-tools', label: 'Dev Tools' },
  { id: 'devops', label: 'DevOps' },
  { id: 'career', label: 'Career' },
] as const;

type TopicId = typeof TOPICS[number]['id'];

interface TopicFilterProps {
  selected: TopicId;
  onSelect: (topic: TopicId) => void;
}

export default function TopicFilter({
  selected,
  onSelect,
}: TopicFilterProps): JSX.Element {
  return (
    <div className={styles.topicFilter}>
      {TOPICS.map((topic) => (
        <button
          key={topic.id ?? 'all'}
          type="button"
          className={clsx(
            styles.topicButton,
            selected === topic.id && styles.active,
          )}
          onClick={() => onSelect(topic.id)}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}

export { TOPICS };
export type { TopicId };
