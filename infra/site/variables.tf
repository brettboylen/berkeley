variable "project_name" {
  type        = string
  description = "Prefix for site resources"
  default     = "berkeley-music-prototype"
}

variable "aws_region" {
  type        = string
  description = "AWS region for the site"
  default     = "us-east-1"
}
