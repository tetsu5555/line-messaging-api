// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const axiosBase = require('axios'); // axios を require してインスタンスを生成する

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

const axios = axiosBase.create({
    baseURL: 'https://api.line.me/v2/bot', // バックエンドB のURL:port を指定する
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
    },
    responseType: 'json'
});

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    let userIds = [];

    const reply = [
        // {
        //     "type": "sticker",
        //     "packageId": "1",
        //     "stickerId": "1"
        // }
        // {
        //     "type": "template",
        //     "altText": "This is a buttons template",
        //     "template": {
        //         "type": "buttons",
        //         "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
        //         "imageAspectRatio": "rectangle",
        //         "imageSize": "cover",
        //         "imageBackgroundColor": "#FFFFFF",
        //         "title": "Menu",
        //         "text": "Please select",
        //         "defaultAction": {
        //             "type": "uri",
        //             "label": "View detail",
        //             "uri": "http://example.com/page/123"
        //         },
        //         "actions": [
        //             {
        //                 "type": "postback",
        //                 "label": "Buy",
        //                 "data": "action=buy&itemid=123"
        //             },
        //             {
        //                 "type": "postback",
        //                 "label": "Add to cart",
        //                 "data": "action=add&itemid=123"
        //             },
        //             {
        //                 "type": "uri",
        //                 "label": "View detail",
        //                 "uri": "http://example.com/page/123"
        //             }
        //         ]
        //     }
        // }
        {
            "type": "template",
            "altText": "this is a confirm template",
            "template": {
                "type": "confirm",
                "text": "Are you sure?",
                "actions": [
                    {
                        "type": "message",
                        "label": "Yes",
                        "text": "yes"
                    },
                    {
                        "type": "message",
                        "label": "No",
                        "text": "no"
                    }
                ]
            }
        }
        // {
        //     "type": "button",
        //     "action": {
        //         "type": "uri",
        //         "label": "Tap me",
        //         "uri": "https://example.com"
        //     },
        //     "style": "primary",
        //     "color": "#0000ff"
        // }
    ]


    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        axios.get(`/profile/${event.source.userId}`)
            .then(function (response) {
                // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
                if (event.type == "message" && event.message.type == "text") {
                    // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
                    if (event.message.text == "こんにちは") {
                        // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                        events_processed.push(bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: `これはこれは、${response.data.displayName}様`
                        }));
                    } else if (event.message.text == "ボタン") {
                        // bot.replyMessage(event.replyToken, {
                        //     type: "text",
                        //     text: "ボタン送りたい"
                        // })
                        axios.post("/message/push", {
                            to: event.source.userId,
                            messages: reply
                        })
                    } else if (event.message.text == "登録一覧") {
                        events_processed.push(bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: `ids: ${userIds}`
                        }));
                    } else {
                        events_processed.push(bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: `こんにちは`
                        }));
                    }
                }
            })
            .catch(function (error) {
                console.log('ERROR!! occurred in Backend.')
            });
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});