const fs = require('fs')
function sortByFrequency(array) {
    var frequency = {};

    array.forEach(function(value) { frequency[value.name] = 0; });

    uniques = array.filter(function(value) {
        return ++frequency[value.name] == 1;
    });

    return uniques.sort(function(a, b) {
        return frequency[b.name] - frequency[a.name] ;
    });
}
module.exports = (path, mode, cb) => {

  const obj = JSON.parse(fs.readFileSync(path, 'utf8'));
	const rows = obj.mytags.map(function(el) {

	  return {

	      name: el.v3.track.heading.title, artist: el.v3.track.heading.subtitle
  	}

  })

	if (mode === 'top') {
		var rows_ordered = sortByFrequency(rows);

		return cb(null, rows_ordered.slice(0, 31))

	}else if (mode == 'last'){
  	return cb(null, rows.slice(rows.length-30, rows.length+1))
}
}
