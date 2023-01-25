const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const { Env, AWS_DEFAULT_REGION } = process.env;

let client;

if (Env === 'local') {
	client = new DynamoDBClient({
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
		},
		region: AWS_DEFAULT_REGION
	});
} else if (Env === 'test') {
	client = new DynamoDBClient({ region: AWS_DEFAULT_REGION, endpoint: process.env.DYNAMODB_ENDPOINT });
} else {
	client = new DynamoDBClient({ region: AWS_DEFAULT_REGION });
}

module.exports.db = client;
