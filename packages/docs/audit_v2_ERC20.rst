Audit, v2.0 ERC20 version
=========================

Realit.io Modifications 
----------------------0
for WeTrust.io
Roland Kofler Blockchain Consulting 
June 2019


DISCLAIMER: The auditor shall not be held liable to and shall not accept any liability, obligation or responsibility whatsoever for any loss or damage arising from the use of the software. Especially but not only not for undiscovered errors, bugs and vulnerabilities.
Abstract
The Realit.io smart contracts are examined for security vulnerabilities after allowing ERC20 Tokens as a means of payment. Potential vulnerabilities were found in the Code under Audit (sometimes referred as CuA in the text):
1. While benevolence of the token contracts are assumed, we can improve the resilience of the code by checking the successful execution of a transfer: MEDIUM: do not suppose tokens are ER20 compliant. TRST is implemented correctly. It might be contentions to mark this as MEDIUM, but the attitude in this audit is to err on the false positive side.
2. There is a documentation error in a `require` string. MEDIUM: correct `require` string


Ad 1.: Realitio has decided not to change the check for transfer and therefore not to be compliant (at this level) with “BadTokens”, tokens that do not report correctly whether the transfer() function has been called directly. Realitio believes it can write a wrapper for such tokens if necessary. This is plausible.
Ad 2.: Has been implemented https://github.com/realitio/realitio-contracts/commit/0e6ba5998d83700c8a485e3dead65bc3cdcc965e
Additionally also a superfluous comment has been fixed, see Observation 5: constructor comment not consistent:
https://github.com/realitio/realitio-contracts/commit/b91efd77fc7644e7026d84063462b83eb33574af
Thanks to Ronan Sandford and Shaun Shutte for reviewing the document.




Abstract
-------

Scope of the audit
The benevolence of Token is mandatory
Also check previous changes to the Contracts under Audit
Methodology
Changes from last audit to the code under audit
Issue 1: `Update and rationalize interface files` and implications
Issue2: Refactor commitment timeout calculation
Issue 3: Duplication of Realito contracts, are they different?
Issue 4: Duplication of Zeppelin ERC20 contracts, are they different?
General observations
Observation 1: Allow later solidity versions
Observation 2: Drop back one minor solc version, deployed with 0.4.25
Observation 3: Duplicate Code IERC20.sol
Observation 4: ERC20Token.sol not latest version
Observation 5: constructor comment not consistent
Audit of CuA
Match Intent of the modifications made
Verify architectural change for ERC20 Tokens
Verify token invariance
Verify token use
Medium: do not suppose tokens are ER20 compliant
MINOR: allowing 0 bounties can spam the log
MEDIUM: correct `require` string
Verify how payments are made
Verify reentrancy protection against token
Verify execution isomorphism of previous changes
MINOR: different Solidity versions in sources
MINOR: there are two BalanceHolder contracts
Results from Mythril
Conclusions
Appendix
List of commits since last audit
Comparing the baseline with the new ERC20 contracts
References
Audit Brief
Audit Clarification
Ethereum Safety
ConsenSys Security Best Practices
DASP
Known Solidity Bugs




Scope of the audit 
------------------
The reason for the audit is the introduction of ERC20 functionality in the code base.


The scope of the audit is the source-code of two solidity smart contract files: (1) the changes in RealitioERC20.sol from Realitio.sol, BalanceHolder.sol and (2) Arbitrator.sol. Everything else is out of scope, for example the deployment of the code. 


From the Audit Brief (emphasis mine):


[...]
The audit consists of changes to 2 files, RealitioERC20.sol (changes from Realitio.sol) and Arbitrator.sol. I've also updated another auditor contract that I was working on, but it's not part of the scope of this audit. 


The new version is in the branch feature-erc20-audit:
https://github.com/realitio/realitio-contracts/tree/feature-erc20-audit


All the solidity code changes are in this commit:
https://github.com/realitio/realitio-contracts/commit/ec8db377d0ef74c5bf599894240f6b54db113338


The benevolence of Token is mandatory
From the Audit Brief:
[...] users must implicitly trust that the token the contract is interacting with isn't hostile.


Also check previous changes to the Contracts under Audit
From Audit Clarification results the mandate to check the changes since the last audit:


However it would be good if you could verify that what I just said is true, ie that Realitio.sol before the commits I mentioned matches the last thing you audited and I'm not trying to sneak another change past you.
Methodology
The main methods of assessment is structured reading and interpretation. While examination of the Code under Audit, the thoughts of the auditors are recorded.
Furthermore a security analysis tool, Mythril v0.21.3 by ConsenSys Diligence,  was employed to review the Code under Audit. 
First we observe the sanity of the codebase created before the Code under Audit(CuA) was introduced (as described in the Appendix Scope of the Audit section), followed by the audit. Checklists of commonly known vulnerabilities are sourced from EthSafety, ConSysSec and DASP.


The following definitions of alert levels are adopted to label vulnerabilities:


CRITICAL        has potential to harm user or owner 
MEDIUM        has potential to impede proper functioning of the smart contract
MINOR        there is a better way to do this or is just a matter of diverging tastes


The audit is documented comprehensively with all the base data and interim results provided in order to allow a reconstruction of the results and to document what has been tested and what has not been tested. This comprehensive information should encourage bug bounty hunters and security researchers to pursue their own inquiries.
The audit does not take any philosophical or opinionated position about smart contract security. Between “Code is law” and “upgradeable, pausable, managed and owned” there is much room for debate.
Changes from last audit to the code under audit 
Three previous audits have been conducted over the period from January to October 2018.
Since then, new commits have been made (see Appendix List of commits since last audit). These changes are examined here to verify if the requirements for the audit mandate is given at all. Reviewers mentioned that the word `unrisky` does not exist in the english language. Because it best describes the subjective assessment of little risk, this word has been introduced.


Count        Description        
        30        CAN’T TOUCH CODE UNDER AUDIT
        10        UNRISKY FOR CODE UNDER AUDIT
        3        SOME RISK FOR CODE UNDER AUDIT
Figure: subjective risk statistics for the changes before CuA


Issue 1: `Update and rationalize interface files` and implications
* Update and rationalize interface files
* ed authored and ed committed on Oct 20, 2018
* 390f2c9
This commit introduces a `contract Realitio is IBalanceHolder` instead of the old copy & paste of the (1) event and (2) empty `withdraw ()` function.
In the final version of the Code under Audit (CuA) the interface is substituted by an inheritance from an abstract class `BalanceHolderERC20.sol`! 
This is an undocumented change not present in Audit Clarification. 
The implications will be scrutinized in the AuC and in the main section of this document. {Result after verification: no known risk} .
* Verdict: SOME RISK FOR CODE UNDER AUDIT
Issue2: Refactor commitment timeout calculation 
* Break the commitment timeout calculation and storage into its own int…
* Edmund Edgar authored and ed committed on May 17
* 5422046 
As the code shows, this is a simple refactoring of a code block into an internal function, as stated in the commit msg.
        Verdict: UNRISKY FOR CODE UNDER AUDIT
Issue 3: Duplication of Realito contracts, are they different?
Start ERC20 version with exact copies of our original Realitio.sol co…
ed authored and ed committed 17 days ago
* 4959544 
We need to check if the initial versions differ (see Appendix Comparing the baseline with the new ERC20 contracts).


        Verdict: UNRISKY FOR CODE UNDER AUDIT
Issue 4: Duplication of Zeppelin ERC20 contracts, are they different?
Assuming the latest Zeppelin version for Solidity 0.4.24 was used (Zeppelin ERC20 Framework v2.0.1).


Comparing
https://raw.githubusercontent.com/realitio/realitio-contracts/391af7b87145fc5a10555742e931e32b9844f80e/truffle/contracts/ERC20Token.sol


with
https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/v2.0.1/contracts/math/SafeMath.sol


https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/v2.0.1/contracts/token/ERC20/IERC20.sol


https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/v2.0.1/contracts/token/ERC20/ERC20.sol


Distilled into a file Zeppelin.sol, we are ready to compare the files with a Unix command:


 diff --ignore-space-change ERC20Token.sol Zeppelin.sol


Result:


7a8
> 
164a166,167
>     require(value <= _allowed[from][msg.sender]);
> 
210a214
>     require(value <= _balances[from]);
226,227c230
<     require(account != address(0));
< 
---
>     require(account != 0);
240c243,244
<     require(account != address(0));
---
>     require(account != 0);
>     require(value <= _balances[account]);
254a259,260
>     require(value <= _allowed[account][msg.sender]);
> 


The sourced contracts do not implement several of the precondition checks Zeppelin has adopted in the latest version of the Solidity 0.4.24 version. It is likely that they are copied from an older commit. Because the code is not inherited or in any other way blended into the logic for the CuA, this is merely a cosmetic issue. 


Verdict: UNRISKY FOR CODE UNDER AUDIT
General observations
Some observations not critical for smart contract security.
Observation 1: Allow later solidity versions
* Allow later solidity versions
* ed authored and ed committed on Nov 2, 2018
* 0563976 
This is a trade off between security and ease of deployment. Verify at deploy time that the solidity compiler version you deploy to does not expose vulnerabilities. The code base requires different Solidity versions from 0.4.6 to 0.4.25 (Minor: different Solidity versions in sources).
Observation 2: Drop back one minor solc version, deployed with 0.4.25 
There are unresolved but no critical bugs in Solidity 0.4.24, please take care (together with Observation 1)
* Drop back one minor solc version, deployed with 0.4.25 but current tr… Edmund Edgar committed on Nov 9, 2018


Specification of known Solc vulnerabilities (see Known Solidity Bugs):
"0.4.24": {
	

	

	       "bugs": [
	

	           "ABIEncoderV2StorageArrayWithMultiSlotElement",
	

	           "DynamicConstructorArgumentsClippedABIV2",
	

	           "UninitializedFunctionPointerInConstructor_0.4.x",
	

	           "IncorrectEventSignatureInLibraries_0.4.x",
	

	           "ABIEncoderV2PackedStorage_0.4.x",
	

	           "ExpExponentCleanup",
	

	           "EventStructWrongData"
	

	       ],
	

	       "released": "2018-05-16"
	

	   }




	Observation 3: Duplicate Code IERC20.sol
The code in the file IERC20.sol is also found in ERC20Token.sol and can be trimmed in one of the files.
Observation 4: ERC20Token.sol not latest version
Consider updating the ERC20Token to the latest v2.0.1 of Zeppelin ERC20 Framework or annotate a warning in the documentation. See Issue 4: Duplication of Zeppelin ERC20 contracts, are they different?.
Observation 5: constructor comment not consistent


Line 193:    
/// param _token The token used for everything except arbitration
Maybe intentional as a reminder, but consider to be more explicit.


Verdict: Ignore my observations if you need to deploy soon  :s)




Audit of CuA
The verification of the changes made between the last audit and the Code under Audit (CuA) reported an undocumented change. 


All code relevant to the core Audit are checked in a single commit:
* Realitio ERC20 version uses ERC20 for everything except arbitration. … …
* ed authored and ed committed 19 days ago
* ec8db37 
Match Intent of the modifications made
From the Project Description (emphasis mine):


The principle is that we will have one RealitioERC20 contract per supported token, and as currently one Arbitrator contract per arbitrator per RealitioERC20 contract. The token is set during initial setup and once set cannot be changed. All question rewards and bonds are denominated in that token.


As previously, arbitration is still denominated and requested in ETH. 
If the arbitrator sets a per-question fee, which is deducted from the funds sent to the initial bounty set when a question is created, this is denominated in the token.
Accordingly, the Arbitrator contract now has a single additional function allowing its owner to withdraw ERC20 funds that it may have collected in the RealitioERC20 contract.


Since a RealitioERC20 contract only handles a single token, which cannot be changed after setup, users must implicitly trust that the token the contract is interacting with isn't hostile. That said, the code is written with the intention that it wouldn't be subject to reentrancy bugs etc in the event that someone did use it with a maliciously coded token.
[...]


Verify architectural change for ERC20 Tokens
From Audit Brief:
[...] one RealitioERC20 contract per supported token, and as currently one Arbitrator contract per arbitrator per RealitioERC20 contract
        


  

Figure: relationships of the contracts under audit




The interpretation of the statement made in the brief, aligns with the structure and behavior in the code.
Verify token invariance
The token is set during initial setup and once set, cannot be changed.


This relationship is enforced In RealitioERC20.sol:


 @@ -182,8 +181,16 @@ contract Realitio is BalanceHolder {
        _;
    }


    function setToken(IERC20 _token) 
    public
    {
        require(token == 
IERC20(0x0), "Token can only be initialized once");
        token = _token;
    }


Statement is true if setToken is called on deployment.
Verify token use
[...] All question rewards and bonds are denominated in that token.




@@ -169,9 +168,9 @@ contract Realitio is BalanceHolder {


modifier bondMustDouble(bytes32 question_id) {
	   require(msg.value > 0, "bond must be positive");
	   require(msg.value >= 
           (questions[question_id].bond.mul(2)), 
             "bond must be double at least previous bond");
	modifier bondMustDouble(bytes32 question_id, uint256 tokens) {
	   require(tokens > 0, "bond must be positive");
	   require(tokens >= 
           (questions[question_id].bond.mul(2)), 
            "bond must be double at least previous bond");
	       _;
	   }


Line 243: Payable is removed as it is not needed for tokens.


function createTemplateAndAskQuestion(
        string content, 
        string question, address arbitrator, uint32 timeout,     
        uint32 opening_ts, uint256 nonce 
    ) 
 // stateNotCreated is enforced by the internal _askQuestion
	 public payable returns (bytes32) {
	 public returns (bytes32) {
	

Line 284 introduces not only the tokens parameter 


change:
<    /// @notice Ask a new question with a bounty and return the ID
---
>     /// @notice Ask a new question and return the ID
New line:
<     /// @param tokens The combined initial question bounty and question fee
Change: 
<     function askQuestionERC20(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 tokens)
---
>     function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce)




<     public returns (bytes32) {
< 
<         _deductTokensOrRevert(tokens);
---
>     public payable returns (bytes32) {


<         _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts, tokens);
---
>         _askQuestion(question_id, content_hash, arbitrator, timeout, opening_ts);


Line 330 and line 336: 


+        uint256 bounty = tokens;
-        uint256 bounty = msg.value;
The replacement of an uint256 value contained in msg.value with one in the parameter tokens, arguably cannot introduce new vulnerabilities as their value range is the same and no gas implication are known.


Line 284 Function 
function askQuestionERC20(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 tokens)


Line 286 payable gone: that's fine
Line 288 _deduceTokensOrRevert()
MEDIUM: do not suppose tokens are ER20 compliant


A new function is introduced:
function _deductTokensOrRevert(uint256 tokens)
   internal {


       if (tokens == 0) {
           return;
       }


       uint256 bal = balanceOf[msg.sender];


// Deduct any tokens you have in your internal balance first
       if (bal > 0) {
           if (bal >= tokens) {
               balanceOf[msg.sender] = bal.sub(tokens);
               return;
           } else {
               tokens = tokens.sub(bal);
               balanceOf[msg.sender] = 0;
           }
       }
       // Now we need to charge the rest from
require(token.transferFrom(msg.sender, address(this),   tokens), "Transfer of tokens failed, insufficient approved balance?");
       return;


   }


If no token exists we stop deducing tokens and allow the function to execute.
Then we retrieve the balance of the sender.
Functions that call this private function are
* fundAnswerBountyERC20
* askQuestionERC20
* submitAnswerERC20
* submitAnswerCommitmentERC20


Only if a balance exists, can we look to subtract tokens from the balance of the sender.
But if the balance is less than the tokens suggested, we get all the money from the balance and just use the tokens that are possible. This is defensive and allows a frictionless usage of the function. 
Still there is a potential issue with 
require(token.transferFrom(msg.sender, address(this),   tokens), "Transfer of tokens failed, insufficient approved balance?");


Others (Richard Meissner from Gnosis) have acknowledged that not all tokens return the boolean value correctly:
https://github.com/gnosis/safe-contracts/blob/5a8b07326faf30c644361c9d690d57dbeb838698/contracts/common/SecuredTokenTransfer.sol
The fact that Gnosis makes the choice to verify the token transfer in this complicated way indicates that there are tokens that do not implement the return value correctly or that it is seen as a potential threat. This is supported by empirical evidence (see Gitter Chat)


From Gnosis Gitter:
Roland Kofler @rolandkofler 15:28
what is the rationale behind SecuredTokenTransfer.sol? especially do you find that transfer functions are not implemented correctly in important token contracts to that you need this functionality? @rmeissner


Andrew Redden @androolloyd 15:30
Some tokens aren’t implemented corrected and their return status doesn’t indicate a success.


Wrappers are used to catch the diff return codes to ensure that no unintended reverts will occur




Roland Kofler @rolandkofler 15:31
thank you, can you give an example of such a token @androolloyd ?


Andrew Redden @androolloyd 15:33
Off hand I don’t have a list, I believe some implementations in OpenZeppelin were incorrect.


Some quick googling should suffice.




Roland Kofler @rolandkofler 15:34
https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca
thank you




TRST is implemented correctly:
  // See ERC20
  // WARNING: If you call this with the address of a contract, the contract will receive the
  // funds, but will have no idea where they came from. Furthermore, if the contract is
  // not aware of TRST, the tokens will remain locked away in the contract forever.
  // It is always recommended to call instead compareAndApprove() (or approve()) and have the
  // receiving contract withdraw the money using transferFrom().
  function transfer(address _to, uint256 _value) public returns (bool) {
    if (balances[msg.sender] >= _value) {
      balances[msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(msg.sender, _to, _value);
      return true;
    }
    return false;
  }


  // See ERC20
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value) {
      balances[_from] -= _value;
      allowed[_from][msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(_from, _to, _value);
      return true;
    }
    return false;
  }




Added token parameter 326:
function _askQuestion(bytes32 question_id, bytes32 content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 tokens)


Removed 336:  uint256 bounty = msg.value;


If msg.sender is not the arbitrator then the question fee is applied and it is that the bounty, is at least the question fee. We then subtract the fee from the bounty.


And we add it: 


 Line 361 function fundAnswerBountyERC20(bytes32 question_id, uint256 tokens)


Add funds to bounty of a question even after the question is created. Can be done even in arbitration before finalization.
Arguably the arbiter gets no fees from a bounty.
But now it’s with tokens.
Now tokens is deducted, because we have to do accounting now. Not ethereum blocks.
It allows for 0 bounties. That’s strange.
Should it? Mark it minor as it spams the log
MINOR: allowing 0 bounties can spam the log
Consider if it is intentional to allow for zero bounties, it might be contentions to mark this as MEDIUM, but the attitude in this audit is to err on the false positive side.




questions[question_id].bounty = questions[question_id].bounty.add(msg.value);
       emit LogFundAnswerBounty(question_id, msg.value, questions[question_id].bounty, msg.sender);
------------------
_deductTokensOrRevert(tokens);
questions[question_id].bounty = questions[question_id].bounty.add(tokens);
       emit LogFundAnswerBounty(question_id, tokens, questions[question_id].bounty, msg.sender);


Accounting and then doing the same with bounty accounting as with normal eth,
cannot really make something more wrong:


Line 375: 
       stateOpen(question_id)
       bondMustDouble(question_id, tokens)
       previousBondMustNotBeatMaxPrevious
           (question_id, max_previous)
       external {
               _deductTokensOrRevert(tokens);
      _addAnswerToHistory(question_id, answer, 
msg.sender, tokens, false);
 _updateCurrentAnswer(question_id, answer, 
questions[question_id].timeout);
   }


Here also the accounting function is added and the payable removed, this is a pattern.
Cannot introduce new problems.


Line 408:
function submitAnswerCommitmentERC20(bytes32 question_id, bytes32 answer_hash, uint256 max_previous, address _answerer, uint256 tokens)
       stateOpen(question_id)
       bondMustDouble(question_id, tokens)
 previousBondMustNotBeatMaxPrevious(question_id,   
    max_previous)
   external {


Seems to be the same as we have done until now.
It’s isomorph and therefore can not introduce new problems.
MEDIUM: correct `require` string
https://github.com/realitio/realitio-contracts/blob/77f79aec8e2976c0cf44820ec9daf159991df832/truffle/contracts/RealitioERC20.sol#L344


Replace `ETH` with `tokens` or similar
           require(bounty >= question_fee, "ETH provided must cover question fee");  
Verify how payments are made
arbitration is still denominated and requested in ETH.


Found to be true in code, as there is no change here


per-question fee, which is deducted from the funds sent to the initial bounty set when a question is created, this is denominated in the token.


Found to be true in the newly introduced helper method bounty or revert 


the Arbitrator contract now has a single additional function allowing its owner to withdraw ERC20 funds that it may have collected in the RealitioERC20 contract.


/// @Withdraw any accumulated token fees to the specified address
/// addr The address to which the balance should be sent
/// Only needed if the Realitio contract used is using an ERC20 token
/// Also only normally useful if a per-question fee is set, otherwise we only have ETH.
   function withdrawERC20(IERC20 _token, address addr)
       onlyOwner
   public {
       uint256 bal = _token.balanceOf(address(this));
       IERC20(_token).transfer(addr, bal);
   }


So if the arbitrator address has tokens he can transfer it to a certain balance.


Verify reentrancy protection against token
the code is written with the intention that it wouldn't be subject to reentrancy bugs etc in the event that someone did use it with a maliciously coded token.


This was always the case and did not change. Especially no state change happens after any transfer in the functions RealitionERC20.withdrawToRegisteredWalletERC20(), BalancHolder.withdraw().
Verify execution isomorphism of previous changes
And from Audit Clarification results:


https://github.com/realitio/realitio-contracts/commit/5422046c510dc86ea1ede715b77d9a1673f5b72f


https://github.com/realitio/realitio-contracts/commit/c64f28ce0c2d292fd2b0835ce8656e26e0d97c27


These two changes are made to Realitio.sol that are intended to leave its behaviour unchanged, but make it easier to make the subsequent RealitioERC.sol version work with minimal changes. This is then cloned to RealitioERC20.sol and all the subsequent action is in RealitioERC20.sol, plus an extra function in Arbitrator.sol.


This has been shown to be true!
MINOR: different Solidity versions in sources
Issuing cmd find in /truffle/contracts:


find . -type f -exec grep "\^0.4" '{}' \; -print


Shows that there are many different solidity versions employed. Can be unified. Note 
./SplitterWallet.sol uses pragma solidity ^0.4.25;


pragma solidity ^0.4.6;
./CallbackClient.sol
pragma solidity ^0.4.24;
./IRealitio.sol
pragma solidity ^0.4.24;
./Arbitrator.sol
pragma solidity ^0.4.18;
./IBalanceHolder.sol
pragma solidity ^0.4.6;
./ExplodingCallbackClient.sol
pragma solidity ^0.4.24;
./RegisteredWalletArbitrator.sol
pragma solidity ^0.4.2;
./Migrations.sol
pragma solidity ^0.4.15;
./MultiSigWallet.sol
pragma solidity ^0.4.24;
./Zeppelin.sol
pragma solidity ^0.4.24;
./RealitioSafeMath32.sol
pragma solidity ^0.4.24;
./RealitioSafeMath256.sol
pragma solidity ^0.4.24;
./ERC20Token.sol
pragma solidity ^0.4.24;
./RealitioERC20.sol
pragma solidity ^0.4.18;
./Owned.sol
pragma solidity ^0.4.24;
./Realitio.sol
pragma solidity ^0.4.24;
./IERC20.sol
pragma solidity ^0.4.25;
./SplitterWallet.sol
pragma solidity ^0.4.18;
./BalanceHolder.sol
pragma solidity ^0.4.18;
./BalanceHolderERC20.sol


MINOR: there are two BalanceHolder contracts
Both BalanceHolder.sol and BalanceHolderERC20.sol contain a contract named BalanceHolder. The name of a solidity file has no grammatical influence in the compilation process. Consider renaming BalanceHolder for ERC20 to BalanceHolderERC20, to explicitly express the desire to inherit from a specific contract. 


Results from Mythril
docker run -v $(pwd):/tmp mythril/myth --solv 0.4.24 -x /tmp/RealitioERC20.sol
Executing: wget https://github.com/ethereum/solidity/releases/download/v0.4.24/solc-static-linux -c -O /root/.py-solc/solc-v0.4.24/bin/solc
Checking installed executable version @ /root/.py-solc/solc-v0.4.24/bin/solc
Executing: /root/.py-solc/solc-v0.4.24/bin/solc --version
solc successfully installed at: /root/.py-solc/solc-v0.4.24/bin/solc


The analysis was completed successfully. No issues were detected.


docker run -v $(pwd):/tmp mythril/myth --solv 0.4.24 -x /tmp/BalanceHolderERC20.sol
[...]
==== External Call To Fixed Address ====
SWC ID: 107
Severity: Low
Contract: BalanceHolder
Function name: withdraw()
PC address: 625
Estimated Gas Usage: 7038 - 28314
The contract executes an external message call.
An external function call to a fixed contract address is executed. Make sure that the callee contract has been reviewed carefully.
--------------------
In file: /tmp/BalanceHolderERC20.sol:20


token.transfer(msg.sender, bal)


--------------------


The Mythril advice is acknowledged by Realitio and consciously excluded from the audit.
Each Token contract needs to be scrupulously examined as a new potential threat to the security of RealitoERC20. 


docker run -v $(pwd):/tmp mythril/myth --solv 0.4.24 -x /tmp/Arbitrator.sol
The tool hangs and consumes all the computer resources. I cannot use the tool on Arbitrator.sol.

Conclusions
-----------

By current standards of security audits and the best knowledge of the auditor the changes made in the Code under Audit do introduce 2 new potential security threats.
1. While benevolence of the token contracts are assumed, we can still improve the resilience of the code by checking the successful execution of a transfer: MEDIUM: do not suppose tokens are ER20 compliant. It might be contentions to mark this as MEDIUM, but the attitude in this audit is to err on the false positive side.
2. There is a documentation error in a `require` string. MEDIUM: correct `require` string.  It might be contentions to mark this as MEDIUM, but the attitude in this audit is to err on the false positive side.


Minor improvements can be made, consider renaming the BalanceHolder contract for ERC20 to BalanceHolderER20 to explicitly reflect the correct dependency and allow for grammatical checks.
For the changes based on the audit, see also Abstract


Roland Kofler Blockchain Consulting is honored to help the pioneering work of Realitio and WeTrust to change our world  for the better. Please reach out to me personally any time.


roland@ibc.technology 
roland.kofler@gmail.com
+4915783430243
Appendix
List of commits since last audit
This is the full assessment of the commits before and after CuA commits.
The colors reflect the first inspection to identify potential problems.


Count        Description        
        30        CAN’T TOUCH CODE UNDER AUDIT
        10        UNRISKY FOR CODE UNDER AUDIT
        3        SOME RISK FOR CODE UNDER AUDIT
Figure: subjective risk statistics for the changes until the audit.


Commits on Jun 8, 2019
* tidy, add tests of token balance handling
* ed authored and ed committed 15 days ago
* 77f79ae 
* Recompile with ERC20 version
* ed authored and ed committed 15 days ago
* 5c52bd9 
* Realitio ERC20 version uses ERC20 for everything except arbitration. … …
* ed authored and ed committed 19 days ago
* ec8db37 
Commits on Jun 4, 2019
        Add Zeppelin ERC20 interface, plus token contract for tests
ed authored and ed committed 19 days ago
391af7b 
Start ERC20 version with exact copies of our original Realitio.sol co…
ed authored and ed committed 17 days ago
* 4959544 
* Remove bondMustBeZero modifier, which as auditor previously pointed o…
* Edmund Edgar authored and ed committed on May 17
* * Break the commitment timeout calculation and storage into its own int…
* Edmund Edgar authored and ed committed on May 17
* 5422046 
* ⭐CuA        Merge branch 'master' of github.com:realitio/realitio-contracts
                ed authored and ed committed 15 days ago
* e5ccb98 
* * Test updates: Test compiled code not sourcce code, update to python3 … 
* ed authored and ed committed 15 days ago
* 83b4475 
Commits on May 28, 2019
* Kleros integration is now ready for prime-time
* Edmund Edgar committed 22 days ago
* 72351a2 
* Kleros contract updates
* Edmund Edgar committed 22 days ago
* 771c443 
Commits on May 11, 2019
* Update kleros contract addresses
* Edmund Edgar committed on May 11
* 5a8b298 
Commits on May 4, 2019
* New kleros arbitrator addresses
* Edmund Edgar committed on May 4
* 477d01b 
Commits on Apr 10, 2019
* updated kleros contract addresses, now with metaevidence
* Edmund Edgar committed on Apr 10
* f80e6ca 
Commits on Apr 2, 2019
* Add Kleros arbitrator options
* Edmund Edgar committed on Apr 2
* 92cd12e 
Commits on Feb 13, 2019
* Add kovan arbitrator setting
* edmundedgar committed on Feb 13
* 97b53b5 
* Add Kovan contracts
* edmundedgar committed on Feb 13
* f1a9aa5 
Commits on Nov 27, 2018
* Move wrongly-placed contract json definitions
* ed authored and ed committed on Nov 27, 2018
* 6e8173a 
* Compiled contracts for a multi-sig arbitrator
* ed authored and ed committed on Nov 27, 2018
* 9b556f9 
* Delete MultiSigArbitratorController, we're instead using a combinatio… …
* ed authored and ed committed on Nov 27, 2018
* 3db1ce8 
Commits on Nov 17, 2018
* Add Registered Wallet Arbitrator contract for use in arbitration cons… …
* ed authored and ed committed on Nov 17, 2018
Not part of contracts under audit
* 0c2ee2a 
* Rename functions and rearrange to clarify how duplicate addresses are… …
ed authored and ed committed on Nov 17, 2018
        Changes are isomorph. 
By definition isomorphic instructions will produce exactly the sameoutput


   * f75e802 
Commits on Nov 15, 2018
   * Test the worst case for gas usage (100 addresses, all new and differe… …
   * ed authored and ed committed on Nov 15, 2018
   * 7348310 
   * Add gas test for max recipient limit
   * ed authored and ed committed on Nov 15, 2018
   * 7d2c999 
   * Add require error message
   * ed authored and ed committed on Nov 15, 2018
   * d434d90 
   * More tests
   * ed authored and ed committed on Nov 15, 2018
   * ab0ba0a 
   * Add error messages to require statements
   * ed authored and ed committed on Nov 15, 2018
   * 80b82fa 
   * improve comments
   * ed authored and ed committed on Nov 15, 2018
   * 09f851b 
   * Add some asserts to make sure we never allocate more money than we ha… …
   * ed authored and ed committed on Nov 15, 2018
   * bd65641 
Commits on Nov 14, 2018
   * Tests for splitter wallet
   * ed authored and ed committed on Nov 14, 2018
   * 106a6ce 
   * Rename
   * ed authored and ed committed on Nov 14, 2018
   * 7c863da 
   * Delete old callback code tests: We didn't get that code audited, and … …
   * ed authored and ed committed on Nov 14, 2018
   * b55d054 
   * Fix comment
   * ed authored and ed committed on Nov 14, 2018
   * a7a34a7 
   * Multisig arbitration contracts for arbitration consortiums, based on … …
   * ed authored and ed committed on Nov 14, 2018
   * f633aea 
Commits on Nov 9, 2018
   * Bump minor version
   * Edmund Edgar committed on Nov 9, 2018
   * e1a07c5 
   * Drop back one minor solc version, deployed with 0.4.25 but current tr… …
   * Edmund Edgar committed on Nov 9, 2018
   * b730748 
   * Recent contracts need a higher gas limit, don't force the network id
   * Edmund Edgar committed on Nov 9, 2018
   * bd09d75 
Commits on Nov 2, 2018
   * Bump version
   * Edmund Edgar committed on Nov 2, 2018
   * 052af40 
   * Allow later solidity versions
   * ed authored and ed committed on Nov 2, 2018
   * 0563976 
Commits on Oct 27, 2018
   * interface should also inherit interface
   * ed authored and ed committed on Oct 27, 2018
   * e222de7 
   * Rename interface contracts as I...
   * ed authored and ed committed on Oct 27, 2018
   * 872c697 
Commits on Oct 26, 2018
   * bump version number
   * Edmund Edgar committed on Oct 26, 2018
   * bcbf35b 


Commits on Oct 20, 2018
   * bump version
   * Edmund Edgar committed on Oct 20, 2018
   * 033b61a 
   * Redeploy ganache bootstrap contracts
   * ed authored and ed committed on Oct 20, 2018
   * 6aafc45 
   * Rename contract name in migrations
   * ed authored and ed committed on Oct 20, 2018
   * 40ad612 
   * Update and rationalize interface files
   * ed authored and ed committed on Oct 20, 2018
   * 390f2c9 
   * Add ganache-bootstrap addresses
   * ed authored and ed committed on Oct 20, 2018
   * cbabddb 
   * bump version
   * Edmund Edgar committed on Oct 20, 2018                                                              8f762f8
   * correct mistaken network ID
   * Edmund Edgar committed on Oct 20, 2018
   * 81f36df 
   * Newly-deployed contracts in config files
   * Edmund Edgar committed on Oct 20, 2018
   * b31e9d5  
Comparing the baseline with the new ERC20 contracts
                git checkout 49595443742afe1d8ae0495110a78d1cc780970e
                sdiff BalanceHolder.sol BalanceHolderERC20.sol


pragma solidity ^0.4.18;                                pragma solidity ^0.4.18;


contract BalanceHolder {                                contract BalanceHolder {


    mapping(address => uint256) public balanceOf;            mapping(address => uint256) public balanceOf;


    event LogWithdraw(                                            event LogWithdraw(
        address indexed user,                                        address indexed user,
        uint256 amount                                                uint256 amount
    );                                                            );


    function withdraw()                                     function withdraw() 
    public {                                                    public {
        uint256 bal = balanceOf[msg.sender];                        uint256 bal = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;                                balanceOf[msg.sender] = 0;
        msg.sender.transfer(bal);                                msg.sender.transfer(bal);
        emit LogWithdraw(msg.sender, bal);                          emit LogWithdraw(msg.sender, bal);
    }                                                            }


}                                                        }


No differences detected


Now I only use `diff` for large files to output only differences:


        diff Arbitrator.sol ArbitratorERC20.sol
        Output: 
No differences detected


References
----------

Audit Brief 
Email: “Realitio WeTrust integration audit”, Edmund Edgar <ed@socialminds.jp>, 8 June 2019 at 04:51, To: Roland <roland.kofler@gmail.com>, Cc: Hoang Nguyen <hoang@wetrust.io>


[...]
The audit consists of changes to 2 files, RealitioERC20.sol (changes from Realitio.sol) and Arbitrator.sol. I've also updated another auditor contract that i was working on, but it's not part of the scope of this audit. 


The new version is in the branch feature-erc20-audit
https://github.com/realitio/realitio-contracts/tree/feature-erc20-audit


All the solidity code changes are in this commit:
https://github.com/realitio/realitio-contracts/commit/ec8db377d0ef74c5bf599894240f6b54db113338


The principle is that we will have one RealitioERC20 contract per supported token, and as currently one Arbitrator contract per arbitrator per RealitioERC20 contract. The token is set during initial setup and once set cannot be changed. All question rewards and bonds are denominated in that token.


As previously, arbitration is still denominated and requested in ETH. 
If the arbitrator sets a per-question fee, which is deducted from the funds sent to the initial bounty set when a question is created, this is denominated in the token.
Accordingly, the Arbitrator contract now has a single additional function allowing its owner to withdraw ERC20 funds that it may have collected in the RealitioERC20 contract.


Since a RealitioERC20 contract only handles a single token, which cannot be changed after setup, users must implicitly trust that the token the contract is interacting with isn't hostile. That said, the code is written with the intention that it wouldn't be subject to reentrancy bugs etc in the event that someone did use it with a maliciously coded token.


I've updated the tests to use python3 and recent versions of the ever-changing python test stuff - unfortunately I haven't yet figured out how to adjust the block gas limit in my test code, and I don't want to keep everyone waiting while I do so if you want to run them you have to hack this file.
https://github.com/ethereum/eth-tester/blob/b9ad39a9ee8ef041d2ca2d2c2d1d1e28d3f36da9/eth_tester/backends/pyevm/main.py#L66
[...]
Audit Clarification
Email: 15 June 2019 at 22:33 From Edmund Edgar <ed@socialminds.jp>
To: Roland <roland.kofler@gmail.com> Subject:        Realitio WeTrust integration audit


Yes, that chain of kleros commits should just be changes to the arbitrators list, and the kleros arbitration contract that's the subject of those changes (along with kleros itself) is out of scope. There shouldn't be any changes to the contracts in scope (Realitio.sol, duplicated to RealitioERC20.sol and Arbitrator.sol) until you get to:


https://github.com/realitio/realitio-contracts/commit/5422046c510dc86ea1ede715b77d9a1673f5b72f


https://github.com/realitio/realitio-contracts/commit/c64f28ce0c2d292fd2b0835ce8656e26e0d97c27


These two are changes made to Realitio.sol that are intended to leave its behaviour unchanged but make it easier to make the subsequent RealitioERC.sol version work with minimal changes. This is then cloned to RealitioERC20.sol and all the subsequent action is in RealitioERC20.sol, plus an extra function in Arbitrator.sol.


However it would be good if you could verify that what I just said is true, ie that Realitio.sol before the commits I mentioned matches the last thing you audited and I'm not trying to sneak another change past you.
        [...]
Ethereum Safety
https://github.com/ethereum/wiki/wiki/Safety
ConsenSys Security Best Practices
ConsenSys Security Best Practice
https://consensys.github.io/smart-contract-best-practices/
DASP
Decentralised Application Security Project
https://dasp.co/
Known Solidity Bugs
https://solidity.readthedocs.io/en/v0.5.9/bugs.html
https://github.com/ethereum/solidity/blob/develop/docs/bugs_by_version.json






/