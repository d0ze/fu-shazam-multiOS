const async = require('async')
const moment = require('moment')
const _ = require('lodash')
const SC = require('soundcloud-nodejs-api-wrapper')
const sqlite3 = require ('sqlite3')
const retry = require('retry')
const fs = require('fs')

const config = JSON.parse(fs.readFileSync('./conf.json', 'utf8'))




const corkyString = "<p>This playlist is automatically generated from my Shazam tagged songs.</p> <p> Feel free to message me for more info. </p>"

const uglyQuery = "SELECT DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years')  as `ZDATE`, `ZTRACKNAME`, `ZNAME`, `ZALBUMARTURLSTRING`, count(`ZTRACKNAME`) as `ZCOUNT`   \
FROM `ZSHTAGRESULTMO` LEFT JOIN `ZSHARTISTMO` ON `ZSHTAGRESULTMO`.Z_PK = `ZSHARTISTMO`.ZTAGRESULT                                                                              \
WHERE DATETIME(`ZDATE`, 'unixepoch', 'localtime', '+31 years') BETWEEN DATETIME('now', '-1 month') AND DATETIME('now')                                                        \
GROUP BY `ZTRACKNAME`                                                                                                                                                          \
ORDER BY `ZCOUNT` DESC                                                                                                                                                         \
LIMIT 30"

const operation = retry.operation({minTimeout: 5000})

const publishPlaylist = (attempt) => {
  console.log('Attempting to publish playlist for the ' + attempt + ' time')
  const sc = new SC(config.credentials)
  const client = sc.client()

  client.exchange_token(function(err, tok, bho, res) {
    if (operation.retry(err)) return
    const access_token = res.access_token;
    const clientnew = sc.client({access_token : access_token});

    var isWin = process.platform
    console.log("OS" + isWin)
    if(isWin == 'win32'){
    var obj = JSON.parse(fs.readFileSync(config.DB));

    const rows =  obj.mytags.map(function(el) {

      return {
          name: el.v3.track.heading.title, artist: el.v3.track.heading.subtitle
        }
      })

        rows.slice(Math.max(rows.length - 20))
        async.map(rows, function(row, cb) {
          clientnew.get('/tracks', {q : row.artist + ' ' + row.name }, (err, result) => {
            if (operation.retry(err)) return
            const selected = result[0];
            if (!_.isUndefined(selected)) {
              return cb(null, {id: selected.id})
            } else {
              console.error('Track not found ' + row.name + ' by ' + row.artist)
              return cb(null, {id: null})
            }
          })
        } , function(err, trackIds) {
          if (operation.retry(err)) return
          const fTrackIds = _.filter(trackIds, (t) => { return !_.isNull(t) } )
          const title = moment().format('MMMM YYYY')
          clientnew.post('/playlists', JSON.stringify({playlist: {title: title, tracks: fTrackIds, sharing: 'public', description: corkyString}}), (err, result) => {
            if (operation.retry(err)) return
            else console.log('done')
          })
        })
      } else {
        const db = new sqlite3.Database(config.DB, sqlite3.OPEN_READONLY, (err) => {
      if (operation.retry(err)) return

      db.all(uglyQuery, (err, rows) => {
        if (operation.retry(err)) return

        async.map(rows, function(row, cb) {
          clientnew.get('/tracks', {q : row.ZNAME + ' ' + row.ZTRACKNAME }, (err, result) => {
            if (operation.retry(err)) return
            const selected = result[0];
            if (!_.isUndefined(selected)) {
              return cb(null, {id: selected.id})
            } else {
              console.error('Track not found ' + row.ZTRACKNAME + ' by ' + row.ZNAME)
              return cb(null, {id: null})
            }
          })
        } , function(err, trackIds) {
          if (operation.retry(err)) return
          const fTrackIds = _.filter(trackIds, (t) => { return !_.isNull(t) } )
          const title = moment().format('MMMM YYYY')
          clientnew.post('/playlists', JSON.stringify({playlist: {title: title, tracks: fTrackIds, sharing: 'public', description: corkyString}}), (err, result) => {
            if (operation.retry(err)) return
            else console.log('done')
          })
        })
      })
})
      }


  })
}

operation.attempt(publishPlaylist)
