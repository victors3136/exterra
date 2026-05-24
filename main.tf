provider "aws" {
  region = "eu-north-1"
}

# ==========================================
#                  DATABASE
# ==========================================
resource "aws_dynamodb_table" "radar_events" {
  name           = "RadarEvents"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "stream_id"
  range_key      = "timestamp"

  attribute {
    name = "stream_id"
    type = "S" #tring
  }
  attribute {
    name = "timestamp"
    type = "N" #umber
  }
}

# ==========================================
#                 QUEUE
# ==========================================
resource "aws_sqs_queue" "radar_queue" {
  name                      = "radar-event-queue"
  message_retention_seconds = 60 * 60 * 24 # seconds in a day
}

# ==========================================
#               SECURITY
# ==========================================
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "radar-lambda-exec-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_aws_permissions" {
  name        = "radar-lambda-aws-permissions"
  description = "Allows secure interaction between system Lambdas, SQS, and DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.radar_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.radar_events.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_custom" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_aws_permissions.arn
}

# ==========================================
#           LAMBDAS
# ==========================================

resource "aws_lambda_function" "generator" {
  filename      = "handlers/generator.zip"
  function_name = "radar-event-generator"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "python3.12"

  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.radar_queue.id
    }
  }
}

resource "aws_lambda_function" "processor" {
  filename      = "handlers/processor.zip"
  function_name = "radar-event-processor"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.radar_events.name
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.radar_queue.arn
  function_name    = aws_lambda_function.processor.arn
  batch_size       = 10
}

resource "aws_lambda_function" "reader" {
  filename      = "handlers/reader.zip"
  function_name = "radar-event-reader"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.radar_events.name
    }
  }
}

# ==========================================
#             API GATEWAY
# ==========================================
resource "aws_apigatewayv2_api" "http_api" {
  name          = "radar-telemetry-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.reader.invoke_arn
}

resource "aws_apigatewayv2_route" "get_events" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /events"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.reader.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# ==========================================
#                   FRONTEND
# ==========================================
resource "aws_s3_bucket" "frontend" {
  bucket        = "gccc-radar-map-frontend-2026"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "frontend_hosting" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_public" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  depends_on = [aws_s3_bucket_public_access_block.frontend_public]
  bucket     = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

output "api_endpoint" {
  value       = "${aws_apigatewayv2_stage.default.invoke_url}events"
  description = "HTTP Endpoint URL"
}

output "frontend_url" {
  value       = aws_s3_bucket_website_configuration.frontend_hosting.website_endpoint
  description = "Frontend Web App URL"
}

# ==========================================
#             EVENT GENERATION
# ==========================================

resource "aws_cloudwatch_event_rule" "generator_job" {
  name                = "radar-generator-job"
  description         = "Trigger the telemetry generator"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "trigger_generator" {
  rule      = aws_cloudwatch_event_rule.generator_job.name
  target_id = "InvokeGeneratorLambda"
  arn       = aws_lambda_function.generator.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generator.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.generator_job.arn
}