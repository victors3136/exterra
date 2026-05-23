const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const databaseClient = new DynamoDBClient({});
const databaseWriter = DynamoDBDocumentClient.from(databaseClient);

exports.handler = async (event) => {
    for (const record of event.Records) {
        const radarData = JSON.parse(record.body);

        const params = {
            TableName: process.env.TABLE_NAME,
            Item: {
                stream_id: radarData.stream_id,
                timestamp: radarData.timestamp,
                latitude: radarData.latitude,
                longitude: radarData.longitude,
                speed: radarData.speed_kmh
            }
        };

        try {
            await databaseWriter.send(new PutCommand(params));
            console.log(`Handled stream: ${radarData.stream_id}`);
        } catch (error) {
            console.error("Database write failure:", error);
        }
    }
    return { statusCode: 200, body: `Successfully compiled ${event.Records.length} items.` };
};