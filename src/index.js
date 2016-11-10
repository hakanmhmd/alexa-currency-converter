var APP_ID = "amzn1.ask.skill.51de6423-881f-4698-a3c3-92ce34665d26";
var APP_NAME = "Currency exchange";

var BASE_URL = "https://currency-exchange.p.mashape.com";

var https = require('https');
var unirest = require('unirest')

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var MyApp = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MyApp.prototype = Object.create(AlexaSkill.prototype);
MyApp.prototype.constructor = MyApp;

MyApp.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("MyApp onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

MyApp.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("MyApp onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    response.ask("What currencies would you like me to look up?", "Say a currency, like 'USD Dollar', or say 'help' for additional instructions.");
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
MyApp.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("MyApp onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

MyApp.prototype.intentHandlers = {
    "GetExchangeRate": function (intent, session, response) {
        var currFrom = intent.slots.CURRENCY_FROM;
        var currTo = intent.slots.CURRENCY_TO;
        console.log(currFrom.value + ' to ' + currTo.value + " " + intent.slots.AMOUNT.value);
        var amount = 1.0;
        if(intent.slots.AMOUNT.value){
            amount = intent.slots.AMOUNT.value;
        }
        if(!currFrom.value || !currTo.value){
            if(!currFrom.value && !currTo.value){
                response.ask("I didn't quite get that. Please provide currency from and to?")
            } else if(!currFrom.value){
                response.ask("I didn't quite get that. Which currency from do you want me to convert?");
            } else {
                response.ask("I didn't quite hear that. What currency to do you want me to convert?");
            }
        }else{
            handleRequest(currFrom.value, currTo.value, amount, response);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("I can tell you the currency exchange between various currencies.");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        response.tell("Bye. Thanks for using my services.");
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        response.tell("Bye. Thanks for using my services.");
    }
};

function handleRequest(currFrom, currTo, amount, response) {
    getCurrencyExchange(currFrom, currTo, amount, function(err, body){
        var speechOutput;

        if (err) {
            if (err=='undefiend'){
                speechOutput += "Sorry, the currency converter service can not process your request, please try again.";
            }
            else {
                speechOutput += "Sorry, the currency converter service is experiencing a problem with your request. Please say just a number.";
            }
            
        } else {
            
            var result = body;
            
            speechOutput = 'There you go: ' + amount + ' ' + currFrom + ' equals to ' + result + ' ' + currTo;
            
        }

        response.tell(speechOutput);
    });
}

function getCurrencyExchange(currFrom, currTo, amount, callback){

    var url = BASE_URL + '/exchange?from= + ' + currFrom + '&q=' + amount + '&to=' + currTo;
    unirest.get(url)
    .header("X-Mashape-Key", "NqqBVS33W2mshhldQgiS8ZOCG4F2p1ymJ2xjsnwcqtIjHZw32r")
    .header("Accept", "text/plain")
    .end(function (result) {
        console.log(result.body)
        console.log(typeof result.body)
        if(result.body === '0'){
            callback(new Error('Error has occured'));
        } else {
            callback(null, result.body);
        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the MyApp skill.
    var skill = new MyApp();
    skill.execute(event, context);
};
