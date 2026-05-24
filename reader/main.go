package main

import (
	"context"
	"encoding/json"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func HandleRequest(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	configuration, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	service := dynamodb.NewFromConfig(configuration)
	tableName := os.Getenv("TABLE_NAME")

	tenMinutesAgo := time.Now().Add(-10 * time.Minute).UnixMilli()

	data, err := service.Scan(ctx, &dynamodb.ScanInput{
		TableName:        &tableName,
		FilterExpression: aws.String("#ts >= :ten_minutes_ago"),
		ExpressionAttributeNames: map[string]string{
			"#ts": "timestamp",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":ten_minutes_ago": &types.AttributeValueMemberN{Value: strconv.FormatInt(tenMinutesAgo, 10)},
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 500}, err
	}

	body, _ := json.Marshal(data.Items)

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Methods": "GET,OPTIONS",
		},
		Body: string(body),
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}