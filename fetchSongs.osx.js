const sqlite3 = require ('sqlite3')
const uglyQuery = "SELECT DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years')  as `ZDATE`, `ZTRACKNAME`, `ZNAME`, `ZALBUMARTURLSTRING`, count(`ZTRACKNAME`) as `ZCOUNT`   \
FROM `ZSHTAGRESULTMO` LEFT JOIN `ZSHARTISTMO` ON `ZSHTAGRESULTMO`.Z_PK = `ZSHARTISTMO`.ZTAGRESULT                                                                              \
WHERE DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years') BETWEEN DATETIME('now', '-1 month') AND DATETIME('now')                                                        \
GROUP BY `ZTRACKNAME`                                                                                                                                                          \
ORDER BY `ZCOUNT` DESC                                                                                                                                                         \
LIMIT 30"


module.exports = (path, mode, cb) => {
	if (mode === 'last') throw new Error('Unsupported mode')
	const db = new sqlite3.Database(path, sqlite3.OPEN_READONLY, (err) => {
		if (err) return cb(err)
		db.all(uglyQuery, (err, rows) => {
			if (err) return cb(err)
			return cb(null, rows)
		})
	})
}
