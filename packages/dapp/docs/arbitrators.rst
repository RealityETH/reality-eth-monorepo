Arbitrators
=============

.. toctree::
   :maxdepth: 2
   :caption: Contents:


An arbitrator is responsible for providing a final answer to a question when there is a dispute, in exchange for a fee. If the arbitrator is untrustworthy, the system cannot be relied on to provide accurate answers.

Any contract address can be set as the arbitrator. Our dapp currently lists only the Reality Keys trusted arbitrator contract, but others can be entered manually. We can add other contract addresses on request.

Since arbitration is expensive, it will usually only be requested after parties have posted bonds, and the bonds have escalated to a level where the bond you stand to gain by paying for arbitration is higher than the fee. Accordingly, arbitrators should feel free to set fairly high fees that will adequately cover the cost of a thorough arbitration process.


Arbitration Models
------------------

Trusted third-parties
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We provide a centralized arbitration service, run by Reality Keys, similar to the model we have been operating with since 2013.

Jury pools
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Pools of trusted have often been used successfully in Ethereum, particularly for contract resolution, where pools of keyholders, named "curators" or "custodians", are able to report on the equivalent of "Does contract x have a serious bug that justifies letting its developers upgrade it" or "Is X a legitimate upgrade to contract Y?". 

These share the same basic security risks as centralized trusted arbitrators (coercion, bribery, blackmail, key leakage, key loss) but will substantially decrease their likelihood for many use-cases.

Stakeholder voting
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Where a consumer contract has their own token, they may choose to provide their own arbitrator contract allowing their own stakeholders to vote.


Coordination games
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Some designs have attempted to leverage coordination games to encourage reporters to report correctly. This is done in Augur, which also contains elements of Subjectivocracy (see below). A system like this, or Augur itself, could be used as an arbitrator via a bridge contract.

Subjectivocracy
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

We are developing a system along the lines described in `Get the facts, hard-fork all the things`_.

You can join the conversation in `our Gitter channel`_.

.. _`Get the facts, hard-fork all the things`: https://decentralize.today/get-the-facts-hard-fork-all-the-things-3ea2233da0fd
.. _`our Gitter channel`: https://gitter.im/realitykeys/token




Creating and using an arbitration contract
------------------------------------------

Arbitrator contracts should expose the following functions to users:

* ``function getDisputeFee(bytes32 question_id) constant returns (uint256)``
* ``function requestArbitration(bytes32 question_id)``

When ``requestArbitration()`` is called with a sufficient fee, they should call the following against the Realitio contract:

* ``notifyOfArbitrationRequest(bytes32 question_id, address requester)``

When they produce an answer, they should settle the contract with:

* ``submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer)``

If the result of arbitration is to affirm the answer given by the final answerer, the person who gave that answer should be supplied as ``answerer``. If the result of arbitration is to change the final answer, the ``answerer`` supplied should be the user who paid for arbitration.

.. note::
   Sometimes the answer the arbitrator finalizes on will already have been given earlier, but with a lower bond. It may appear fairer to some for the arbitrator to set the ``answerer`` as the person who previously gave that answer, not the person who paid. However, for all we know the person who gave the correct answer could be a sock puppet belonging to the person who gave the final, wrong answer. Rewarding them would remove the disincentive to lie. For the system the incentive system to work correctly, it is essential that the arbitrator choose the person who paid them as the ``answerer``, unless the pre-existing final answer was correct.
