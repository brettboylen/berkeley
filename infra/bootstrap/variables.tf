variable "project_name" {
  type        = string
  description = "Prefix for Terraform state bucket and DynamoDB lock table"
  default     = "berkeley-music"
}

variable "aws_region" {
  type        = string
  description = "AWS region for state resources"
  default     = "us-east-1"
}
