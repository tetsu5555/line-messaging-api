ProcfileはHerokuにプログラムの起動方法を教えるために設定ファイル

# Herokuに環境変数をセットする

```
$ heroku config:set LINE_CHANNEL_ID=あなたのChannel ID
$ heroku config:set LINE_CHANNEL_SECRET=あなたのChannel Secret
$ heroku config:set LINE_ACCESS_TOKEN=あなたのアクセストークン
```