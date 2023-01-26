const { CreateTableCommand, DeleteTableCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const { schemas } = require('../db/tables');

exports.CreateTable = async (db, table) => {
	try {
		await db.send(new DeleteTableCommand({ TableName: table }));
	} catch (e) {
		console.log(`${table} not exist`);
	}

	try {
		await db.send(new CreateTableCommand({ TableName: table, ...schemas[table] }));

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(error);
	}
};

exports.InsertItems = async (db, table, items) => {
	const requests = items.map(item => ({
		PutRequest: {
			Item: item
		}
	}));

	const params = {
		RequestItems: {}
	};

	params.RequestItems[table] = requests;

	try {
		await db.send(new BatchWriteItemCommand(params));

		return Promise.resolve();
	} catch (error) {
		return Promise.reject(error);
	}
};

const getRandom = (min, max, decimals = 2) => parseFloat(Math.random() * (max - min) + min).toFixed(decimals);

const now = new Date();

const row = (i, { roomId, hotelId, stayId, processed }) => {
	const timestamp = (now.getTime() - 1000 * i) / 1000;

	const obj = {
		roomId: { S: roomId },
		timestamp: { N: timestamp },
		processed: { N: processed },
		hotelId: { S: hotelId },
		measures: {
			M: { watt: { N: getRandom(5, 15) }, h2o: { N: getRandom(5, 15) } }
		}
	};

	if (stayId) obj.stayId = { S: stayId };

	return obj;
};

exports.generateRawData = (n, info) => [...Array(n).keys()].map(i => row(i, info));
