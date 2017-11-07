var restify = require('restify');
var builder = require('botbuilder');
var cognitivesServices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector);

var luisEndpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bd8c2db4-5498-493c-97b3-a6d2811d60ab?subscription-key=f789b8203ab44f969f28ed468141a986&verbose=true&timezoneOffset=0";
var luisRecognizer = new builder.LuisRecognizer(luisEndpoint);
bot.recognizer(luisRecognizer);

bot.dialog('HomePilot', [
    function (session, args, next) {
        var intentResult = args.intent;
        if (intentResult.score > 0.7) {
            // var entities = builder.EntityRecognizer.findEntity(intentResult.entities, 'HomeAutomation.Device');
            session.send(`Your intent ${intentResult.intent}`);
            intentResult.entities.forEach(function (element) {
                session.send(`Entity: ${element.entity}`);
                session.send(`Type: ${element.type}`);
                session.send(`------------------------`);
            }, this);
        }
        else {
            session.send(`I do not understand your request`);
        }
    }
]).triggerAction({
    matches: ['HomeAutomation.TurnOn', 'HomeAutomation.TurnOff']
});
