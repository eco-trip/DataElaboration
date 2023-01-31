const { toFixedNumber } = require('../helpers/lib');

const getRandom = (min, max, decimals = 2) => parseFloat(Math.random() * (max - min) + min);

const now = new Date();

const row = (i, obj, measures) => {
	const timestamp = (now.getTime() - 1000 * i) / 1000;
	const ret = { ...obj, sample_duration: 5 };

	if (!ret.timestamp) ret.timestamp = timestamp;
	if (measures) ret.measures = { ...measures };
	else
		ret.measures = {
			room_temperature: toFixedNumber(getRandom(15, 25)),
			humidity: toFixedNumber(getRandom(60, 90)),
			brightness: toFixedNumber(getRandom(2, 100)),
			hot_water_temperature: toFixedNumber(getRandom(30, 40)),
			cold_water_temperature: toFixedNumber(getRandom(7, 12)),
			hot_flow_rate: toFixedNumber(getRandom(0, 5)),
			cold_flow_rate: toFixedNumber(getRandom(0, 5)),
			current: toFixedNumber(getRandom(1, 2000))
		};

	return ret;
};

exports.generateRawData = (n, info, measures = []) => [...Array(n).keys()].map(i => row(i, info, measures[i]));
