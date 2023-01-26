const { QueryCommand } = require('@aws-sdk/client-dynamodb');

const { SOURCE_TABLE, HOTEL_TABLE } = process.env;
const { db } = require('../db/connect');

const cleanObj = obj =>
	Object.keys(obj).reduce((n, key) => {
		const [type] = Object.keys(obj[key]);
		const [value] = Object.values(obj[key]);
		n[key] = type === 'N' ? parseFloat(value) : value;
		return n;
	}, {});

exports.queryDataToProcess = async () => {
	const params = {
		TableName: SOURCE_TABLE,
		IndexName: 'processed-index',
		KeyConditionExpression: '#p = :processed_value',
		FilterExpression: 'attribute_exists(stayId)',
		ExpressionAttributeNames: {
			'#p': 'processed'
		},
		ExpressionAttributeValues: {
			':processed_value': { N: 0 }
		}
	};

	try {
		const result = await db.send(new QueryCommand(params));

		return Promise.resolve(result.Items.map(item => cleanObj(item)));
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

		return Promise.resolve(cleanObj(result.Items[0]));
	} catch (error) {
		return Promise.reject(error);
	}
};
