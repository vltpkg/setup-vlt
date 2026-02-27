import * as os from 'os';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 * Get the platform-specific npm global directory
 */
export async function getNpmGlobalPath(): Promise<string> {
  let output = '';
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  };

  await exec.exec('npm', ['root', '-g'], options);
  return output.trim();
}

/**
 * Get the npm global bin directory
 */
export async function getNpmGlobalBinPath(): Promise<string> {
  let output = '';
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  };

  await exec.exec('npm', ['bin', '-g'], options);
  return output.trim();
}

/**
 * Generate cache key for vlt installation
 */
export function getCacheKey(version: string): string {
  const platform = os.platform();
  const arch = os.arch();

  // Don't cache 'latest' as it can change
  if (version === 'latest') {
    return '';
  }

  return `setup-vlt-${version}-${platform}-${arch}`;
}

/**
 * Check if vlt is already installed and get its version
 */
export async function getInstalledVltVersion(): Promise<string | null> {
  try {
    let output = '';
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
      silent: true,
    };

    await exec.exec('vlt', ['--version'], options);
    return output.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Verify vlt installation by running --version
 */
export async function verifyVltInstallation(): Promise<string> {
  try {
    let output = '';
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        },
      },
    };

    await exec.exec('vlt', ['--version'], options);
    const version = output.trim();
    core.info(`✅ vlt ${version} is installed and working`);
    return version;
  } catch (error) {
    throw new Error(`vlt installation verification failed: ${error}`);
  }
}

/**
 * Add directory to PATH
 */
export function addToPath(dirPath: string): void {
  core.addPath(dirPath);
  core.info(`Added ${dirPath} to PATH`);
}
