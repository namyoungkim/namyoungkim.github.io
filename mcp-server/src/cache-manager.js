import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CacheManager - 검색 인덱스 캐싱 관리
 *
 * Git commit hash를 기반으로 캐시 유효성을 검증하고,
 * 유효한 캐시가 있으면 로드하여 서버 시작 시간을 단축합니다.
 */
export class CacheManager {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, '..', '.mcp-cache');
    this.cacheFile = path.join(this.cacheDir, 'index.json');
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
   * 인덱스를 캐시에 저장
   * @param {Object} index - SearchEngine의 인덱스 (직렬화된 형태)
   * @param {string} commitHash - 현재 Git commit hash
   */
  async saveIndex(index, commitHash) {
    try {
      // 캐시 디렉토리 생성
      await fs.mkdir(this.cacheDir, { recursive: true });

      const cacheData = {
        commitHash,
        timestamp: new Date().toISOString(),
        index,
      };

      await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2), 'utf-8');
      this.log(`[CacheManager] Index cached (commit: ${commitHash.substring(0, 7)})`);
    } catch (error) {
      console.error('[CacheManager] Failed to save cache:', error);
      // 캐시 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 캐시에서 인덱스 로드
   * @returns {Promise<Object|null>} - 캐시된 인덱스 또는 null
   */
  async loadIndex() {
    try {
      const cacheContent = await fs.readFile(this.cacheFile, 'utf-8');
      const cacheData = JSON.parse(cacheContent);

      this.log(`[CacheManager] Cache found (commit: ${cacheData.commitHash.substring(0, 7)})`);
      return cacheData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.log('[CacheManager] No cache found');
      } else {
        console.error('[CacheManager] Failed to load cache:', error);
      }
      return null;
    }
  }

  /**
   * 캐시 유효성 확인
   * @param {string} currentCommitHash - 현재 Git commit hash
   * @returns {Promise<boolean>} - 캐시가 유효하면 true
   */
  async isValid(currentCommitHash) {
    try {
      const cacheData = await this.loadIndex();

      if (!cacheData) {
        return false;
      }

      const isValid = cacheData.commitHash === currentCommitHash;
      this.log(`[CacheManager] Cache validation: ${isValid ? 'VALID' : 'INVALID'}`);

      return isValid;
    } catch (error) {
      console.error('[CacheManager] Failed to validate cache:', error);
      return false;
    }
  }

  /**
   * 캐시 삭제
   */
  async clear() {
    try {
      await fs.unlink(this.cacheFile);
      this.log('[CacheManager] Cache cleared');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('[CacheManager] Failed to clear cache:', error);
      }
    }
  }
}

export default CacheManager;
