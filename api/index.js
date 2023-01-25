const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env, AWS_DEFAULT_REGION, GUEST_JWT_SECRET } = process.env;

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

const TableName = 'ecotrip.staging.administration';

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR: ${txt}`);
	} else {
		console.log(`OK: ${txt}`);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context) => {
	console.log('Env', Env);

	const authHeader = event.headers.Authorization;

	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return response(400, 'Missing token');

	let decoded;

	try {
		decoded = jwt.verify(token, GUEST_JWT_SECRET);
		console.log('decoded', decoded);
	} catch (err) {
		return response(401, 'Unauthorized');
	}

	const params = {
		TableName,
		IndexName: 'skIndex',
		Limit: 1,
		KeyConditionExpression: 'sk = :sk_value',
		ExpressionAttributeValues: {
			':sk_value': { S: 'STAY#' + decoded.stayId }
		}
	};

	console.log('params', params);

	try {
		const result = await client.send(new QueryCommand(params));
		if (result.Count === 0) return response(400, 'Not Found');

		return response(200, result.Items[0]);
	} catch (error) {
		return response(500, error);
	}
};
