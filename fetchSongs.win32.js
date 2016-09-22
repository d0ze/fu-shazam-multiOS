const fs = require('fs')
function sortByFrequency(array) {
    var frequency = {};

    array.forEach(function(value) { frequency[value] = 0; });

    var uniques = array.filter(function(value) {
        return ++frequency[value] == 1;
    });

    return uniques.sort(function(a, b) {
        return frequency[b] - frequency[a];
    });
}
module.exports = (path, mode, cb) => {

	try {
 		const obj = JSON.parse(fs.readFileSync(path));
	}
	catch (e) { return cb(e) }
	const rows = obj.mytags.map(function(el) {
	  return {
	      name: el.v3.track.heading.title, artist: el.v3.track.heading.subtitle
  	}

  })
		console.log(rows)
	if (mode === 'top') {
		sortByFrequency(rows);
		return cb(null, rows.slice(1, 31))

	}else if (mode == 'last'){
  	return cb(null, rows.slice(rows.length-30, rows.length))
}
}
