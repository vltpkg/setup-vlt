import * as core from '@actions/core';
import { saveCacheIfNeeded } from './setup';

/**
 * Post action entry point - saves vlt installation to cache
 */
async function run(): Promise<void> {
  try {
    // Retrieve state from main action
    const vltVersion = core.getState('vlt-version');
    const cacheHit = core.getState('cache-hit') === 'true';
    const noCache = core.getState('no-cache') === 'true';

    if (!vltVersion) {
      core.info('No vlt version state found, skipping cache save');
      return;
    }

    core.info(`📦 Post-action: Saving vlt ${vltVersion} to cache...`);

    await saveCacheIfNeeded(vltVersion, cacheHit, noCache);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.warning(`Cache save failed: ${message}`);
    // Don't fail the entire workflow if cache save fails
  }
}

// Run the post action
if (require.main === module) {
  run();
}

export { run };
