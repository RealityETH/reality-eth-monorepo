// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IRealityETHErrors {

    /// @notice msg.sender must be arbitrator
    error MsgSenderMustBeArbitrator();
    /// @notice question must not exist
    error QuestionMustNotExist();
    /// @notice question must exist
    error QuestionMustExist();
    /// @notice question must not be pending arbitration
    error QuestionMustNotBePendingArbitration();
    /// @notice finalization deadline must not have passed
    error FinalizationDeadlineMustNotHavePassed();
    /// @notice opening date must have passed
    error OpeningDateMustHavePassed();
    /// @notice question must be pending arbitration
    error QuestionMustBePendingArbitration();
    /// @notice finalization dealine must not have passed
    error FinalizationDealineMustNotHavePassed();
    /// @notice question must be finalized
    error QuestionMustBeFinalized();
    /// @notice bond must be positive
    error BondMustBePositive();
    /// @notice bond must exceed the minimum
    error BondMustExceedTheMinimum();
    /// @notice bond must be double at least previous bond
    error BondMustBeDoubleAtLeastPreviousBond();
    /// @notice bond must exceed max_previous
    error BondMustExceedMax_Previous();
    /// @notice template must exist
    error TemplateMustExist();
    /// @notice timeout must be positive
    error TimeoutMustBePositive();
    /// @notice timeout must be less than 365 days
    error TimeoutMustBeLessThan365Days();
    /// @notice Tokens provided must cover question fee
    error TokensProvidedMustCoverQuestionFee();
    /// @notice answerer must be non-zero
    error AnswererMustBeNonZero();
    /// @notice commitment must not already exist
    error CommitmentMustNotAlreadyExist();
    /// @notice commitment must not have been revealed yet
    error CommitmentMustNotHaveBeenRevealedYet();
    /// @notice reveal deadline must not have passed
    error RevealDeadlineMustNotHavePassed();
    /// @notice Question must already have an answer when arbitration is requested
    error QuestionMustAlreadyHaveAnAnswerWhenArbitrationIsRequested();
    /// @notice answerer must be provided
    error AnswererMustBeProvided();
    /// @notice You must wait for the reveal deadline before finalizing
    error YouMustWaitForTheRevealDeadlineBeforeFinalizing();
    /// @notice Question was settled too soon and has not been reopened
    error QuestionWasSettledTooSoonAndHasNotBeenReopened();
    /// @notice Question replacement was settled too soon and has not been reopened
    error QuestionReplacementWasSettledTooSoonAndHasNotBeenReopened();
    /// @notice You can only reopen questions that resolved as settled too soon
    error YouCanOnlyReopenQuestionsThatResolvedAsSettledTooSoon();
    /// @notice content hash mismatch
    error ContentHashMismatch();
    /// @notice arbitrator mismatch
    error ArbitratorMismatch();
    /// @notice timeout mismatch
    error TimeoutMismatch();
    /// @notice opening_ts mismatch
    error Opening_TsMismatch();
    /// @notice min_bond mismatch
    error Min_BondMismatch();
    /// @notice Question is already reopening a previous question
    error QuestionIsAlreadyReopeningAPreviousQuestion();
    /// @notice Question has already been reopened
    error QuestionHasAlreadyBeenReopened();
    /// @notice content hash must match
    error ContentHashMustMatch();
    /// @notice arbitrator must match
    error ArbitratorMustMatch();
    /// @notice timeout must be long enough
    error TimeoutMustBeLongEnough();
    /// @notice bond must be high enough
    error BondMustBeHighEnough();
    /// @notice at least one history hash entry must be provided
    error AtLeastOneHistoryHashEntryMustBeProvided();
    /// @notice History input provided did not match the expected hash
    error HistoryInputProvidedDidNotMatchTheExpectedHash();

}
