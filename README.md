# Alexa-currency-converter
![logo](/images.jpeg)

Skill set for Alexa to convert between currencies.

So far the model only accepts certain representations for each currency. For more information, check the file currency.js in the repository.

If you want to replicate the project:

* Define the skill in [Amazon Alexa skill page](https://developer.amazon.com/edw/home.html#/).
* Copy the interation files - the intent schema, the custom slot type and the sample utterances to train the model.
* Upload the archive in a [AWS Lambda](https://aws.amazon.com/lambda/details/) function.
* Test the model
