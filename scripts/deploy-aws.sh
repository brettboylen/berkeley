#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$ROOT_DIR/infra/site"
PROJECT_NAME="${PROJECT_NAME:-berkeley-music-prototype}"
AWS_REGION="${AWS_REGION:-us-east-1}"
TF="${TF:-tofu}"

if ! command -v "$TF" >/dev/null 2>&1; then
  echo "OpenTofu (tofu) is required. Install: https://opentofu.org/docs/intro/install/"
  exit 1
fi

if [[ ! -f "$SITE_DIR/backend.hcl" ]]; then
  echo "Missing infra/site/backend.hcl — run bootstrap first:"
  echo "  npm run bootstrap:aws"
  exit 1
fi

echo "==> Building production bundle"
cd "$ROOT_DIR"
npm run build

echo "==> Applying OpenTofu (S3 + CloudFront)"
cd "$SITE_DIR"
$TF init -backend-config=backend.hcl -reconfigure
$TF apply -auto-approve \
  -var="project_name=$PROJECT_NAME" \
  -var="aws_region=$AWS_REGION"

BUCKET_NAME="$($TF output -raw bucket_name)"
DISTRIBUTION_ID="$($TF output -raw distribution_id)"
WEBSITE_URL="$($TF output -raw website_url)"

echo "==> Uploading dist/ to s3://$BUCKET_NAME"
aws s3 sync "$ROOT_DIR/dist/" "s3://$BUCKET_NAME" \
  --region "$AWS_REGION" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --exclude "*.html"

aws s3 cp "$ROOT_DIR/dist/index.html" "s3://$BUCKET_NAME/index.html" \
  --region "$AWS_REGION" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

echo "==> Invalidating CloudFront cache"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text > /dev/null

echo
echo "Deploy complete."
echo "Prototype URL: $WEBSITE_URL"
echo "Staff view:    ${WEBSITE_URL}#/staff"
echo "Contributor:   ${WEBSITE_URL}#/contributor"
