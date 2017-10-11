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

var menuItems = {
    "Se présenter" : {
        item : "greetings"
    },
    "Réserver" :{
        item : "resa"
    }
}

bot.dialog('greetings', [
    function (session) { 
        session.send('Bienvenue dans le bot Résa');
        session.beginDialog('askName');
    },
    function (session, results) {
        session.userData.userName = results.response;
        session.send(`Bonjour ${session.userData.userName}`);
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
        session.beginDialog('resaNbPeople');
    },
    function (session) {
        session.beginDialog('resaName');
    },
    function (session) {
        session.beginDialog('resaTel');
    },
    function (session) {
        var resa = {
            resaDate: session.conversationData.resaDate,
            resaNbPeople: session.conversationData.resaNbPeople,
            resaName: session.conversationData.resaName,
            resaTel: session.conversationData.resaTel,            
        }

        resa.resaDate = new Date(Date.parse(resa.resaDate));
        resa.resaDate = resa.resaDate.toISOString().substr(0, 19).replace('T', ' ');  

        session.send(`Date : ${resa.resaDate}<br>Nombre de personne : ${resa.resaNbPeople}<br>Résa au nom de ${resa.resaName}<br>Tel : ${resa.resaTel}`);
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

bot.dialog('resaNbPeople', [
    function (session) {
        builder.Prompts.number(session, "Combien de personne ?");
    },
    function (session, results) {
        session.conversationData.resaNbPeople = results.response;
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

bot.dialog('resaTel', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Le numéro doit contenir 10 chiffres et commencer par 06 ou 07");
        } else {
            builder.Prompts.text(session, "Votre numéro de tel ?");
        }
    },
    function (session, results) {
        var matched = results.response.match(/^(01|06|07)[0-9]{8}$/g);
        if (matched) {
            session.conversationData.resaTel = results.response;
            session.endDialog();
        } else {
            session.replaceDialog('resaTel', { reprompt: true });
        }
    }
]);
