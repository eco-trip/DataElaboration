const { QueryCommand } = require('@aws-sdk/client-dynamodb');

const { SOURCE_TABLE, HOTEL_TABLE } = process.env;
const { db } = require('../db/connect');

exports.queryDataToProcess = async () => {
	const params = {
		TableName: SOURCE_TABLE,
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

		return Promise.resolve(result.Items);
	} catch (error) {
		return Promise.reject(error);
	}
};

exports.getHotelInfo = async hotelId => {
	const params = {
		TableName: HOTEL_TABLE,
		KeyConditionExpression: 'pk = :hotelId AND sk=:meta',
		Limit: 1,
		ExpressionAttributeValues: {
			':hotelId': { S: 'HOTEL#' + hotelId },
			':meta': { S: 'METADATA#' + hotelId }
		}
	};

	try {
		const result = await db.send(new QueryCommand(params));

		if (result.Count === 0) return Promise.resolve(false);

		const parsed = Object.keys(result.Items[0]).reduce((obj, key) => {
			const [type] = Object.keys(result.Items[0][key]);
			const [value] = Object.values(result.Items[0][key]);
			obj[key] = type === 'N' ? parseFloat(value) : value;
			return obj;
		}, {});

		console.log('parsed', parsed);

		return Promise.resolve(parsed);
	} catch (error) {
		return Promise.reject(error);
	}
};
