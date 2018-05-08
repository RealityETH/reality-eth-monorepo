Fees and payments
=================

.. toctree::
   :maxdepth: 2
   :caption: Contents:


All fees are set by participants.

=============== ================= =================== ============ ========================================
Fee             Set by            Paid by             Deductions   Paid to
=============== ================= =================== ============ ========================================
Question fee    Arbitrator        Asker                            Arbitrator                      
Question reward Asker             Asker                            Highest-bonded correct answerer [1]
Answer bond     Answerer          Answerer            Takeover fee Answerer, or Next correct answerer 
Takeover fee    [= previous bond] Subsequent answerer              Previous answerer
Arbitration fee Arbitration       Anyone                           Arbitrator 
=============== ================= =================== ============ ========================================

[1] Except when settled by arbitration. See below for details.

Question fee
------------

A fee set (optionally) by the arbitrator for asking a question. 

This fee is intended to be used as an anti-spam measure if the network fees are insufficient.

Set by the arbitrator.

Paid by the question asker.

Paid to the arbitrator.

Question reward
---------------

A reward for answering the question.

Set by the question asker.

Paid by the question asker.

Paid to whoever last gives the final answer. If the answer is decided by the arbitrator, the arbitrator specifies who should get paid. If they decide the final answer given was incorrect, they should direct that it be paid to whoever paid for arbitration.

Answer bond
-----------

A bond paid by someone who gives an answer to back their claim that the answer is correct.

Set by the question answerer. However, if there is an earlier answer, it must be least twice the level of the bond given with that answer.

Paid by the question answerer.

If the answer is correct (ie matches the final answer) this is returned. The same amount may be received as an Answer Takeover Fee (see below).

If the answer is incorrect, this is paid to the next answerer to supply the correct answer.

Answer takeover fee
-------------------

A fee for taking over a correct answer given by someone else.

Set to equal the bond supplied by the last person to give that answer.

Paid to the last person to give that answer.

Paid by deducting it from payments that would otherwise by awarded for giving the correct answer.

Arbitration fee
---------------

A fee paid to the arbitrator when requesting that they intervene and provide arbitration for a question.

Set by the arbitrator.

Paid to the arbitrator.

Paid by the user requesting arbitration. Usually this will be an answerer whoses answer has been replaced by another answerer supplying a higher bond. They would normally not request arbitration until bonds have reached a level where the amount they stand to gain exceeds the arbitration fee.
