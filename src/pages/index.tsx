import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';

interface BlogPost {
  id: string;
  metadata: {
    title: string;
    description: string;
    permalink: string;
    date: string;
    formattedDate: string;
  };
}

interface BlogPluginData {
  blogPosts: BlogPost[];
}

function RecentBlogPosts() {
  const blogData = usePluginData('docusaurus-plugin-content-blog') as BlogPluginData | undefined;

  if (!blogData?.blogPosts?.length) {
    return null;
  }

  const recentPosts = blogData.blogPosts.slice(0, 5);

  return (
    <ul style={{listStyle: 'none', padding: 0}}>
      {recentPosts.map((post) => (
        <li key={post.id} style={{marginBottom: '0.5rem'}}>
          <Link to={post.metadata.permalink}>
            {post.metadata.title}
          </Link>
          {post.metadata.description && (
            <span style={{color: 'var(--ifm-color-emphasis-600)'}}> - {post.metadata.description}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  const buttonStyle: React.CSSProperties = {
    padding: '0.6rem 1rem',
    background: 'var(--ifm-color-primary)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  return (
    <Layout
      title="환영합니다"
      description="개발 경험과 학습 내용을 공유하는 기술 블로그"
    >
      <main style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
        <h1>👋 환영합니다!</h1>

        <p>
          <strong>a1rtisan 개발 블로그</strong>에 오신 것을 환영합니다.
        </p>
        <p>
          이 블로그는 개발 여정에서 배운 것들, 문제 해결 경험, 그리고 기술 튜토리얼을 공유하는 공간입니다.
        </p>

        <h2>🚀 빠른 시작</h2>

        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', marginBottom: '2rem'}}>
          <Link to="/docs/" style={buttonStyle}>
            📚 문서 보기
          </Link>
          <Link to="/blog" style={buttonStyle}>
            ✍️ 블로그 읽기
          </Link>
        </div>

        <h2>✨ 최근 블로그 포스트</h2>
        <RecentBlogPosts />

        <h2>💡 이 블로그에서 다루는 주제</h2>
        <ul>
          <li><strong>AI Agents &amp; LLM Engineering</strong>: LangGraph, RAG, Context Engineering, Prompt 설계</li>
          <li><strong>Data Engineering</strong>: 데이터 파이프라인, ETL/ELT, 데이터 모델링</li>
          <li><strong>ML/MLOps</strong>: 모델 학습, 배포, 모니터링, Kubeflow</li>
          <li><strong>Python &amp; Tools</strong>: pandas, PySpark, Airflow, 개발 환경 설정</li>
        </ul>

        <hr />

        <p>
          <strong>Ready to explore?</strong> 위의 링크를 클릭하여 시작해보세요!
        </p>
      </main>
    </Layout>
  );
}
