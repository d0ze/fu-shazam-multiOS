const fs = require('fs')
module.exports = (path, mode, cb) => {
	if (mode === 'top') throw new Error('Unsupported mode')
	try {
 		const obj = JSON.parse(fs.readFileSync(path));
	}
	catch (e) { return cb(e) }
	const rows = obj.mytags.map(function(el) {
	  return {
	      name: el.v3.track.heading.title, artist: el.v3.track.heading.subtitle
  	}
  })

  return cb(null, rows.slice(Math.max(rows.length - 30)))
}
