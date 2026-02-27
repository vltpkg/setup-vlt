import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as exec from '@actions/exec';
import * as path from 'path';
import {
  getCacheKey,
  getNpmGlobalBinPath,
  verifyVltInstallation,
  addToPath,
  getInstalledVltVersion,
} from './utils';
import { resolveVltVersion } from './version';

export interface SetupResult {
  vltVersion: string;
  vltPath: string;
  cacheHit: boolean;
}

/**
 * Main setup function - installs vlt and configures PATH
 */
export async function setupVlt(
  requestedVersion: string,
  versionFile?: string,
  registryUrl?: string,
  noCache?: boolean
): Promise<SetupResult> {
  // Resolve the exact version to install
  const resolvedVersion = await resolveVltVersion(requestedVersion, versionFile);
  core.info(`Setting up vlt version: ${resolvedVersion}`);

  // Check if vlt is already installed with the correct version
  const existingVersion = await getInstalledVltVersion();
  if (existingVersion && existingVersion === resolvedVersion) {
    core.info(`vlt ${existingVersion} is already installed`);
    const binPath = await getNpmGlobalBinPath();
    const vltPath = path.join(binPath, process.platform === 'win32' ? 'vlt.cmd' : 'vlt');
    return {
      vltVersion: existingVersion,
      vltPath,
      cacheHit: false,
    };
  }

  // Try to restore from cache
  let cacheHit = false;
  const cacheKey = getCacheKey(resolvedVersion);

  if (!noCache && cacheKey) {
    const binPath = await getNpmGlobalBinPath();
    const cachePaths = [binPath];

    core.info(`Attempting to restore vlt from cache with key: ${cacheKey}`);
    const restoredKey = await cache.restoreCache(cachePaths, cacheKey);

    if (restoredKey) {
      core.info('✅ Restored vlt from cache');
      cacheHit = true;

      // Verify the cached installation works
      try {
        const version = await verifyVltInstallation();
        addToPath(binPath);
        const vltPath = path.join(binPath, process.platform === 'win32' ? 'vlt.cmd' : 'vlt');
        return {
          vltVersion: version,
          vltPath,
          cacheHit: true,
        };
      } catch (error) {
        core.warning(`Cached vlt installation is broken: ${error}`);
        // Continue with fresh installation
      }
    }
  }

  // Install vlt via npm
  await installVlt(resolvedVersion, registryUrl);

  // Verify installation and get actual version
  const installedVersion = await verifyVltInstallation();

  // Add npm global bin directory to PATH
  const binPath = await getNpmGlobalBinPath();
  addToPath(binPath);

  const vltPath = path.join(binPath, process.platform === 'win32' ? 'vlt.cmd' : 'vlt');

  return {
    vltVersion: installedVersion,
    vltPath,
    cacheHit,
  };
}

/**
 * Install vlt via npm
 */
async function installVlt(version: string, registryUrl?: string): Promise<void> {
  const args = ['install', '-g', `vlt@${version}`];

  if (registryUrl) {
    args.push('--registry', registryUrl);
    core.info(`Using custom registry: ${registryUrl}`);
  }

  core.info(`Installing vlt@${version}...`);

  try {
    await exec.exec('npm', args);
    core.info('✅ vlt installed successfully');
  } catch (error) {
    throw new Error(`Failed to install vlt@${version}: ${error}`);
  }
}

/**
 * Save installation to cache (called by post action)
 */
export async function saveCacheIfNeeded(
  version: string,
  cacheHit: boolean,
  noCache?: boolean
): Promise<void> {
  if (noCache || cacheHit) {
    core.info('Skipping cache save (disabled or already cached)');
    return;
  }

  const cacheKey = getCacheKey(version);
  if (!cacheKey) {
    core.info('Skipping cache save (latest version or invalid cache key)');
    return;
  }

  try {
    const binPath = await getNpmGlobalBinPath();
    const cachePaths = [binPath];

    core.info(`Saving vlt installation to cache with key: ${cacheKey}`);
    await cache.saveCache(cachePaths, cacheKey);
    core.info('✅ Saved vlt installation to cache');
  } catch (error) {
    core.warning(`Failed to save vlt installation to cache: ${error}`);
  }
}
