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
    /// @notice question must be finalized
    error QuestionMustBeFinalized();
    /// @notice bond must be positive
    error BondMustBePositive();
    /// @notice bond must exceed the minimum
    error BondMustExceedTheMinimum();
    /// @notice bond must be double at least previous bond
    error BondMustBeDoubleAtLeastPreviousBond();
    /// @notice bond must exceed maxPrevious
    error BondMustExceedMaxPrevious();
    /// @notice template must exist
    error TemplateMustExist();
    /// @notice timeout must be positive
    error TimeoutMustBePositive();
    /// @notice timeout must be less than 365 days
    error TimeoutMustBeLessThan365Days();
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
    /// @notice openingTs mismatch
    error OpeningTsMismatch();
    /// @notice minBond mismatch
    error MinBondMismatch();
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
    /// @notice The initial templates have already been created
    error TemplatesAlreadyCreated();
    /// @notice A template must have at least one title part
    error TemplateTitleRequired();
    /// @notice A template may preset up to 256 outcomes for select types, and none otherwise
    error TemplateOutcomesInvalid();
    /// @notice Outcomes supplied at ask time are invalid: required but missing/too many, supplied for a non-select type, or supplied when the template already presets them
    error OutcomesInvalid();
    /// @notice An ask-time override (arbitrator or minBond) was supplied for a field the template already fixes
    error OverrideNotAllowed();
    /// @notice The number of params supplied does not match the template's interpolation slots
    error ParamsLengthMismatch();
    /// @notice Only Uint templates may set decimals
    error TemplateDecimalsInvalid();
    /// @notice A field flagged unused must not carry a preset value
    error TemplateFieldInvalid();
    /// @notice The submitted answer is not valid for this question's template
    error AnswerNotAllowedForTemplate();
}
