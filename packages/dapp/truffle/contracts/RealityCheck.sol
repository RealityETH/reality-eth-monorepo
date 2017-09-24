pragma solidity ^0.4.6;
/*
To make it hard for us to forget to set one of these, every non-constant function should specify:
* stateNotCreated or stateOpen or statePendingArbitration or stateFinalized or stateAny
* internal or external or public

Things that take answers should specify
* bondMustDouble or BondMustBeZero

Things that can be done by the arbitrator should specify
* actorArbitrator 
(All other functions can be run by anyone.)
*/

contract RealityCheck {

    // finalization_ts states. Anything above this is a timestamp.
    uint256 constant UNANSWERED = 0;
    uint256 constant PENDING_ARBITRATION = 1;

    // commitment deadline_ts state. Anything above this is a timestamp.
    uint256 constant COMMITMENT_REVEALED = 1;

    modifier actorArbitrator(bytes32 question_id) {
        require(msg.sender == questions[question_id].arbitrator);
        _;
    }

    modifier stateAny() {
        _;
    }

    modifier stateNotCreated(bytes32 question_id) {
        require(questions[question_id].timeout == 0);
        _;
    }

    modifier stateOpen(bytes32 question_id) {
        require(questions[question_id].timeout > 0); // Check existence
        uint256 finalization_ts = questions[question_id].finalization_ts;
        require(finalization_ts == UNANSWERED || finalization_ts > now);
        _;
    }

    modifier statePendingArbitration(bytes32 question_id) {
        require(questions[question_id].finalization_ts == PENDING_ARBITRATION);
        _;
    }

    modifier stateFinalized(bytes32 question_id) {
        require(isFinalized(question_id));
        _;
    }

    modifier bondMustDouble(bytes32 question_id, uint256 max_previous) {

        require(msg.value > 0); 

        uint256 bond_to_beat = questions[question_id].bond;

        // You can specify that you don't want to beat a bond bigger than x
        require(max_previous == 0 || bond_to_beat <= max_previous);

        // You have to double the bond every time
        require(msg.value >= (bond_to_beat * 2));

        _;

    }

    modifier bondMustBeZero() {
        require(msg.value == 0);
        _;
    }

    event LogNewTemplate(
        uint256 indexed template_id,
        address indexed user, 
        string question_text
    );

    event LogNewQuestion(
        bytes32 indexed question_id,
        address arbitrator, 
        uint256 timeout,
        uint256 template_id,
        string question,
        bytes32 indexed question_hash,
        uint256 created,
        address indexed user, 
        uint256 nonce
    );

    event LogNewAnswer(
        bytes32 answer,
        bytes32 indexed question_id,
        bytes32 history_hash,
        address indexed user,
        uint256 bond,
        uint256 ts,
        bool is_commitment
    );

    event LogAnswerReveal(
        bytes32 indexed question_id, 
        bytes32 answer_hash, 
        address indexed user, 
        uint256 nonce, 
        uint256 bond
    );

    event LogFundAnswerBounty(
        bytes32 indexed question_id,
        uint256 bounty_added,
        uint256 bounty,
        address indexed user 
    );

    event LogNotifyOfArbitrationRequest(
        bytes32 indexed question_id,
        address indexed user 
    );

    event LogFinalize(
        bytes32 indexed question_id,
        bytes32 indexed answer
    );

    event LogClaim(
        bytes32 indexed question_id,
        address indexed user,
        uint256 amount
    );

    event LogWithdraw(
        address indexed user,
        uint256 amount
    );

    struct Question {
        uint256 finalization_ts;

        // Identity fields - if these are the same, it's a duplicate
        address arbitrator;
        uint256 timeout;
        bytes32 question_hash;

        // Mutable data
        uint256 bounty;
        bytes32 best_answer;
        uint256 bond;
        bytes32 history_hash;
    }

    // Only used when claiming more bonds than fits into a transaction
    // Stored in a mapping indexed by question_id.
    struct Claim {
        address payee;
        uint256 last_bond;
        uint256 take;
    }

    // Stored in a mapping indexed by commitment_id, which hashes the commitment hash, question and bond. 
    struct Commitment {
        uint256 deadline_ts; // COMMITMENT_REVEALED, or the deadline for the reveal
        bytes32 revealed_answer;
    }

    function RealityCheck() {
        createTemplate('{"title": "%s", "type": "bool", "category": "%s"}');
        createTemplate('{"title": "%s", "type": "uint", "decimals": 13, "category": "%s"}');
        createTemplate('{"title": "%s", "type": "int", "decimals": 13, "category": "%s"}');
        createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s"}');
        createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s"}');
    }

    // Templates are assigned sequential IDs.
    uint256 nextTemplateID = 0;
    // The data in them is stored in event logs, but we hold a mapping telling us which block that is for faster log querying.
    mapping(uint256 => uint256) public templates;

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Claim) question_claims;
    mapping(bytes32 => Commitment) public commitments;
    mapping(address => uint256) public balanceOf;

    function createTemplate(string content) 
    stateAny()
    public returns (uint256) {
        uint256 id = nextTemplateID;
        templates[id] = block.number;
        LogNewTemplate(id, msg.sender, content);
        nextTemplateID = id + 1;
        return id;
    }

    function askQuestion(uint256 template_id, string question, address arbitrator, uint256 timeout, uint256 nonce) 
    // stateNotCreated is enforced by the internal _askQuestion
    public payable returns (bytes32) {

        require(templates[template_id] > 0);

        bytes32 question_hash = keccak256(template_id, question);
        bytes32 question_id = keccak256(question_hash, arbitrator, timeout, msg.sender, nonce);

        _askQuestion(question_id, question_hash, arbitrator, timeout);
        LogNewQuestion(question_id, arbitrator, timeout, template_id, question, question_hash, now, msg.sender, nonce);

        return question_id;
    }

    function _askQuestion(bytes32 question_id, bytes32 question_hash, address arbitrator, uint256 timeout) 
    stateNotCreated(question_id)
    internal {

        // A timeout of 0 makes no sense, and we will use this to check existence
        require(timeout > 0); 
        require(timeout < 365 days); 
        require(arbitrator != 0x0);

        questions[question_id].arbitrator = arbitrator;
        questions[question_id].timeout = timeout;
        questions[question_id].question_hash = question_hash;
        questions[question_id].bounty = msg.value;

    }

    // Normally the bounty is paid on question creation, but if you like you can add to it later.
    function fundAnswerBounty(bytes32 question_id) 
    stateOpen(question_id)
    external payable {
        questions[question_id].bounty += msg.value;
        LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
    }

    // Predict the ID for a given question
    function getQuestionID(uint256 template_id, string question, address arbitrator, uint256 timeout, address sender, uint256 nonce) 
    external constant returns (bytes32) {
        bytes32 question_hash = keccak256(template_id, question);
        return keccak256(question_hash, arbitrator, timeout, sender, nonce);
    }

    function _addAnswerToHistory(bytes32 question_id, bytes32 answer, address answerer, uint256 bond, bool is_commitment) 
    internal 
    {

        bytes32 new_state = keccak256(questions[question_id].history_hash, answer, bond, answerer);

        questions[question_id].bond = bond;
        questions[question_id].history_hash = new_state;

        LogNewAnswer(
            answer,
            question_id,
            new_state,
            answerer,
            bond,
            now,
            is_commitment
        );

    }

    function _updateCurrentAnswer(bytes32 question_id, bytes32 answer, uint256 finalization_ts)
    internal {
        questions[question_id].best_answer = answer;
        questions[question_id].finalization_ts = finalization_ts;
    }


    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) 
    stateOpen(question_id)
    bondMustDouble(question_id, max_previous)
    external payable {
        
        _addAnswerToHistory(question_id, answer, msg.sender, msg.value, false);
        _updateCurrentAnswer(question_id, answer, now + questions[question_id].timeout);

    }

    // If you're worried about front-running, you can use submitAnswerCommitment then submitAnswerReveal instead of submitAnswer.
    // The result is the same assuming you reveal. If you don't reveal in time, we just assume you're wrong. 
    function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 max_previous) 
    stateOpen(question_id)
    bondMustDouble(question_id, max_previous)
    external payable {

        bytes32 commitment_id = keccak256(question_id, answer_hash, msg.value);

        // You can only use the same commitment once.
        require(commitments[commitment_id].deadline_ts == 0);

        uint256 timeout = questions[question_id].timeout;
        commitments[commitment_id].deadline_ts = now + (timeout/8);

        _addAnswerToHistory(question_id, commitment_id, msg.sender, msg.value, true);
        // We don't do _updateCurrentAnswer, this is left until the reveal

    }

    // NB The bond is the amount you sent in submitAnswerCommitment.
    // Since the bond must always increase, we can use this to confirm whether you still have the top answer.
    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) 
    stateOpen(question_id)
    external {

        bytes32 answer_hash = keccak256(answer, nonce);

        // The question ID + bond will uniquely identify the commitment.
        bytes32 commitment_id = keccak256(question_id, answer_hash, bond);

        uint256 deadline_ts = commitments[commitment_id].deadline_ts;
        require(deadline_ts > COMMITMENT_REVEALED); // Commitment must exist, and not be in already-answered state
        require(deadline_ts > now); 

        commitments[commitment_id].deadline_ts = COMMITMENT_REVEALED;
        commitments[commitment_id].revealed_answer = answer;

        if (bond == questions[question_id].bond) {
            _updateCurrentAnswer(question_id, answer, now + questions[question_id].timeout);
        }

        LogAnswerReveal(question_id, answer_hash, msg.sender, nonce, bond);

    }

    function notifyOfArbitrationRequest(bytes32 question_id, address requester) 
    actorArbitrator(question_id)
    stateOpen(question_id)
    external returns (bool) {

        questions[question_id].finalization_ts = PENDING_ARBITRATION;
        LogNotifyOfArbitrationRequest(question_id, requester);

    }

    // Answer sent by the arbitrator contract, without a bond.
    // It will be added to the history, with their opinion on who gave it last. (We don't check.)
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) 
    actorArbitrator(question_id)
    statePendingArbitration(question_id)
    bondMustBeZero
    external returns (bytes32) {

        require(answerer != 0x0);
        LogFinalize(question_id, answer);

        _addAnswerToHistory(question_id, answer, answerer, uint256(0), false);
        _updateCurrentAnswer(question_id, answer, now - 1);

    }

    function isFinalized(bytes32 question_id) 
    constant public returns (bool) {
        uint256 finalization_ts = questions[question_id].finalization_ts;
        return ( (finalization_ts > PENDING_ARBITRATION) && (finalization_ts < now) );
    }

    function getFinalAnswer(bytes32 question_id) 
    stateFinalized(question_id)
    external constant returns (bytes32) {
        return questions[question_id].best_answer;
    }

    // Assigns the winnings (bounty and bonds) to the people who gave the final accepted answer.
    // The caller must provide the answer history, in reverse order.
    // We work up the chain and assign bonds to the person who gave the right answer
    // If someone gave the winning answer earlier, they must get paid from the higher bond
    // So we don't pay out the bond added at n until we have looked at n-1
    //
    // The first answer is authenticated by checking against the stored history_hash.
    // One of the inputs to history_hash is the history_hash before it, so we use that to authenticate the next entry, etc
    // Once we get to a null hash we'll know we're done and there are no more answers.
    //
    // Usually you would call the whole thing in a single transaction.
    // But in theory the chain of answers can be arbitrarily long, so you may run out of gas.
    // If you only supply part of chain then the data we need to pick up again later will be stored:
    // * Question holds the history_hash. It'll be zeroed once everything has been claimed.
    // * The rest goes in a dedicated Claim struct. This is only filled if you stop a claim before the end.
    //
    function claimWinnings(bytes32 question_id, bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
    stateFinalized(question_id)
    public {

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[question_id].payee; // The person with the highest correct answer, working back down.
        uint256 last_bond = question_claims[question_id].last_bond; // The last bond we saw. Some of this may be owed to the next guy up.
        uint256 take = question_claims[question_id].take; // Money we can pay out.

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        for (i=0; i<history_hashes.length; i++) {

            // The hash comes from the Question struct, and the rest is checked against the hash.
            // So we can be sure that the data here is what was sent in submitAnswer().
            require(last_history_hash == keccak256(history_hashes[i], answers[i], bonds[i], addrs[i]));

            take += last_bond; 
            assert(take >= last_bond);

            if (commitments[answers[i]].deadline_ts == COMMITMENT_REVEALED) {
                answers[i] = commitments[answers[i]].revealed_answer;
                delete commitments[answers[i]];
            }

            if (answers[i] == best_answer) {

                if (payee == 0x0) {

                    // The first payee we come to, ie the winner. They get the question bounty.
                    payee = addrs[i];
                    take += questions[question_id].bounty;
                    questions[question_id].bounty = 0;

                } else if (addrs[i] != payee) {

                    // Answerer has changed, ie we found someone lower down who needs to be paid

                    // The lower answerer will take over receiving bonds from higher answerer.
                    // They should also be paid the equivalent of their bond. 
                    // (This is our arbitrary rule, to give consistent right-answerers a defence against high-rollers.)

                    uint256 payment = 0;
                    if (last_bond >= bonds[i]) {
                        payment = bonds[i]; // Normal pattern: Have more than enough (2x) to pay their bond equivalent
                    } else {
                        payment = last_bond; // Could be zero if the arbitrator sets a weird answerer address, if so tough.
                    }

                    assert(take >= last_bond);
                    assert(take >= payment);

                    // Settle up with the old payee
                    take -= payment;
                    balanceOf[payee] += take;
                    LogClaim(question_id, payee, take);
                    take = 0;

                    // Now start take again for the new payee
                    payee = addrs[i];
                    take = payment;

                }

            } 

            // Line the bond up for next time, when it will be added to somebody's take
            last_bond = bonds[i];
            last_history_hash = history_hashes[i];

        }
                 
        if (last_history_hash != "") {
            // We haven't yet got to the null hash (1st answer), so store the details to pick up later
            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;

            // If we're still waiting for the winner, we have to persist their winnings.
            // These will remain in the pool until they submit enough history to tell use who they are.
            // If we have the winner we can go ahead and pay them out, only keeping back last_bond
            if (payee == 0x0) {
                question_claims[question_id].take = take;
            } else {
                question_claims[question_id].take = 0;
                balanceOf[payee] += take;
                LogClaim(question_id, payee, take);
            }
        } else {
            // There is nothing left below us so we can keep what remains
            take += last_bond;
            balanceOf[payee] += take;
            LogClaim(question_id, payee, take);
            delete question_claims[question_id];
        }

        questions[question_id].history_hash = last_history_hash;

    }

    // Convenience function to claim for multiple questions in one go, then withdraw all funds.
    // question_ids are the question_ids, lengths are the number of history items for each.
    // The rest of the arguments are all the history item arrays stuck together
    function claimMultipleAndWithdrawBalance(bytes32[] question_ids, uint256[] lengths, bytes32[] hist_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
    stateAny() // The finalization checks are done in the claimWinnings function
    public {
        
        uint256 qi;
        uint256 i;
        for(qi=0; qi<question_ids.length; qi++) {
            bytes32 qid = question_ids[qi];
            uint256 l = lengths[qi];
            bytes32[] memory hh = new bytes32[](l);
            address[] memory ad = new address[](l);
            uint256[] memory bo = new uint256[](l);
            bytes32[] memory an = new bytes32[](l);
            uint256 j;
            for(j=0; j<l; j++) {
                hh[j] = hist_hashes[i];
                ad[j] = addrs[i];
                bo[j] = bonds[i];
                an[j] = answers[i];
                i++;
            }
            claimWinnings(qid, hh, ad, bo, an);
        }
        withdraw();
    }

    function withdraw() 
    stateAny() // You can always withdraw your balance
    public {
        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        msg.sender.transfer(bal);
        LogWithdraw(msg.sender, bal);
    }

}
