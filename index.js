const async = require('async')
const moment = require('moment')
const _ = require('lodash')
const SC = require('soundcloud-nodejs-api-wrapper')
const retry = require('retry')
const fs = require('fs')

const program = require('commander');

var fetchSongs
if (process.platform == 'win32') fetchSongs = require('./fetchSongs.win32.js')
else if (process.platform == 'darwin') fetchSongs = require('./fetchSongs.osx.js')
else throw new Error('Platform not supported.')

program
  .version('0.1.0')
  .option('-m, --mode <mode>', 'Accepted modes: top, last.')
  .option('-t, --top', 'Alias for -m top. Publishes the 30 most played songs')
  .option('-l, --last', 'Alias for -m last. Last pusblishes the last 30')
  .parse(process.argv);
console.log(program)
if (program.top) program.mode = 'top'
if (program.last) program.mode = 'last'

if (program.mode === undefined) throw new Error('You must specify a mode to run. Use --help to learn more.')
const config = JSON.parse(fs.readFileSync('./conf.json', 'utf8'))

const corkyString = "<p>This playlist is automatically generated from my Shazam tagged songs.</p> <p> Feel free to message me for more info. </p>"

const operation = retry.operation({minTimeout: 5000})

const publishPlaylist = (attempt) => {
  console.log('Attempting to publish playlist for the ' + attempt + ' time')
  const sc = new SC(config.credentials)
  const client = sc.client()

  client.exchange_token(function(err, tok, bho, res) {
    if (operation.retry(err)) return
    const access_token = res.access_token;
    const clientnew = sc.client({access_token : access_token});

    fetchSongs(config.DB, program.mode, (err, rows) => {
      if (operation.retry(err)) return
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
    })
  })
}

operation.attempt(publishPlaylist)
