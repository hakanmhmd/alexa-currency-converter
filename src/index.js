var APP_ID = "amzn1.ask.skill.51de6423-881f-4698-a3c3-92ce34665d26";
var APP_NAME = "Currency exchange";

var BASE_URL = "https://api.fixer.io/latest?symbols=";

var https = require('https');
var unirest = require('unirest');
var lowerCase = require('lower-case');
var upperCase = require('upper-case');
var symbols = require('./currencies.js');

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var CurrencyConverter = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
CurrencyConverter.prototype = Object.create(AlexaSkill.prototype);
CurrencyConverter.prototype.constructor = CurrencyConverter;

CurrencyConverter.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("CurrencyConverter onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

CurrencyConverter.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("CurrencyConverter onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    response.ask("What currencies would you like me to look up?", "Say a currency, like 'USD Dollar', or say 'help' for additional instructions.");
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
CurrencyConverter.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("CurrencyConverter onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

CurrencyConverter.prototype.intentHandlers = {
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
            // if currency was given by its full name, not the symbol
            var from = currFrom.value
            var to = currTo.value
            if(symbols.currencies[lowerCase(currFrom.value)]){
                from = upperCase(symbols.currencies[lowerCase(currFrom.value)])
            }
            if(symbols.currencies[lowerCase(currTo.value)]){
                to = upperCase(symbols.currencies[lowerCase(currTo.value)])
            }
            // send the data to API endpoint
            handleRequest(from, to, amount, response);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("I can tell you the currency exchange between various currencies. What exchange rate do you want me to get for you?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        response.tell("Bye. Thanks for using my services.");
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        response.tell("Bye. Thanks for using my services.");
    }
};

function handleRequest(currFrom, currTo, amount, response) {
    getCurrencyExchange(currFrom, currTo, amount, function(err, result){
        if (err) {
            response.tell('Sorry, the currency converter service is experiencing a problem with your request. Please provide real currencies.');
        } else {
            response.tell('There you go: ' + amount + ' ' + currFrom + ' equals to ' + result + ' ' + currTo);   
        }
    });
}

function getCurrencyExchange(currFrom, currTo, amount, callback){
    var url = BASE_URL + currFrom + ',' + currTo;
    console.log(url);
    unirest.get(url)
    .header("Accept", "text/plain")
    .end(function (result) {
        var body = result.raw_body
        json = JSON.parse(body)
      
        console.log(json)

        if(Object.keys(json.rates).length != 2){
            callback(new Error('Error has occured'));
        } else {
            
            answer = Number(json.rates[currTo]) * amount;
            callback(null, answer.toFixed(3));
        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the CurrencyConverter skill.
    var skill = new CurrencyConverter();
    skill.execute(event, context);
};

