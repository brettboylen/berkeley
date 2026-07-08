#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BOOTSTRAP_DIR="$ROOT_DIR/infra/bootstrap"
SITE_DIR="$ROOT_DIR/infra/site"
PROJECT_NAME="${PROJECT_NAME:-berkeley-music}"
AWS_REGION="${AWS_REGION:-us-east-1}"
TF="${TF:-tofu}"

if ! command -v "$TF" >/dev/null 2>&1; then
  echo "OpenTofu (tofu) is required. Install: https://opentofu.org/docs/intro/install/"
  exit 1
fi

echo "==> Bootstrapping remote state (S3 + DynamoDB)"
cd "$BOOTSTRAP_DIR"
$TF init
$TF apply -auto-approve \
  -var="project_name=$PROJECT_NAME" \
  -var="aws_region=$AWS_REGION"

STATE_BUCKET="$($TF output -raw state_bucket)"
LOCK_TABLE="$($TF output -raw lock_table)"

cat > "$SITE_DIR/backend.hcl" <<EOF
bucket         = "$STATE_BUCKET"
key            = "prototype/site.tfstate"
region         = "$AWS_REGION"
dynamodb_table = "$LOCK_TABLE"
encrypt        = true
EOF

echo
echo "Bootstrap complete."
echo "State bucket:  $STATE_BUCKET"
echo "Lock table:    $LOCK_TABLE"
echo "Backend config written to infra/site/backend.hcl"
echo
echo "Next: npm run deploy:aws"
