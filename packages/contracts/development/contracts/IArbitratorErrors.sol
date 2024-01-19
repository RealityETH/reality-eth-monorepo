// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.20;

interface IArbitratorErrors {
    /// @notice The arbitrator must have set a non-zero fee for the question
    error TheArbitratorMustHaveSetANonZeroFeeForTheQuestion();
    /// @notice The question must not have been finalized
    error TheQuestionMustNotHaveBeenFinalized();
}
