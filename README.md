# Setup vlt Action

[![CI](https://github.com/vltpkg/setup-vlt/actions/workflows/ci.yml/badge.svg)](https://github.com/vltpkg/setup-vlt/actions/workflows/ci.yml)
[![Integration Tests](https://github.com/vltpkg/setup-vlt/actions/workflows/test.yml/badge.svg)](https://github.com/vltpkg/setup-vlt/actions/workflows/test.yml)

Set up your GitHub Actions workflow with [vlt](https://vlt.sh) — the next-gen JavaScript package manager.

## Features

- 🚀 **Fast installation** via npm global install
- 📦 **Smart caching** to speed up subsequent runs
- 🎯 **Version flexibility** - latest, specific versions, or semver ranges
- 📄 **Version files** - read from package.json or .vlt-version
- 🌐 **Custom registries** supported
- ✅ **Cross-platform** - works on Ubuntu, macOS, and Windows

## Usage

### Basic Usage

```yaml
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version: 'latest'

- name: Install dependencies
  run: vlt install

- name: Run tests
  run: vlt run test
```

### Specific Version

```yaml
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version: '1.0.0-rc.18'
```

### Version from File

```yaml
# Read from package.json engines.vlt or packageManager field
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version-file: 'package.json'

# Or read from a .vlt-version file
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version-file: '.vlt-version'
```

### Custom Registry

```yaml
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version: 'latest'
    registry-url: 'https://your-private-registry.com'
```

### Disable Caching

```yaml
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version: '1.0.0-rc.18'
    no-cache: 'true'
```

### Complete Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup vlt
        uses: vltpkg/setup-vlt@v1
        id: setup-vlt
        with:
          vlt-version: '^1.0.0'
          vlt-version-file: 'package.json'

      - name: Print vlt version
        run: |
          echo "Installed vlt version: ${{ steps.setup-vlt.outputs.vlt-version }}"
          echo "vlt path: ${{ steps.setup-vlt.outputs.vlt-path }}"
          echo "Cache hit: ${{ steps.setup-vlt.outputs.cache-hit }}"

      - name: Install dependencies
        run: vlt install

      - name: Run linter
        run: vlt run lint

      - name: Run tests
        run: vlt run test

      - name: Build
        run: vlt run build
```

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `vlt-version` | The version of vlt to install (e.g. "latest", "1.0.0-rc.18", "1.x") | `latest` | No |
| `vlt-version-file` | File to read vlt version from (e.g. "package.json", ".vlt-version") | | No |
| `registry-url` | The npm registry URL to use for installing vlt | | No |
| `no-cache` | Disable caching of vlt installation | `false` | No |
| `token` | GitHub token for API requests (helps avoid rate limiting) | `${{ github.token }}` | No |

## Outputs

| Output | Description |
|--------|-------------|
| `vlt-version` | The version of vlt that was installed |
| `vlt-path` | The path to the vlt executable |
| `cache-hit` | Whether the vlt installation was restored from cache |

## Version Resolution

The action supports several ways to specify which version of vlt to install:

### 1. Exact Version
```yaml
vlt-version: '1.0.0-rc.18'  # Installs exactly this version
```

### 2. Latest Version
```yaml
vlt-version: 'latest'  # Installs the latest available version
```

### 3. Semver Range
```yaml
vlt-version: '^1.0.0'  # Installs the latest 1.x version
vlt-version: '1.x'     # Same as above
```

### 4. Version Files

#### package.json
The action can read the version from your `package.json` in two ways:

```json
{
  "engines": {
    "vlt": "^1.0.0"
  }
}
```

Or from the `packageManager` field:
```json
{
  "packageManager": "vlt@1.0.0-rc.18"
}
```

#### .vlt-version file
Create a `.vlt-version` file in your repository root:
```
1.0.0-rc.18
```

## Caching

The action automatically caches vlt installations to speed up subsequent workflow runs. The cache key is based on:
- vlt version
- Operating system
- CPU architecture

Caching behavior:
- ✅ **Enabled by default** for specific versions
- ❌ **Disabled for `latest`** (since it can change)
- 🚫 **Can be disabled** with `no-cache: 'true'`

Cache is saved after the main action completes successfully and restored at the beginning of subsequent runs.

## vlt Binaries

After installation, the following binaries are available in your PATH:
- `vlt` - Main vlt package manager
- `vlr` - vlt runner
- `vlx` - vlt executor
- `vlrx` - vlt runner executor
- `vlxl` - vlt executor with logging

## Comparison with Manual Installation

### ❌ Manual Installation
```yaml
- name: Install vlt manually
  run: |
    npm install -g vlt@1.0.0-rc.18
    echo "$(npm bin -g)" >> $GITHUB_PATH
```

### ✅ setup-vlt Action
```yaml
- name: Setup vlt
  uses: vltpkg/setup-vlt@v1
  with:
    vlt-version: '1.0.0-rc.18'
```

**Benefits of using the action:**
- 🚀 **Faster** - intelligent caching
- 🔧 **Easier** - no PATH management needed  
- 🎯 **Flexible** - version files and semver ranges
- 🛡️ **Reliable** - installation verification
- 📊 **Observable** - outputs for version and paths

## Supported Platforms

- ✅ Ubuntu (ubuntu-latest, ubuntu-20.04, ubuntu-22.04)
- ✅ macOS (macos-latest, macos-12, macos-13, macos-14)
- ✅ Windows (windows-latest, windows-2019, windows-2022)

## About vlt

vlt is a next-generation JavaScript package manager that offers:

- ⚡ **Fast installations** with smart dependency resolution
- 🔒 **Secure by default** with built-in integrity checking
- 📦 **Workspace support** for monorepos
- 🎯 **Zero-config** for most projects
- 🔄 **Compatible** with npm ecosystem

Learn more at [vlt.sh](https://vlt.sh).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.