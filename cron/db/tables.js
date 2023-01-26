const { SOURCE_TABLE, DEST_TABLE, HOTEL_TABLE } = process.env;

const schemas = [];

schemas[SOURCE_TABLE] = {
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

schemas[DEST_TABLE] = {
	KeySchema: [
		{
			AttributeName: 'roomId',
			KeyType: 'HASH'
		},
		{
			AttributeName: 'stayId',
			KeyType: 'RANGE'
		}
	],
	AttributeDefinitions: [
		{
			AttributeName: 'roomId',
			AttributeType: 'S'
		},
		{
			AttributeName: 'stayId',
			AttributeType: 'S'
		}
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 5,
		WriteCapacityUnits: 5
	},
	GlobalSecondaryIndexes: [
		{
			IndexName: 'skIndex',
			KeySchema: [
				{
					AttributeName: 'stayId',
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

schemas[HOTEL_TABLE] = {
	KeySchema: [
		{
			AttributeName: 'pk',
			KeyType: 'HASH'
		},
		{
			AttributeName: 'sk',
			KeyType: 'RANGE'
		}
	],
	AttributeDefinitions: [
		{
			AttributeName: 'pk',
			AttributeType: 'S'
		},
		{
			AttributeName: 'sk',
			AttributeType: 'S'
		}
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 5,
		WriteCapacityUnits: 5
	},
	GlobalSecondaryIndexes: [
		{
			IndexName: 'skIndex',
			KeySchema: [
				{
					AttributeName: 'sk',
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

exports.schemas = schemas;
