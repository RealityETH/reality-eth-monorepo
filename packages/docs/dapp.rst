Using the Reality.eth dapp
============================

Requirements
------------

You will need the Metamask_ extension for Chrome or Firefox or a a browser with equivalent functionality like Brave_.

To post or answer questions you will need ETH or the equivalent on the network you are on.

If you prefer to try the app without using real money, you can switch Metamask to the Sepolia Testnet.

.. _Metamask: http://metamask.io/
.. _Brave: https://brave.com/


Asking a question
-----------------

Click the "post a question" button and fill in the form you see. Enter a clear, unambiguous question in English. 

Opening Date
~~~~~~~~~~~~

If you don't want people to be able to answer the question immediately, enter the date you want it to open.

Reward
~~~~~~~~~~
Enter the amount you are prepared to pay as an incentive to answer your question. You pay when you post the question, and the money is collected by the person who gave the final accepted answer.

If you intend to supply the answer yourself, and are hoping it will survive challenges so that you can use the question as evidence to send to a smart contract, you do not need to set a bounty, and can instead post a bond when you supply your answer. That way you will get the money back if your answer is accepted.

Question Type
~~~~~~~~~~~~~
* Binary (Yes/No): A simple yes or no answer.
* Number: A positive (unsigned) number. By default questions allow up to 13 decimals. 
* Single-choice: One answer can be selected from a list. The answer form will display this as a select box.
* Multiple-choice: Multiple answers can be selected from a list. The answer form will display this as a group of checkboxes.
* Datetime: A date or date and time. The answer form will display this as a date picker.
* Hash (version 3.2 and higher, or version 2.2): A 32-byte hash. The answer form will display `0x` plus 64 hexadecimal characters.

See :doc:`contracts` for how these values will be reported to contracts.


Arbitrator
~~~~~~~~~~
This is the address of a person, organization or DAO that will settle disputes in exchange for a fee. See :doc:`arbitrators` for more details on how they work, and how you can create your own arbitrator.

Timeout
~~~~~~~
How long people will have to correct incorrect reponses after they are posted. We normally suggest 24 hours. You may prefer a longer setting if you think your question will need time to come to the attention of people qualified to answer it, or a shorter setting if you think many people will be paying attention within a short timespan. 

Category
~~~~~~~~
This is intended to help people find questions of the subject they are interested in.

This is removed in version 3.2.

Description
~~~~~~~~~~~
A detailed description of the question. (This field is optional.)

This was introduced in version 3.2.

Answering a question
--------------------

Click on the question to open the display and entry window.

Your answer
~~~~~~~~~~~

Enter the answer. 

Your bond
~~~~~~~~~

This is money that you will get back if your answer is accepted as the final answer, and lose if your answer is not accepted. 

Posting a bond stakes a claim to the answer you are giving: Even if someone else later reposts the same answer, you will get your bond back, and also be paid, as a minimum, an amount equal to the bond you have posted.

.. note:: When you send a transaction to the Ethereum network, it may take some time to confirm.

          You can go ahead and supply your own answer to a question before it has confirmed. However, other users will not see either the question or your answer until they are confirmed.


Correcting an incorrect answer
------------------------------

If you see a question with an incorrect answer, you can correct it simply by adding a new answer. 

Correcting an answer will entitle you to the bond of the previous user. However, you must submit your own bond, and it must be at least twice as high as the bond submitted by the previous answerer. If you are resubmitting an answer that someone has already given, part of that payment will be deducted and paid to them. See :doc:`fees` for details.

.. note:: Until your answer has been sent to the network and confirmed in a block, it is possible for someone else to submit a competing answer.
          This will cause your transaction to fail. 

          If the competing answer is also wrong, you may wish to resubmit your answer with an even higher bond.
          
Questions include an option for "invalid", for if the question cannot be answered. 

As of version 3, questions may also include an option for "answered too soon". You should select this answer if it was too soon to answer the question at the time the first answer was given, for instance because the question was about an event that had not happened yet.

Requesting arbitration
----------------------

If you see a question with an incorrect answer and a high bond, you can request arbitration. 

To request arbitration you must pay the arbitrator a fee. The fee may be quite high, and it will not be returned to you even if you are right. However, you will receive the bond posted with the incorrect answer. To make it profitable to request arbitration, you can increase your bond to the point where the person posting the incorrect answer will either give up, making your answer the winner, or post a bond that exceeds the amount you will have to pay the arbitrator.

Once the arbitration fee has been paid the question will be locked, and the participants have to wait for the arbitrator to send their final answer to the contract.


See :doc:`arbitrators` for more details on how the arbitration process works.


Reopening questions
-------------------

A question that resolved as "answered too soon" can be reopened. This creates a new version of the question, and the question reward is transferred to the new question.


Withdrawing funds
-----------------

Once a question has been finalized, anyone who submitted the correct answer will be able to withdraw funds.

Once funds are available, a "Claim" button will show up on the "your" tab that appears when you click the user icon in the top-right corner. Clicking the "Claim" button will send the funds to your account.


