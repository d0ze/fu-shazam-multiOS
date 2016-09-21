This program fetches the last 30 songs you tagged with your Shazam application and automatically creates a playlist on your SoundCloud.

You need to fill out the conf.json file with the path to the json database the shazam app is using to store information.
On Windows this path might look something like

```
/Users/username/AppData/Local/Packages/ShazamEntertainmentLtd.Shazam_pqbynwjfrbcg4/LocalState/AppState.json
```

On Mac 

```
/Users/username/Library/Group Containers/#######.group.com.shazam/com.shazam.mac.Shazam/ShazamDataModel.sqlite
```
Also, fill in your soundcloud username and password to enable the creation of the
playlist from your account.
