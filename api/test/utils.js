const { CreateTableCommand, DeleteTableCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');

const { SOURCE_TABLE } = process.env;

exports.CreateTable = async db => {
	try {
		await db.send(new DeleteTableCommand({ TableName: SOURCE_TABLE }));
	} catch (e) {
		console.log('nothing to delete');
	}

	const params = {
		TableName: SOURCE_TABLE,
		KeySchema: [
			{
				AttributeName: 'roomId',
				KeyType: 'HASH'
			},
			{
				AttributeName: 'timestamp',
				KeyType: 'RANGE'
			}
		],
		AttributeDefinitions: [
			{
				AttributeName: 'roomId',
				AttributeType: 'S'
			},
			{
				AttributeName: 'timestamp',
				AttributeType: 'N'
			},
			{
				AttributeName: 'processed',
				AttributeType: 'N'
			}
		],
		ProvisionedThroughput: {
			ReadCapacityUnits: 5,
			WriteCapacityUnits: 5
		},
		GlobalSecondaryIndexes: [
			{
				IndexName: 'timestamp-index',
				KeySchema: [
					{
						AttributeName: 'timestamp',
						KeyType: 'HASH'
					}
				],
				Projection: {
					ProjectionType: 'ALL'
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				}
			},
			{
				IndexName: 'processed-index',
				KeySchema: [
					{
						AttributeName: 'processed',
						KeyType: 'HASH'
					}
				],
				Projection: {
					ProjectionType: 'ALL'
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				}
			}
		]
	};

	try {
		await db.send(new CreateTableCommand(params));

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(error);
	}
};

exports.InsertItems = async (db, items) => {
	const requests = items.map(item => ({
		PutRequest: {
			Item: item
		}
	}));

	const params = {
		RequestItems: {}
	};

	params.RequestItems[SOURCE_TABLE] = requests;

	try {
		await db.send(new BatchWriteItemCommand(params));

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(error);
	}
};
