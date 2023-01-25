const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env, TableName } = process.env;
const { db } = require('./db/connect');

const response = (statusCode, txt) => {
	if (statusCode >= 400) {
		console.log(`ERROR:`, txt);
	} else {
		console.log(`OK:`, txt);
	}
	return {
		statusCode,
		body: JSON.stringify(txt)
	};
};

exports.handler = async (event, context) => {
	console.log('Env', Env);

	const params = {
		TableName,
		IndexName: 'processed-index',
		KeyConditionExpression: '#p = :processed_value',
		ExpressionAttributeNames: {
			'#p': 'processed'
		},
		ExpressionAttributeValues: {
			':processed_value': { N: 0 }
		}
	};

	try {
		const result = await db.send(new QueryCommand(params));
		if (result.Count === 0) return response(400, 'Not Found');

		return response(200, result.Items);
	} catch (error) {
		return response(500, error);
	}
};
