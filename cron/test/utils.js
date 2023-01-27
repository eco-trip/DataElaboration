const getRandom = (min, max, decimals = 2) => parseFloat(Math.random() * (max - min) + min).toFixed(decimals);

const now = new Date();

const row = (i, { roomId, hotelId, stayId, processed, measures }) => {
	const timestamp = (now.getTime() - 1000 * i) / 1000;

	const obj = {
		roomId: { S: roomId },
		timestamp: { N: timestamp },
		processed: { N: processed },
		hotelId: { S: hotelId }
	};

	if (stayId) obj.stayId = { S: stayId };

	if (measures) obj.measures = { M: measures };
	else
		obj.measures = {
			M: {
				room_temperature: { N: getRandom(15, 25) },
				humidity: { N: getRandom(60, 90) },
				brightness: { N: getRandom(2, 100) },
				hot_water_temperature: { N: getRandom(30, 40) },
				cold_water_temperature: { N: getRandom(7, 12) },
				hot_flow_rate: { N: getRandom(0, 5) },
				cold_flow_rate: { N: getRandom(0, 5) },
				current: { N: getRandom(1, 2000) },
				sample_duration: { N: 5 }
			}
		};

	return obj;
};

exports.generateRawData = (n, info) => [...Array(n).keys()].map(i => row(i, info));
