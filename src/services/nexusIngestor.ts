import { createHash } from 'crypto';

interface GitHubTreeEntry {
  path: string;
  sha: string;
  type: string;
  size?: number;
}

export class NexusIngestor {
  private baseUrl: string = "https://raw.githubusercontent.com";
  private localManifest: Map<string, string> = new Map();

  constructor(
    private owner: string,
    private repo: string,
    private token: string
  ) {}

  /**
   * Standard Git Blob SHA-1.
   * NOTE: We use SHA-1 for Git compatibility to match Tree API metadata,
   * not for primary cryptographic security (handled by Sigstore/SHA-256).
   */
  public calculateGitSha(content: Buffer): string {
    const header = `blob ${content.length}\0`;
    const store = Buffer.concat([Buffer.from(header), content]);
    return createHash('sha1').update(store).digest('hex');
  }

  /**
   * Resilience Wrapper: Handles Primary and Secondary Rate Limits
   */
  private async requestWithRetry(url: string, options: RequestInit = {}, retries = 5): Promise<any> {
    let delay = 1000; // Start with 1s
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers,
    };

    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 403) {
            const secondaryLimit = response.headers.get('retry-after');
            const primaryReset = response.headers.get('X-RateLimit-Reset');
            let waitTime = 0;

            if (secondaryLimit) {
                waitTime = parseInt(secondaryLimit) * 1000;
            } else if (primaryReset) {
                waitTime = (parseInt(primaryReset) * 1000) - Date.now();
            }

            // Apply exponential backoff with jitter if headers are missing or for generic 403s
            const jitter = Math.random() * 200;
            const backoff = Math.max(waitTime, delay + jitter);
            
            console.warn(`Rate limited. Retrying in ${backoff}ms...`);
            await new Promise(res => setTimeout(res, backoff));
            delay *= 2;
            continue;
        }

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
    throw new Error("Maximum retries exceeded");
  }

  /**
   * Push a new daily frequency vector (prediction file) to the repository.
   * This uses the simplified PUT method as requested to avoid SHA lookups for overwrites.
   */
  public async pushDailyVector(path: string, content: string, message: string) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const base64Content = Buffer.from(content).toString('base64');
    
    return this.requestWithRetry(url, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: base64Content,
      })
    });
  }

  /**
   * Smart Logic: Rebuilds tracking metadata to avoid re-hashing every file.
   */
  public async syncRepository(branch: string, localFiles: Map<string, Buffer>) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${branch}?recursive=1`;
    const data = await this.requestWithRetry(url);
    const remoteTree: GitHubTreeEntry[] = data.tree;
    const syncList: string[] = [];

    for (const entry of remoteTree) {
        if (entry.type !== 'blob') continue;
        
        // Check manifest first (Smart Logic)
        const cachedSha = this.localManifest.get(entry.path);
        if (cachedSha === entry.sha) continue;

        // If not in manifest, calculate local hash
        const content = localFiles.get(entry.path);
        if (!content || this.calculateGitSha(content) !== entry.sha) {
            syncList.push(entry.path);
        }

        // Update manifest for future speed
        this.localManifest.set(entry.path, entry.sha);
    }
    return syncList;
  }

  /**
   * Client-side Verification of the Sigstore in-toto bundle
   */
  public verifyBundleIntegrity(bundleJson: any, localFiles: Map<string, Buffer>): boolean {
    // 1. Verify in-toto statement structure
    const statement = bundleJson.dsseEnvelope?.payload?.statement;
    if (!statement || statement._type !== 'https://in-toto.io/Statement/v1') {
        return false;
    }

    // 2. Compare local file digests against the signed manifest
    for (const subject of statement.subject) {
        const fileContent = localFiles.get(subject.name);
        if (!fileContent) return false;

        const actualHash = createHash('sha256').update(fileContent).digest('hex');
        if (actualHash !== subject.digest.sha256) {
            console.error(`Integrity mismatch for ${subject.name}`);
            return false;
        }
    }
    return true;
  }
}
