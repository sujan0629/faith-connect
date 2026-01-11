# FaithConnect - pnpm + Turborepo Migration

## What Changed

Migrated from npm workspaces to **pnpm + Turborepo** for better monorepo management.

## New Files

- `pnpm-workspace.yaml` - Defines pnpm workspaces
- `turbo.json` - Turborepo task configuration with TUI enabled
- Updated `package.json` - New scripts using turbo commands

## Installation Steps

1. **Install pnpm globally**:
   ```bash
   npm install -g pnpm@8.15.0
   ```

2. **Remove old node_modules and lock files**:
   ```bash
   # Windows (PowerShell)
   Remove-Item -Recurse -Force node_modules, backend/node_modules, mobile/node_modules, shared/node_modules, package-lock.json, backend/package-lock.json, mobile/package-lock.json, shared/package-lock.json -ErrorAction SilentlyContinue
   
   # Linux/Mac
   rm -rf node_modules backend/node_modules mobile/node_modules shared/node_modules package-lock.json backend/package-lock.json mobile/package-lock.json shared/package-lock.json
   ```

3. **Install dependencies with pnpm**:
   ```bash
   pnpm install
   ```

4. **Run all services with Turbo TUI**:
   ```bash
   pnpm dev
   ```

## Benefits

### pnpm
- **Fast**: 2x faster than npm
- **Efficient**: Content-addressable storage saves disk space
- **Strict**: No phantom dependencies
- **Better caching**: Shares dependencies across all projects

### Turborepo
- **Parallel execution**: Runs tasks simultaneously
- **Smart caching**: Never rebuilds the same thing twice
- **Dependency aware**: Automatically builds dependencies first
- **TUI mode**: Beautiful terminal interface showing all logs

## New Commands

| Old Command | New Command | Description |
|------------|-------------|-------------|
| `cd shared && npm run dev` | `pnpm dev:shared` | Watch shared types |
| `cd backend && npm run start:dev` | `pnpm dev:backend` | Run backend |
| `cd mobile && npx expo start` | `pnpm dev:mobile` | Run mobile |
| Multiple terminals | `pnpm dev` | Run all with TUI |

## Turborepo TUI

The TUI (Terminal UI) provides:
- Real-time logs from all running processes
- Color-coded output per workspace
- Easy navigation between logs
- Status indicators for each task
- No more juggling multiple terminal windows!

## Configuration Files

### pnpm-workspace.yaml
```yaml
packages:
  - 'backend'
  - 'mobile'
  - 'shared'
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Troubleshooting

**Issue**: `pnpm: command not found`
- **Solution**: Run `npm install -g pnpm@8.15.0`

**Issue**: Old lockfiles causing conflicts
- **Solution**: Delete all `package-lock.json` and `node_modules`, then run `pnpm install`

**Issue**: Shared package not found
- **Solution**: Run `pnpm install` at root to recreate workspace links

## Developer Experience

**Before** (3 terminal windows):
```bash
# Terminal 1
cd shared && npm run dev

# Terminal 2  
cd backend && npm run start:dev

# Terminal 3
cd mobile && npx expo start
```

**After** (1 command):
```bash
pnpm dev  # Beautiful TUI shows all logs in one place!
```
