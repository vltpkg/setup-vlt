import { resolveVltVersion } from '../src/version';
import * as fs from 'fs';
import * as path from 'path';

// Mock the exec module
jest.mock('@actions/exec');
jest.mock('@actions/core');

describe('Version Resolution', () => {
  const mockExec = require('@actions/exec');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveVltVersion', () => {
    test('should return latest for latest version', async () => {
      const result = await resolveVltVersion('latest');
      expect(result).toBe('latest');
    });

    test('should return specific version as-is', async () => {
      const result = await resolveVltVersion('1.0.0-rc.18');
      expect(result).toBe('1.0.0-rc.18');
    });

    test('should resolve semver range via npm view', async () => {
      mockExec.exec.mockImplementation(async (command: string, args: string[], options: any) => {
        if (command === 'npm' && args.includes('view')) {
          options.listeners.stdout(Buffer.from('"1.0.0-rc.18"'));
        }
      });

      const result = await resolveVltVersion('1.x');
      expect(result).toBe('1.0.0-rc.18');
    });

    test('should handle npm view failure gracefully', async () => {
      mockExec.exec.mockRejectedValue(new Error('npm view failed'));

      const result = await resolveVltVersion('^1.0.0');
      expect(result).toBe('^1.0.0'); // Should fallback to original spec
    });
  });

  describe('readVersionFromFile', () => {
    const tempDir = path.join(__dirname, 'temp');

    beforeEach(() => {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
    });

    afterEach(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test('should read version from .vlt-version file', async () => {
      const versionFile = path.join(tempDir, '.vlt-version');
      fs.writeFileSync(versionFile, '1.0.0-rc.18\n');

      const result = await resolveVltVersion('latest', versionFile);
      expect(result).toBe('1.0.0-rc.18');
    });

    test('should read version from package.json engines.vlt', async () => {
      const packageFile = path.join(tempDir, 'package.json');
      const packageContent = {
        name: 'test',
        engines: {
          vlt: '^1.0.0',
        },
      };
      fs.writeFileSync(packageFile, JSON.stringify(packageContent, null, 2));

      mockExec.exec.mockImplementation(async (command: string, args: string[], options: any) => {
        if (command === 'npm' && args.includes('view')) {
          options.listeners.stdout(Buffer.from('"1.0.0-rc.18"'));
        }
      });

      const result = await resolveVltVersion('latest', packageFile);
      expect(result).toBe('1.0.0-rc.18');
    });

    test('should read version from package.json packageManager', async () => {
      const packageFile = path.join(tempDir, 'package.json');
      const packageContent = {
        name: 'test',
        packageManager: 'vlt@1.0.0-rc.18',
      };
      fs.writeFileSync(packageFile, JSON.stringify(packageContent, null, 2));

      const result = await resolveVltVersion('latest', packageFile);
      expect(result).toBe('1.0.0-rc.18');
    });

    test('should handle non-existent version file', async () => {
      const result = await resolveVltVersion('1.0.0-rc.18', '/non/existent/file');
      expect(result).toBe('1.0.0-rc.18'); // Should fallback to requested version
    });
  });
});
