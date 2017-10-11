var builder = require('botbuilder');
var restify = require('restify');

// restify server
var server = restify.createServer();
server.listen(process.env.port || 3978, function () {
    console.log(`server name:${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, function (session) {

    bot.dialog('greetings', [
        function (session) {
            session.beginDialog('askName');
        },
        function (session, results) {
            session.endDialogWithResult('Hello %s!', results.response);
        }
    ]);

    bot.dialog('askName', [
        function (session) {
            builder.Prompts.text(session, 'Hi! What is your name?');
        },
        function (session, results) {
            session.endDialogWithResult(results);
        }
    ]);

});