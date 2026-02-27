import * as core from '@actions/core';
import { setupVlt } from './setup';

/**
 * Main action entry point
 */
async function run(): Promise<void> {
  try {
    // Get inputs
    const vltVersion = core.getInput('vlt-version') || 'latest';
    const vltVersionFile = core.getInput('vlt-version-file') || undefined;
    const registryUrl = core.getInput('registry-url') || undefined;
    const noCache = core.getInput('no-cache') === 'true';

    core.info('🚀 Setting up vlt...');
    core.info(`Version: ${vltVersion}`);
    if (vltVersionFile) {
      core.info(`Version file: ${vltVersionFile}`);
    }
    if (registryUrl) {
      core.info(`Registry URL: ${registryUrl}`);
    }
    if (noCache) {
      core.info('Caching disabled');
    }

    // Setup vlt
    const result = await setupVlt(vltVersion, vltVersionFile, registryUrl, noCache);

    // Set outputs
    core.setOutput('vlt-version', result.vltVersion);
    core.setOutput('vlt-path', result.vltPath);
    core.setOutput('cache-hit', result.cacheHit.toString());

    // Store values for post action
    core.saveState('vlt-version', result.vltVersion);
    core.saveState('cache-hit', result.cacheHit.toString());
    core.saveState('no-cache', noCache.toString());

    core.info(`✅ Successfully setup vlt ${result.vltVersion}`);
    core.info(`vlt path: ${result.vltPath}`);
    core.info(`Cache hit: ${result.cacheHit}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${message}`);
  }
}

// Run the action
if (require.main === module) {
  run();
}

export { run };
