Using Reality Check from a contract
=====================================

Fetching information
--------------------

The simplest way use for Reality Check is to fetch some information for a question that has already been posted using the DApp.

Hovering your mouse over the "..." mark in the upper right-hand corner of a question will show you the question ID and the hash of the question content.

IMAGE GOES HERE

Fetching the answer to a particular question
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Each question can be referred to by its ``question_id``, which is a ``bytes32``. 

There is only one question with any given ``question_id``, and there can only be one corresponding answer.

You can fetch the final answer for a question by calling 

.. code-block:: javascript
   :linenos:

   bytes32 response = getFinalAnswer(bytes32 question_id);


This will return ``bytes32`` data, or throw an error (``revert``) if the question does not exist or has not been finalized. 

If you want numerical data, you will usually cast the result to either ``uint256`` or ``int256``.

A single choice from a list of options will return an ID representing a zero-based index.

Who won the US presidential election?
 * 0: Hillary Clinton
 * 1: Donald Trump
 * 2: Other

A multiple-choice list will be indexed as follows:

Which of the following words did Donald Trump use in his inauguration speech?
 * 1: Bigly
 * 2: Deplorable
 * 4: Hillary
 * 8: Twitter

For example, a response of 9 would indicate the answers Bigly and Twitter.




The content of the question can be referred to by its ``content_hash``. 
The same ``content_hash`` may be repeated many times, asking the same question repeatedly.

This will fetch the answer to the question, if it is available, or revert the transaction does not yet have a final answer.

Once a question has been created, it can be answered immediately. In many cases you are not interested in the result of a particular question until it has a particular answer. For example, if you have a contract insuring against my house burning down, you are only interested in the result if my house burned down. You don't care about all the times in between setting up the policy and claiming when my house doesn't burn down.

In this situation, rather than storing a ``question_id`` and waiting for the result of that particular question asked on one particular occasion, your contract should store the ``content_hash``, along with the mimimum settings that it requires to consider information reliable. When someone provides a ``question_id``, it can then fetch the information about the ``content_hash`` and other settings for that question and confirm that they are acceptable.

A contract can short-cut this check by sending additional arguments to ``getFinalAnswer()``. If the minimum requirements are not met, the Reality Check contract will throw an error (``revert``).

.. code-block:: javascript
   :linenos:

   getFinalAnswer(
      question_id,
      content_hash,
      arbitrator,
      min_timeout,
      min_bond
   ) 
   returns (bytes32 answer);

This will throw an error if the ``content_hash`` or ``arbitrator`` doesn't match, or if the ``timeout`` or ``bond`` is too low.

TODO: Example


Asking questions
----------------

You can ask a new question by calling the ``askQuestion()`` function. 

The content of the question defined as a combination of a numerical ``template_id`` and a ``string`` of parameters.

.. code-block:: javascript
   :linenos:

   function askQuestion(
      uint256 template_id, 
      string question, 
      address arbitrator, 
      uint256 timeout, 
      uint256 nonce
   )
   returns (bytes32 question_id);


The ``bytes32`` ID that will be returned is made by hashing the parameters, plus ``msg.sender``.

The ``nonce`` is a user-supplied number that can be used to disambiguated deliberate repeated uses of the same question. You can use ``0`` if you never intend to ask the same question with the same settings twice.


Repeating questions
-------------------

You can ask a question again by calling the ``repeatQuestion()`` function. 


Creating templates
------------------

A template can be created by calling `createTemplate("template")`, where "template" is the JSON template. This returns a numerical ID.

This can then by called with a string including only the flight number, the delimiter and the date, eg:
    `MH17␟2017-12-01`


Interpreting the answers
------------------------

The answer must be expressed in terms of `bytes32` data. This may encode a number, a hash of some text, a number representing a selection specified in the JSON question definition, or boolean values for multiple options combined in a bitmask.

A contract consuming this data should be prepared to make the necessary type conversion, most typically by casting a `bytes32` value into `uint` (for an unsigned number) or `int` (for a signed number).

See :doc:`encoding` for more detail about how different data types are encoded.


Making sure a question has an answer
------------------------------------

As discussed in :doc:`availability`, when a question is asked, the answer may be "don't know" or "don't understand" or "this isn't settled yet". Contracts relying on Reality Check for information need to be designed to take account of this possibility.

After settlement Reality Check will preserve information about the ``content_hash_, ``arbitrator``, ``timeout``, finalization date (in ``finalization_state`` and highest-posted ``bond``. Contracts can either check this information directly or pass their requirements to ``getFinalAnswer()``.

We also provide a wrapper contract that will allow contracts to request an answer meeting its conditions. This allows consumer contracts to send a request and receive a callback, sent by an arbitrary user in return for a fee, on a similar model to the Ethereum Alarm Clock.

