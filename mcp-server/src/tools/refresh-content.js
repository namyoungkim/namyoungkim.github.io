/**
 * refresh_content - 저장소 동기화 및 인덱스 재빌드
 */
export const refreshContentTool = {
  name: 'refresh_content',
  description: 'Manually sync the repository and rebuild the search index to get the latest content from GitHub. Use this when you want to fetch newly published blog posts or documentation.',
  inputSchema: {
    type: 'object',
    properties: {
      force: {
        type: 'boolean',
        description: 'Force rebuild index even if commit hash unchanged (default: false)',
      },
    },
  },
};

/**
 * refresh_content 핸들러
 */
export async function handleRefreshContent(args, gitManager, searchEngine, cacheManager) {
  const { force = false } = args;

  try {
    // 현재 commit hash 저장
    const oldCommitHash = await gitManager.getCurrentCommitHash();
    console.error(`[refresh_content] Current commit: ${oldCommitHash.substring(0, 7)}`);

    // Git pull 실행
    console.error('[refresh_content] Pulling latest changes...');
    await gitManager.pull();

    // 새 commit hash 확인
    const newCommitHash = await gitManager.getCurrentCommitHash();
    const hasChanges = oldCommitHash !== newCommitHash;

    console.error(`[refresh_content] New commit: ${newCommitHash.substring(0, 7)}`);
    console.error(`[refresh_content] Changes detected: ${hasChanges ? 'YES' : 'NO'}`);

    // 변경이 있거나 force 옵션이 true인 경우 인덱스 재빌드
    if (hasChanges || force) {
      console.error('[refresh_content] Rebuilding search index...');

      const repoPath = gitManager.getRepoPath();
      await searchEngine.buildIndex(repoPath);

      // 캐시 업데이트
      await cacheManager.saveIndex(searchEngine.exportIndex(), newCommitHash);

      const stats = searchEngine.getStats();
      console.error(`[refresh_content] Index rebuilt: ${stats}`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              updated: true,
              oldCommit: oldCommitHash.substring(0, 7),
              newCommit: newCommitHash.substring(0, 7),
              hasChanges,
              forced: force,
              stats,
              message: hasChanges
                ? 'Repository updated and index rebuilt successfully'
                : 'Index forcibly rebuilt (no changes in repository)'
            }, null, 2),
          },
        ],
      };
    } else {
      // 변경사항 없음
      const stats = searchEngine.getStats();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              updated: false,
              commit: newCommitHash.substring(0, 7),
              stats,
              message: 'Repository is already up to date. Use force=true to rebuild index anyway.'
            }, null, 2),
          },
        ],
      };
    }
  } catch (error) {
    console.error('[refresh_content] Error:', error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: 'Failed to refresh content. Please check your network connection and try again.'
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
