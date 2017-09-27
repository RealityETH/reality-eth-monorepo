pragma solidity ^0.4.6;

import './SafeMath.sol';

contract RealityCheck {

    using SafeMath for uint256;

    // finalize_state options. Anything above this is a deadline timestamp.
    uint256 constant UNANSWERED = 0;
    uint256 constant PENDING_ARBITRATION = 1;

    // reveal_state options. Anything above this is a reveal deadline timestamp.
    uint256 constant COMMITMENT_NON_EXISTENT = 0;
    uint256 constant COMMITMENT_REVEALED = 1;

    // Commit->reveal timeout is 1/8 of the question timeout (rounded down).
    uint256 constant COMMITMENT_TIMEOUT_RATIO = 8;

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

    event LogRepeatQuestion(
        bytes32 indexed question_id,
        bytes32 repeat_question_id,
        address arbitrator, 
        uint256 timeout,
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
        address indexed user, 
        bytes32 indexed answer_hash, 
        bytes32 answer, 
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
        uint256 finalize_state;
        address arbitrator;
        uint256 timeout;
        bytes32 question_hash;
        uint256 bounty;
        bytes32 best_answer;
        uint256 bond;
        bytes32 history_hash;
    }

    // Stored in a mapping indexed by commitment_id, a hash of commitment hash, question, bond. 
    struct Commitment {
        uint256 reveal_state; // COMMITMENT_REVEALED, or the deadline for the reveal
        bytes32 revealed_answer;
    }

    // Only used when claiming more bonds than fits into a transaction
    // Stored in a mapping indexed by question_id.
    struct Claim {
        address payee;
        uint256 last_bond;
        uint256 take;
    }

    uint256 nextTemplateID = 0;
    mapping(uint256 => uint256) public templates;
    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Claim) question_claims;
    mapping(bytes32 => Commitment) public commitments;
    mapping(address => uint256) public balanceOf;

    modifier onlyArbitrator(bytes32 question_id) {
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
        uint256 finalize_state = questions[question_id].finalize_state;
        require(finalize_state == UNANSWERED || finalize_state > now);
        _;
    }

    modifier statePendingArbitration(bytes32 question_id) {
        require(questions[question_id].finalize_state == PENDING_ARBITRATION);
        _;
    }

    modifier stateFinalized(bytes32 question_id) {
        require(isFinalized(question_id));
        _;
    }

    modifier bondMustDouble(bytes32 question_id, uint256 max_previous) {

        require(msg.value > 0); 

        uint256 bond_to_beat = questions[question_id].bond;

        // You have to double the bond every time
        require(msg.value >= (bond_to_beat * 2));

        // You can specify that you don't want to beat a bond bigger than x
        require(max_previous == 0 || bond_to_beat <= max_previous);

        _;

    }

    modifier bondMustBeZero() {
        require(msg.value == 0);
        _;
    }

    function RealityCheck() {
        createTemplate('{"title": "%s", "type": "bool", "category": "%s"}');
        createTemplate('{"title": "%s", "type": "uint", "decimals": 13, "category": "%s"}');
        createTemplate('{"title": "%s", "type": "int", "decimals": 13, "category": "%s"}');
        createTemplate('{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s"}');
        createTemplate('{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s"}');
    }

    function createTemplate(string content) 
    stateAny()
    public returns (uint256) {
        uint256 id = nextTemplateID;
        templates[id] = block.number;
        LogNewTemplate(id, msg.sender, content);
        nextTemplateID = id.add(1);
        return id;
    }

    function createTemplateAndAskQuestion(
        string content, 
        string question, address arbitrator, uint256 timeout, uint256 nonce) 
    // stateNotCreated is enforced by the internal _askQuestion
    public payable returns (bytes32) {
        uint256 template_id = createTemplate(content);
        return askQuestion(template_id, question, arbitrator, timeout, nonce);
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

    function repeatQuestion(bytes32 repeat_question_id, uint256 nonce, address arbitrator, uint256 timeout) 
    // stateNotCreated is enforced by the internal _askQuestion
    public payable returns (bytes32) {

        require(questions[repeat_question_id].timeout > 0); // check existence

        bytes32 question_hash = questions[repeat_question_id].question_hash;
        if (arbitrator == 0x0) {
            arbitrator = questions[repeat_question_id].arbitrator;
        }
        if (timeout == 0) {
            timeout = questions[repeat_question_id].timeout;
        }

        bytes32 question_id = keccak256(question_hash, arbitrator, timeout, msg.sender, nonce);

        _askQuestion(question_id, question_hash, arbitrator, timeout);
        LogRepeatQuestion(question_id, repeat_question_id, arbitrator, timeout, question_hash, now, msg.sender, nonce);

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

    function fundAnswerBounty(bytes32 question_id) 
    stateOpen(question_id)
    external payable {
        questions[question_id].bounty = questions[question_id].bounty.add(msg.value);
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
        bytes32 new_state = keccak256(questions[question_id].history_hash, answer, bond, answerer, is_commitment);

        questions[question_id].bond = bond;
        questions[question_id].history_hash = new_state;

        LogNewAnswer(answer, question_id, new_state, answerer, bond, now, is_commitment);
    }

    function _updateCurrentAnswer(bytes32 question_id, bytes32 answer, uint256 timeout_secs)
    internal {
        questions[question_id].best_answer = answer;
        questions[question_id].finalize_state = now.add(timeout_secs);
    }


    function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) 
    stateOpen(question_id)
    bondMustDouble(question_id, max_previous)
    external payable {
        _addAnswerToHistory(question_id, answer, msg.sender, msg.value, false);
        _updateCurrentAnswer(question_id, answer, questions[question_id].timeout);
    }

    // To prevent front-running, you can replace submitAnswer with submitAnswerCommitment -> submitAnswerReveal
    // The result is the same assuming you reveal. If you don't reveal in time, we just assume you're wrong. 
    function submitAnswerCommitment(bytes32 question_id, bytes32 answer_hash, uint256 max_previous) 
    stateOpen(question_id)
    bondMustDouble(question_id, max_previous)
    external payable {

        bytes32 commitment_id = keccak256(question_id, answer_hash, msg.value);

        require(commitments[commitment_id].reveal_state == COMMITMENT_NON_EXISTENT);

        uint256 commitment_timeout = questions[question_id].timeout.div(COMMITMENT_TIMEOUT_RATIO);
        commitments[commitment_id].reveal_state = now.add(commitment_timeout);

        _addAnswerToHistory(question_id, commitment_id, msg.sender, msg.value, true);
        // We don't call _updateCurrentAnswer, this is left until the reveal

    }

    function submitAnswerReveal(bytes32 question_id, bytes32 answer, uint256 nonce, uint256 bond) 
    stateOpen(question_id)
    external {

        bytes32 answer_hash = keccak256(answer, nonce);
        bytes32 commitment_id = keccak256(question_id, answer_hash, bond);

        uint256 reveal_state = commitments[commitment_id].reveal_state;
        require(reveal_state > COMMITMENT_REVEALED); // Commitment must exist, and not be in already-answered state
        require(reveal_state > now); // Reveal deadline must not have passed

        commitments[commitment_id].revealed_answer = answer;
        commitments[commitment_id].reveal_state = COMMITMENT_REVEALED;

        if (bond == questions[question_id].bond) {
            _updateCurrentAnswer(question_id, answer, questions[question_id].timeout);
        }

        LogAnswerReveal(question_id, msg.sender, answer_hash, answer, nonce, bond);

    }

    function notifyOfArbitrationRequest(bytes32 question_id, address requester) 
    onlyArbitrator(question_id)
    stateOpen(question_id)
    external returns (bool) {
        questions[question_id].finalize_state = PENDING_ARBITRATION;
        LogNotifyOfArbitrationRequest(question_id, requester);
    }

    // Answer sent by the arbitrator contract, without a bond.
    // We don't check the answerer, but for incentives to work right it should be:
    // - the person who submitted the current final answer if they were right.
    // - the person who paid for arbitration if the current final answer is wrong.
    function submitAnswerByArbitrator(bytes32 question_id, bytes32 answer, address answerer) 
    onlyArbitrator(question_id)
    statePendingArbitration(question_id)
    bondMustBeZero
    external returns (bytes32) {

        require(answerer != 0x0);
        LogFinalize(question_id, answer);

        _addAnswerToHistory(question_id, answer, answerer, 0, false);
        _updateCurrentAnswer(question_id, answer, 0);

    }

    function isFinalized(bytes32 question_id) 
    constant public returns (bool) {
        uint256 finalize_state = questions[question_id].finalize_state;
        return ( (finalize_state > PENDING_ARBITRATION) && (finalize_state <= now) );
    }

    function getFinalAnswer(bytes32 question_id) 
    stateFinalized(question_id)
    external constant returns (bytes32) {
        return questions[question_id].best_answer;
    }

    function _payPayee(bytes32 question_id, address payee, uint256 take) 
    internal
    {
        balanceOf[payee] = balanceOf[payee].add(take);
        LogClaim(question_id, payee, take);
    }

    function _applyPayeeChanges(
        bytes32 question_id, bytes32 best_answer, 
        uint256 take, address payee, 
        address addr, uint256 bond, bytes32 answer, bool is_commitment)
    internal returns (uint256, address)
    {

        // For commit-and-reveal, the answer history holds the commitment ID instead of the answer.
        // We look at the referenced commitment ID and switch in the actual answer.
        if (is_commitment) {
            bytes32 commitment_id = answer;
            // If it's a commit but it hasn't been revealed, it will always be considered wrong.
            if (commitments[commitment_id].reveal_state != COMMITMENT_REVEALED) {
                delete commitments[commitment_id];
                return (take, payee);
            } else {
                answer = commitments[commitment_id].revealed_answer;
                delete commitments[commitment_id];
            }
        }

        if (answer == best_answer) {

            if (payee == 0x0) {

                // The first payee we come to, ie the winner. They get the question bounty.
                payee = addr;
                take = take.add(questions[question_id].bounty);
                questions[question_id].bounty = 0;

            } else if (addr != payee) {

                // Answerer has changed, ie we found someone lower down who needs to be paid

                // The lower answerer will take over receiving bonds from higher answerer.
                // They should also be paid the takeover fee, which is set at a rate equivalent to their bond. 
                // (This is our arbitrary rule, to give consistent right-answerers a defence against high-rollers.)

                // There should be enough for the fee, but if not, take what we have.
                // There's an edge case involving weird arbitrator behaviour where we may be short.
                uint256 answer_takeover_fee = (take >= bond) ? bond : take;

                // Settle up with the old payee
                _payPayee(question_id, payee, take.sub(answer_takeover_fee));

                // Now start take again for the new payee
                payee = addr;
                take = answer_takeover_fee;

            }

        }

        return (take, payee);

    }

    // Assigns the winnings (bounty and bonds) to the people who gave the final accepted answer.
    // The caller must provide the answer history, in reverse order.
    // We work up the chain and assign bonds to the person who gave the right answer
    // If someone gave the winning answer earlier, they must get paid from the higher bond
    // That means we can't pay out the bond added at n until we have looked at n-1
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
    function claimWinnings(
        bytes32 question_id, 
        bytes32[] history_hashes, address[] addrs, uint256[] bonds, bytes32[] answers) 
    stateFinalized(question_id)
    public {

        // These are only set if we split our claim over multiple transactions.
        address payee = question_claims[question_id].payee; 
        uint256 last_bond = question_claims[question_id].last_bond; 
        uint256 take = question_claims[question_id].take; 

        // Starts as the hash of the final answer submitted. It'll be cleared when we're done.
        // If we're splitting the claim over multiple transactions, it'll be the hash where we left off last time
        bytes32 last_history_hash = questions[question_id].history_hash;

        bytes32 best_answer = questions[question_id].best_answer;

        uint256 i;
        for (i=0; i<history_hashes.length; i++) {

            // is_commitment is 1 of only 2 options, so try them both rather than making the user pass in a parameter
            bool is_commitment; 
            if (last_history_hash == keccak256(history_hashes[i], answers[i], bonds[i], addrs[i], true)) {
                is_commitment = true;
            } else if (last_history_hash == keccak256(history_hashes[i], answers[i], bonds[i], addrs[i], false)){
                is_commitment = false;
            } else {
                // Params don't recreate data stored by submitAnswer() / submitAnswerCommitment() at this point in the history.
                revert();
            }

            take = take.add(last_bond); 

            (take, payee) = _applyPayeeChanges(question_id, best_answer, take, payee, addrs[i], bonds[i], answers[i], is_commitment);
 
            // Line the bond up for next time, when it will be added to somebody's take
            last_bond = bonds[i];
            last_history_hash = history_hashes[i];

        }
 
        if (last_history_hash != "") {
            // We haven't yet got to the null hash (1st answer), ie the caller didn't supply the full answer chain.
            // Persist the details so we can pick up later where we left off later.

            // If we know who to pay we can go ahead and pay them out, only keeping back last_bond
            // (We always know who to pay unless all we saw were unrevealed commits)
            if (payee != 0x0) {
                _payPayee(question_id, payee, take);
                take = 0;
            }

            question_claims[question_id].payee = payee;
            question_claims[question_id].last_bond = last_bond;
            question_claims[question_id].take = take;
        } else {
            // There is nothing left below us so the payee can keep what remains
            _payPayee(question_id, payee, take.add(last_bond));
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
