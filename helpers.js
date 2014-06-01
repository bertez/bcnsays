/* global exports */
var districts = [
	{
		name: 'Ciutat Vella',
		id: 'cv',
		coords: [2.17392, 41.38312] 
	},
	{
		name: 'Eixample',
		id: 'ei',
		coords: [2.16165, 41.39194] 
	},
	{
		name: 'Gràcia',
		id: 'gr',
		coords: [2.15422, 41.40482] 
	},
	{
		name: 'Horta Guinardó',
		id: 'hg',
		coords: [2.16757, 41.42088] 
	},
	{
		name: 'Les Corts',
		id: 'lc',
		coords: [2.13098, 41.38402] 
	},
	{
		name: 'Nou Barris',
		id: 'nb',
		coords: [2.1789, 41.4462] 
	},
	{
		name: 'Sant Andreu',
		id: 'sa',
		coords: [2.19132, 41.43589] 
	},
	{
		name: 'Sant Martí',
		id: 'sm',
		coords: [2.19924, 41.4157] 
	},
	{
		name: 'Sants-Montjuic',
		id: 'sn',
		coords: [2.1371, 41.37481] 
	},
	{
		name: 'Sarrià-Sant Gervasi',
		id: 'sr',
		coords: [2.12354, 41.39738] 
	}
];

var distance = function(point1, point2) {
	var xs = 0;
	var ys = 0;

	xs = point2[0] - point1[0];
	xs = xs * xs;

	ys = point2[1] - point1[1];
	ys = ys * ys;

	return Math.sqrt( xs + ys );
};

var comparator = function(a, b) {
	if(a.distance < b.distance) {
		return -1;
	}

	if(a.distance > b.distance) {
		return 1;
	}

	return 0;
};

exports.closest = function(point) {
	var distance_list = [];
	districts.forEach(function(district) {
		distance_list.push({
			name: district.name,
			id: district.id,
			coords: district.coords,
			distance: distance(district.coords, point)
		});
	});


	var chosen = distance_list.sort(comparator)[0];

	return chosen || {};
};

exports.districts = districts;
