How data is encoded
===================

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

Multiple parameters can be assigned by delimiting with ␟ (\u241f), which is the Unicode unit separator character. r.

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

A contract consuming this data should be prepared to make the necessary type conversion, most typically by casting a `bytes32` value into `uint` (for an unsigned number).


