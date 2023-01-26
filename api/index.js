const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env, SOURCE_TABLE, GUEST_JWT_SECRET } = process.env;
const { db } = require('./db/connect');

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
		TableName: SOURCE_TABLE,
		IndexName: 'skIndex',
		Limit: 1,
		KeyConditionExpression: 'sk = :sk_value',
		ExpressionAttributeValues: {
			':sk_value': { S: 'STAY#' + decoded.stayId }
		}
	};

	console.log('params', params);

	try {
		const result = await db.send(new QueryCommand(params));
		if (result.Count === 0) return response(400, 'Not Found');

		return response(200, result.Items[0]);
	} catch (error) {
		return response(500, error);
	}
};
