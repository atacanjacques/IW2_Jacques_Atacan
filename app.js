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


var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.beginDialog('greetings');
    }
]);

bot.dialog('greetings', [
    function (session) {
        session.send('Bienvenue dans le bot Résa');
        session.beginDialog('askName');
    },
    function (session, results) {
        session.userData.userName = results.response;
        session.send('Bonjour %s!', session.userData.userName);
        session.beginDialog('resa');
    }
]);

bot.dialog('askName', [
    function (session) {
        builder.Prompts.text(session, 'Quel est votre nom ?');
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('resa', [
    function (session) {
        session.beginDialog('resaDate');
    },
    function (session, results) {
        session.beginDialog('resaNumber');
    },
    function (session) {
        session.beginDialog('resaName');
    },
    function (session) {
        var resa = {
            resaDate: session.conversationData.resaDate,
            resaNb: session.conversationData.resaNb,
            resaName: session.conversationData.resaName
        }

        resa.resaDate = new Date(Date.parse(resa.resaDate));
        resa.resaDate = resa.resaDate.toDateString();

        session.send('Date: ' + resa.resaDate);
        session.send('Nombre de personne: ' + resa.resaNb);
        session.send('Résa au nom de: ' + resa.resaName);
    }
]);

bot.dialog('resaDate', [
    function (session) {
        builder.Prompts.time(session, "Pour quand voulez vous résérvez ?");
    },
    function (session, results) {
        session.conversationData.resaDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.endDialog();
    }
]);

bot.dialog('resaNumber', [
    function (session) {
        builder.Prompts.number(session, "Combien de personne ?");
    },
    function (session, results) {
        session.conversationData.resaNb = results.response;
        session.endDialog();
    }
]);

bot.dialog('resaName', [
    function (session) {
        builder.Prompts.text(session, "Résa au nom de qui ?");
    },
    function (session, results) {
        session.conversationData.resaName = results.response;
        session.endDialog();
    }
]);