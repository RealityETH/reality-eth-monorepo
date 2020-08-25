Using Reality.eth from a contract
=====================================

Fetching information
--------------------

The simplest way use for Reality.eth is to fetch some information for a question that has already been posted using the DApp.

Hovering your mouse over the "..." mark in the upper right-hand corner of a question will show you the question ID and the hash of the question content.

Fetching the answer to a particular question
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Each question can be referred to by its ``question_id``, which is a ``bytes32``. 

There is only one question with any given ``question_id``, and there can only be one corresponding answer.

You can fetch the final answer for a question by calling 

.. code-block:: javascript
   :linenos:

   bytes32 response = resultFor(bytes32 question_id);


This will return ``bytes32`` data, or throw an error (``revert``) if the question does not exist or has not been finalized. You often want to cast the resulting ``bytes32`` to a ``uint256`` when you process it. By convention all supported types use ``0xff...ff`` to mean "invalid". This will depend on the Question Type (see below).


Interpreting the result of a question
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Questions have a ``type``, which decides what format the answer should take, and tells the Reality.eth dapp what kind of UI it should display to submit answers. The dapp recognizes the following types:

bool
""""

A ``bool`` type represents a yes/no question. The result will be ``1``, ``0``, or ``0xff...ff`` for invalid, for example:

Did Donald Trump win the 2016 US presidential election?
 * 1: Yes
 * 0: No
 * 0xff..ff: Invalid



uint
""""

A ``uint`` type represents a number. The question may have a ``decimals`` field by which it should be divided. Negative numbers are not currently supported.

How many electoral votes did Hillary Clinton win in the 2016 US presidential election?


single-select
"""""""""""""

A ``single-select`` type represents a list of outcomes, producing a select box in the dapp. It is expressed as a zero-indexed, json-encoded array.

Which party's nominee won the 2016 US presidential election?

* ``0``: Democrat
* ``1``: Republican
* ``2``: Libertarian

The outcomes are supplied in a field called ``outcomes``. There is also an ``invalid`` option (``0xff..ff``) which is added automatically.

``["Democrat", "Republican", "Libertarian"]``


multiple-select
"""""""""""""""

The ``multiple-select`` type represents a list of outcomes, producing checkboxes in the dapp. It is Expressed as a one-indexed, json-encoded array. 

Which party's nominee won the seats the House in the 2016 congressional elections?

* ``1``: Democrat
* ``2``: Republican
* ``4``: Libertarian

These are added together, so ``0`` would mean than none were selected, (``1`` + ``2``) = ``3`` would indicate Democrat and Republican, (``1`` + ``4``) = ``5`` would indicate Democrat and Libertarian, etc. There is also an ``0xff..ff``: Invalid option.

The outcomes are supplied in a field called ``outcomes``, as with ``single-select``.
``["Democrat", "Republican", "Libertarian"]``


datetime
""""""""

A ``datetime`` type represents a question that is answered with a date/time. This will be represented as a date picker in the UI, and expressed as a unix timestamp (seconds since 1970), of ``0xff..ff`` for invalid.


How questions are structured
----------------------------

Questions are expressed as a JSON object. This should specify a ``title`` and a ``type``, and may also include a ``category`` and ``lang`` field. It may include other fields depending on the type, such as ``outcomes`` to specify the possible outcomes in a ``single-select`` or ``multiple-select``, or ``decimals`` in a ``uint`` type.

Example:
``{"title": "Did Trump win the 2016 US presidential election?", "type": "bool", "category": "politics", "lang": "en"}``


.. _templates:

Templates
^^^^^^^^^

To avoid duplication and resulting gas fees, parts common to many questions are included in a pre-defined *template*. The *template* includes placeholders, and each question only needs to pass in the data necessary to replace the placeholders.

The following templates are built in, one for each question type:

 * ``0``: ``{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}``
 * ``1``: ``{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}``
 * ``2``: ``{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}``
 * ``3``: ``{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}``
 * ``4``: ``{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}``

See :ref:`creating-templates` for how and why you can create your own custom template.

Questions are creating by combining the ID of the template (for example, `2` for the built-in single-select template) with the unicode delimiter characther "␟".

For example, a simple boolean question intended for the category "news-politics" might use the string:
``Did Donald Trump win the 2016 US presidential election?␟news-politics␟en``

A question with multiple outcomes will need the JSON-encoded outcome list passed in, eg
``Which party's nominee won the 2016 US presidential election?␟"Democrat","Republican","Libertarian"␟news-politics␟en``


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
      uint32 timeout, 
      uint32 opening_ts, 
      uint256 nonce
   )
   returns (bytes32 question_id);

If the arbitrator you have selected charges a per-question fee, you must supply at least this much ETH. Any additonal ETH you send with this call will be assigned as a reward to whoever supplies the final answer to the question. See :doc:`fees` for more information.

See :ref:`templates` for the ``template_id``, and how the ``question`` parameter is structured.


The ``arbitrator`` is the address of the contract that will be able to arbitrate. See :doc:`arbitrators` for more information.

The ``timeout`` is the time in seconds the question will have after adding an answer before it is automatically finalized. It would typically be around ``1 days``. The contract sanity-checks set the maximum possible value at ``365 days``.

The ``opening_ts`` is the timestamp for the earliest time at which it will be possible to post an answer to the question. You can use ``0`` if you intend the question to be answerable immediately.

The ``nonce`` is a user-supplied number that can be used to disambiguated deliberate repeated uses of the same question. You can use ``0`` if you never intend to ask the same question with the same settings twice.

Any ETH provided with the ``askQuestion`` call will be used as a question reward, minus any fee the specified arbitrator requires when a new question is asked.


The ``askQuestion`` call returns a ``bytes32`` ID. This ID is made by hashing the parameters, plus ``msg.sender``.

.. note:: The Etherscan "write contract" feature has been known to mangle the delimiter character.



Accepting an answer only if something has happened
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Once a question has been created and the opening date (if set) reached, it can be answered immediately.

In many cases you are not interested in the result of a particular question until it has a particular answer. For example, if you have a contract insuring against my house burning down, you are only interested in the result if my house burned down. You don't care about all the times in between setting up the policy and claiming when my house didn't burn down. 

You may also want to screen out results indicating "unknown" or "no way to tell" or "hasn't happened yet".

One approach is that instead of waiting for the result of a specific ``question_id``, you specify the type of question you want, then wait for a user to send you a question ID with the appropriate content and settings.

To make this easier, we provide a method called ``getFinalAnswerIfMatches()``. This will throw an error not only if the question is not yet answered, but also if the content doesn't match, the bond or timeout is too low, or the arbitrator is not the one you expect.

.. code-block:: javascript
   :linenos:

    function getFinalAnswerIfMatches(
        bytes32 question_id, 
        bytes32 content_hash, 
        address arbitrator, 
        uint256 min_timeout, 
        uint256 min_bond
    ) returns (bytes32 answer)

You can then screen ``answer`` in your contract and only act on results that your contract is interested in.

.. _creating-templates:

Custom templates
----------------

If you want to create many similar requests, it will be more efficient to create your own template. For example, a flight insurance app might have:

.. code-block:: json
   :linenos:

    {
        "title": "Was flight %s on date %s delayed by more than 3 hours?", 
        "type": "bool", 
        "category": "flight-information"
    }


This can then by called with a string including only the flight number, the delimiter and the date, eg:
    ``MH17␟2017-12-01``

A template can be created by calling ``createTemplate("template")``, where "template" is the JSON template. This returns a numerical ID.


Making sure a question has an answer
------------------------------------

As discussed in :doc:`availability`, when a question is asked, the answer may be "don't know" or "don't understand" or "this isn't settled yet". Contracts relying on Reality.eth for information need to be designed to take account of this possibility.

After settlement Reality.eth will preserve information about the ``content_hash``, ``arbitrator``, ``timeout``, ``finalization_ts`` (finalization timestamp) and highest-posted ``bond``. Contracts can either check this information directly or pass their requirements to ``getFinalAnswerIfMatches()``.

