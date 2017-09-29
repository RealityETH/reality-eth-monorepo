Calling Reality Check From A Contract
=============

Fetching information
-------------------

The simplest way use for Reality Check is to fetch some information for a question that has already been posted using the DApp.

Hovering your mouse over the "..." mark in the upper right-hand corner of a question will show you the question ID and the hash of the question content.

IMAGE GOES HERE

Fetching the answer to a particular question
^^^^^^^^^^^^^^^^^^^^^^^^^^

Each question can be referred to by its ``question_id``. 

There is only one question with any given ``question_id``, and there can only be one corresponding answer.

You can fetch the final answer for a question by calling ``getFinalAnswer(bytes32 question_id)``.

This will return ``bytes32`` data. 

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

In this situation you can require the user who wants to make a claim to provide the ID of a question, with the minimum settings that your contract requires to be convinced that it is accurate.

You can send additional arguments to ``getFinalAnswer()`` to filter for these settings:
``getFinalAnswer(bytes32 question_id, bytes32 content_hash, address arbitrator, uint256 min_timeout, uint256 min_bond)`` 

This will throw an error if the ``content_hash`` or ``arbitrator`` doesn't match, or if the ``timeout`` or ``bond`` is too low.

TODO: Example


Asking questions
-------------------

You can ask a new question by calling the ``askQuestion()`` function. 

The content of the question defined as a combination of a numerical ``template_id`` and a ``string`` of parameters.


Asking questions
-------------------

You can ask a question again by calling the ``repeatQuestion()`` function. 


Creating templates
------------------

A template can be created by calling `createTemplate("template")`, where "template" is the JSON template. This returns a numerical ID.

This can then by called with a string including only the flight number, the delimiter and the date, eg:
    `MH17␟2017-12-01`







### Encoding answers

The answer must be expressed in terms of `bytes32` data. This may encode a number, a hash of some text, a number representing a selection specified in the JSON question definition, or boolean values for multiple options combined in a bitmask.

A contract consuming this data should be prepared to make the necessary type conversion, most typically by casting a `bytes32` value into `uint` (for an unsigned number) or `int` (for a signed number).

### Information unavailability and "null" responses

The issue of at what point a question is decided, and in what ways it may be reported as undecided, is quite complex. Some uses require reporters to provide the best information available to them at the time, while others are not interested in an answer until it is reasonably clear. Many contracts will only be interested in a positive answer, eg an insurance contract might be interested in finding out when your house has burned down, but have no interest in the infinite number of occasions on which it did not burn down.

The handling of null, undecided or unclear answers is considered outside the scope of the system and left to the terms of each individual question. The terms of the question may designate a particular value or range of values to mean things like "undecided" or "uncertain". They may also specify the level of certainty and/or finality that should be applied when evaluating the result at any given time.

There is no way to pause a question once it has been asked, so if the answer to a question at any given time is "null" or "undecided" or "too early to sensibly ask", these values may be be settled on as the final result. Contracts consuming this data should be prepared to simply reject any answer they are not interested in, and wait for the same question to be asked again and get an answer in the range that does interest them. 

After settlement Reality Check will preserve information about the question hash, arbitrator, timeout, final bond, and finalization date, so consuming contracts can ask a user to send them a question ID, then verify that it meets the minimum conditions it requires to trust the information. We also provide a wrapper contract that will allow contracts to request an answer meeting its conditions. This allows consumer contracts to send a request and receive a callback, sent by an arbitrary user in return for a fee, on a similar model to the Ethereum Alarm Clock.

## Arbitration mechanisms

When they post bonds, users are ultimately betting that, in the event that the bonds are escalated to a high level and arbitration is requested, the arbitrator will decide in their favour. Reality Check does not solve the fundamental problem of getting true information on the blockchain (or at all); It instead passes the problem on to an arbitrator contract of the user's choice. However, the system of escalating bonds should mean that the arbitration contract can use slow, expensive processes for arbitration, while preserving low costs and fast resolution times for the typical case, and passing the cost of arbitration onto "untruthful" participants.

An arbitrator can be any contract that exposes a public method `getFee()` telling users the fee it charges for a particular question, and the ability to call `submitAnswerByArbitrator()` against the Reality Check contract to report the correct answer. We anticipate the following models:

### Centralized trusted arbitrators

Intially we provide a centralized arbitration service, run by Reality Keys, similar to the model we have been operating with since 2013.

### Jury pools

Pools of trusted have often been used successfully in Ethereum, particularly for contract resolution, where pools of keyholders, named "curators" or "custodians", are able to report on the equivalent of "Does contract x have a serious bug that justifies letting its developers upgrade it" or "Is X a legitimate upgrade to contract Y?". These share the same basic security risks as centralized trusted arbitrators (coercion, bribery, blackmail, key leakage, key loss) but will substantially decrease their likelihood for many use-cases.

### Stakeholder voting

Where a consumer contract has their own token, they may choose to provide their own arbitrator contract allowing their own stakeholders to vote.

### Coordination games

Some designs have attempted to leverage coordination games to encourage reporters to report correctly. This is done in Augur, which also contains elements of Subjectivocracy (see below). A system like this, or Augur itself, could be used as an arbitrator via a simple bridge contract.

### Subjectivocracy

We plan to pursue a system along the lines described here: https://decentralize.today/get-the-facts-hard-fork-all-the-things-3ea2233da0fd
