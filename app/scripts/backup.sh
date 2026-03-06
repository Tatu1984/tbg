#!/bin/bash
# Database backup script for TBG
# Usage: ./scripts/backup.sh
# Requires: DATABASE_URL environment variable set
# Stores backups in ./backups/ with timestamp

set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/tbg_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "Starting backup at $(date)..."
pg_dump "$DATABASE_URL" --no-owner --no-acl > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"
echo "Backup complete: ${BACKUP_FILE}.gz"

# Keep only last 30 backups
ls -t "${BACKUP_DIR}"/tbg_backup_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
echo "Cleanup complete. Keeping last 30 backups."

echo "Backup finished at $(date)"
