import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Home(): React.JSX.Element {
  const {siteConfig} = useDocusaurusContext();

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

        <h2>💡 이 블로그에서 다루는 주제</h2>
        <ul>
          <li><strong>AI Agents &amp; LLM Engineering</strong>: LangGraph, RAG, Context Engineering, Prompt 설계</li>
          <li><strong>Data Engineering</strong>: 데이터 파이프라인, ETL/ELT, 데이터 모델링</li>
          <li><strong>ML/MLOps</strong>: 모델 학습, 배포, 모니터링, Kubeflow</li>
          <li><strong>Python &amp; Tools</strong>: pandas, PySpark, Airflow, 개발 환경 설정</li>
        </ul>
      </main>
    </Layout>
  );
}
