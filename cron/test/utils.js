const { normalizeSample } = require('../helpers/lib');

const getRandom = (min, max, decimals = 2) => parseFloat(Math.random() * (max - min) + min).toFixed(decimals);

const now = new Date();

const row = (i, obj, measures) => {
	const timestamp = (now.getTime() - 1000 * i) / 1000;
	const ret = { ...obj };

	if (!ret.timestamp) ret.timestamp = timestamp;
	if (measures) ret.measures = { ...measures };
	else
		ret.measures = {
			room_temperature: parseFloat(getRandom(15, 25)),
			humidity: parseFloat(getRandom(60, 90)),
			brightness: parseFloat(getRandom(2, 100)),
			hot_water_temperature: parseFloat(getRandom(30, 40)),
			cold_water_temperature: parseFloat(getRandom(7, 12)),
			hot_flow_rate: parseFloat(getRandom(0, 5)),
			cold_flow_rate: parseFloat(getRandom(0, 5)),
			current: parseFloat(getRandom(1, 2000)),
			sample_duration: 5
		};

	return ret;
};

exports.generateRawData = (n, info, measures = []) => [...Array(n).keys()].map(i => row(i, info, measures[i]));

exports.compareElaboration = (target, { roomId, stayId, hotelId, measures }) => {
	expect(target.roomId).toBe(roomId);
	expect(target.stayId).toBe(stayId);
	expect(target.hotelId).toBe(hotelId);
	expect(target.samples).toBe(measures.length);
	expect(target.current).toBe(measures.reduce((t, i) => t + normalizeSample(i.current, i.sample_duration), 0));
	expect(target.cold_flow_rate).toBe(
		measures.reduce((t, i) => t + normalizeSample(i.cold_flow_rate, i.sample_duration), 0)
	);
	expect(target.hot_flow_rate).toBe(
		measures.reduce((t, i) => t + normalizeSample(i.hot_flow_rate, i.sample_duration), 0)
	);
	expect(target.co2).toBeDefined();
	expect(target.points).toBeDefined();
};
