How Data Is Encoded
=============

Encoding questions
------------------

Questions consist of a JSON string, like the following: 

.. code-block:: json
   :linenos:

   {
      "title": "Did Donald Trump win the 2016 presidential election?", 
      "type": "bool", 
      "category": "politics"
   }

The system requires all data that is used in both questions and answers to be sent via the Ethereum blockchain. It is not sufficient to store the question data in an off-chain system such as IPFS, as the system needs to be sure that all participants were able to access the text.

Once a question has been sent to the contract, it stores the plaintext it has seen in the event logs, and stores the hash of the content in contract storage.

To minimize the amount of data that needs to be sent to the blockchain, questions are broken into two parts: A question template, and the question parameters that will be interpolated into the template. Parameters are treated like `sprintf` arguments.

Multiple parameters can be assigned by delimiting with ␟ (\u241f), which is the Unicode unit separator character. TODO: Change this to a normal JSON array?

A template should consist of JSON-encoded data, with placeholders for parameters. The system is deployed with a generic built-in template for each question type, such as the following, deployed with template ID 0:

.. code-block:: json
   :linenos:

   {
      "title": "%s", 
      "type": "bool", 
      "category": "%s" 
   }

The category parameter is optional, so a simple binary question can be created with the Template ID 0 and the question text as the single parameter.

If you want to create many similar requests, it will be more efficient to create your own template. For example, a flight insurance app might have: 

.. code-block:: json
   :linenos:

   {
     "title": "Was flight %s on date %s delayed by more than 3 hours?", 
     "type": "bool", 
     "category": "flight-information"
   }

Having deployed this template and got its numerical ID, this can then be called with a string including only the flight number, the delimiter and the date, eg: MH17␟2017-12-01

Encoding answers
----------------

The answer must be expressed in terms of `bytes32` data. This may encode a number, a hash of some text, a number representing a selection specified in the JSON question definition, or boolean values for multiple options combined in a bitmask.

A contract consuming this data should be prepared to make the necessary type conversion, most typically by casting a `bytes32` value into `uint` (for an unsigned number) or `int` (for a signed number).

Information unavailability and "null" responses
-----------------------------------------------

The issue of at what point a question is decided, and in what ways it may be reported as undecided, is quite complex. Some uses require reporters to provide the best information available to them at the time, while others are not interested in an answer until it is reasonably clear. Many contracts will only be interested in a positive answer, eg an insurance contract might be interested in finding out when your house has burned down, but have no interest in the infinite number of occasions on which it did not burn down.

The handling of null, undecided or unclear answers is considered outside the scope of the system and left to the terms of each individual question. The terms of the question may designate a particular value or range of values to mean things like "undecided" or "uncertain". They may also specify the level of certainty and/or finality that should be applied when evaluating the result at any given time. Where the question does not specify the necessary terms, an arbitrator may choose to publish their own policy specifying how they will treat these issues if asked to decide on them.

There is no way to pause a question once it has been asked, so if the answer to a question at any given time is "null" or "undecided" or "too early to sensibly ask", these values may be be settled on as the final result. Contracts consuming this data should be prepared to simply reject any answer they are not interested in, and wait for the same question to be asked again and get an answer in the range that does interest them. 

After settlement Reality Check will preserve information about the question hash, arbitrator, timeout, final bond, and finalization date, so consuming contracts can ask a user to send them a question ID, then verify that it meets the minimum conditions it requires to trust the information. We also provide a wrapper contract that will allow contracts to request an answer meeting its conditions. This allows consumer contracts to send a request and receive a callback, sent by an arbitrary user in return for a fee, on a similar model to the Ethereum Alarm Clock.
