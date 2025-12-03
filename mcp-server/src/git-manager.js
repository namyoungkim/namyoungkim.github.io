import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GitManager - GitHub 저장소 클론 및 관리
 */
export class GitManager {
  constructor(options = {}) {
    this.repoUrl = options.repoUrl || 'https://github.com/namyoungkim/a1rtisan.git';
    this.branch = options.branch || 'main';
    this.cacheDir = options.cacheDir || path.join(__dirname, '..', '.mcp-cache', 'repo');
    this.debug = options.debug || false;
  }

  /**
   * 디버그 로그 출력
   */
  log(...args) {
    if (this.debug) {
      console.error(...args);
    }
  }

  /**
   * 저장소가 이미 클론되어 있는지 확인
   */
  async isCloned() {
    try {
      await fs.access(path.join(this.cacheDir, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 저장소 클론 또는 업데이트
   */
  async sync() {
    const cloned = await this.isCloned();

    if (!cloned) {
      this.log(`[GitManager] Cloning repository: ${this.repoUrl}`);
      await this.clone();
    } else {
      this.log(`[GitManager] Updating repository: ${this.repoUrl}`);
      await this.pull();
    }

    this.log(`[GitManager] Repository synced at: ${this.cacheDir}`);
  }

  /**
   * 저장소 클론
   */
  async clone() {
    // 캐시 디렉토리 생성
    await fs.mkdir(path.dirname(this.cacheDir), { recursive: true });

    const git = simpleGit();
    await git.clone(this.repoUrl, this.cacheDir, ['--depth', '1', '--branch', this.branch]);
  }

  /**
   * 저장소 업데이트 (pull) with retry logic
   * @param {number} retries - 최대 재시도 횟수 (기본값: 3)
   */
  async pull(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const git = simpleGit(this.cacheDir);
        await git.pull('origin', this.branch);
        return; // 성공
      } catch (error) {
        if (i === retries - 1) {
          // 마지막 시도 실패
          throw new Error(`Failed to pull repository after ${retries} attempts: ${error.message}`);
        }
        this.log(`[GitManager] Pull failed (attempt ${i + 1}/${retries}), retrying...`);
        // 백오프: 1초, 2초, 3초...
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  /**
   * 현재 commit hash 조회
   * @returns {Promise<string>} - commit hash (전체)
   */
  async getCurrentCommitHash() {
    try {
      const git = simpleGit(this.cacheDir);
      const log = await git.log({ maxCount: 1 });
      return log.latest.hash;
    } catch (error) {
      console.error('[GitManager] Failed to get commit hash:', error);
      throw error;
    }
  }

  /**
   * 로컬 저장소 경로 반환
   */
  getRepoPath() {
    return this.cacheDir;
  }

  /**
   * 특정 경로의 절대 경로 반환
   * @param {string} relativePath - 저장소 루트 기준 상대 경로
   */
  resolvePath(relativePath) {
    return path.join(this.cacheDir, relativePath);
  }

  /**
   * 캐시 삭제 (재클론 필요시)
   */
  async clearCache() {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      this.log(`[GitManager] Cache cleared: ${this.cacheDir}`);
    } catch (error) {
      // 에러는 항상 출력
      console.error(`[GitManager] Failed to clear cache:`, error);
    }
  }
}
