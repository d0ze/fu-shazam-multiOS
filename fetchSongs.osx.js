const sqlite3 = require ('sqlite3')
const uglyQuery =
	{ top: "SELECT DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years') as `FZDATE`, `ZTRACKNAME` as `name`, `ZNAME` as `artist`, `ZALBUMARTURLSTRING`, count(`ZTRACKNAME`) as `ZCOUNT` \
					FROM `ZSHTAGRESULTMO` LEFT JOIN `ZSHARTISTMO` ON `ZSHTAGRESULTMO`.Z_PK = `ZSHARTISTMO`.ZTAGRESULT \
					WHERE `FZDATE` BETWEEN DATETIME('now', '-1 month') AND DATETIME('now') \
					GROUP BY `ZTRACKNAME` \
					ORDER BY `ZCOUNT` DESC \
					LIMIT 30",
		last: "SELECT DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years') as `FZDATE`, `ZTRACKNAME` as `name`, `ZNAME` as `artist`, `ZALBUMARTURLSTRING` \
					FROM `ZSHTAGRESULTMO` LEFT JOIN `ZSHARTISTMO` ON `ZSHTAGRESULTMO`.Z_PK = `ZSHARTISTMO`.ZTAGRESULT \
					WHERE `FZDATE` BETWEEN DATETIME('now', '-1 month') AND DATETIME('now') \
					ORDER BY `ZSHTAGRESULTMO`.Z_PK DESC \
					LIMIT 30 "
	}


module.exports = (path, mode, cb) => {
	const db = new sqlite3.Database(path, sqlite3.OPEN_READONLY, (err) => {
		if (err) return cb(err)
		db.all(uglyQuery[mode], (err, rows) => {
			if (err) return cb(err)
			return cb(null, rows)
		})
	})
}
