const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

if (process.env.Env === 'local' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
	dotenv.config({ path: path.resolve(__dirname, '.env.development') });
} else {
	dotenv.config();
}

const { Env } = process.env;
const { queryDataToProcess, getHotelInfo } = require('./helpers/lib');

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

	try {
		const result = await queryDataToProcess();
		console.log('source', result);
	} catch (error) {
		return response(500, error);
	}

	try {
		const hotel = await getHotelInfo('1');
		console.log('hotel', hotel);
	} catch (error) {
		return response(500, error);
	}

	return response(200, 'ok');
};
