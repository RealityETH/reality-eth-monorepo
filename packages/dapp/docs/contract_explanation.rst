Contract Internals
==================

This document is intended to help you read and understand the RealityCheck.sol contract, in particular its internal data structures. See the previous documents for a higher-level description of what the contract does.

Questions
---------

A question consists of a string encoding a JSON object. See :doc:`encoding`.
This is structured as a reusable template, plus delimited string supplying parameters.

The resulting document (template + parameters) identifies a particular question content.

``Template ID`` + ``Opening datetime`` + ``Parameter string`` -> ``Content Hash``

A question with a particular Content Hash may be asked on multiple occasions, some of which may have different arbitrator and timeout settings.

``Content Hash`` + ``Arbitrator`` + ``Timeout`` + ``Creator`` + ``Nonce`` -> ``Question ID``


Answer history entries
----------------------

Each time an answer is submitted, it creates a history item. The contract later needs to be able to access the entire history to correctly assign bonds at the end of the process.

The question struct always stores the most recent answer and bond. However, to avoid the need to expand storage for each storage item, we store a only a hash representing the history, and require users to supply the history when they claim bonds.

``Empty  Bytes32`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 1``

``History Hash 1`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 2``

``History Hash 2`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 3`` <- stored in Questions struct

See below for how if the answer is supplied by commit->reveal, this will instead hold the Commitment ID, and the final item will be True.

Commitments
-----------

To give people who consistently give right answers a defence against having their rewards taken from them by front-runners, we allow users to separate the posting of an answer into two stages: The commit and the reveal.

The commitment consists of a hash of the answer that the user wishes to supply, combined with a secret nonce known only to themselves or their agent.

``Answer`` + ``Nonce`` -> ``Answer Hash``

A commitment is uniquely identified by the Question ID, the Answer Hash and the bond. (The system will not allow two answers to be submitted with the same bond.)

``Question ID`` + ``Answer Hash`` + ``Bond`` -> ``Commitment ID``

The information about the commitment - the reveal deadline, whether the reveal has happened and the revealed answer - are stored in a struct by indexed Commitment ID.

Since the answer being submitted is not known when the the history item is created, answers using commit-and-reveal will store the Commitment ID instead of the answer.



``Empty  Bytes32`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 1``

``History Hash 1`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 2``

``History Hash 2`` + ``Answer`` + ``Bond`` + ``Answerer`` + ``False`` -> ``History Hash 3`` 

``History Hash 3`` + ``Commitment ID`` + ``Bond`` + ``Answerer`` + ``True`` -> ``History Hash 4`` <- stored in Questions struct


During the claim process (see below) the contract will look up the revealed answer as referenced by the Commitment ID it finds in the history, then delete the Commitment struct.

Claims
------

Claims are made by playing back the history from the latest entries first.

Normally funds can be claimed at the end of the process in a single transaction. This transaction will assign the appropriate payments, clear the History Hash record from the question and delete any Commitment data.

However, in some cases users may wish to claim only the later history entries in a single transaction, leaving the earlier entries to be claimed either by themelves or by another user in a future transaction. 

In this case the contract needs to store some information about the claim process. This is stored in a Claim struct, referenced by Question ID.

