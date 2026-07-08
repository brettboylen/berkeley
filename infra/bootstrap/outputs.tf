output "state_bucket" {
  description = "S3 bucket for OpenTofu remote state"
  value       = aws_s3_bucket.tfstate.bucket
}

output "lock_table" {
  description = "DynamoDB table for OpenTofu state locking"
  value       = aws_dynamodb_table.tflock.name
}

output "aws_region" {
  description = "Region where state resources live"
  value       = var.aws_region
}
