var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);

// Add global LUIS recognizer to bot
var model = process.env.model || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2d928276-4b2f-4ffa-8adc-b19271682b44?subscription-key=85104b00ebda46949246c9828ee9f281&timezoneOffset=0.0&verbose=true';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });


server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', dialog);
bot.use(builder.Middleware.sendTyping());

// Intent: greetings
dialog.matches('greetings', [
	function (session, args, next) {
		var entity = args.entities[0].type;
		session.send("greetings now");
		session.send(entity);

		// show the message only in slack
		if (session.message.address.channelId === 'slack') {
			session.send('you are using slack');
			session.send(session.message.address.from.id);
			session.send(session.message.address.recipient.id);
		}
    },
]);

// Intent: None
dialog.matches('None', [
	function (session, args, next) {
		session.send("I don't know what is the meaning");
    },
]);