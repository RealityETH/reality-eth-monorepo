// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RealityETH_v4_0} from "../src/RealityETH-4.0.sol";
import {IRealityETHErrors} from "../src/interfaces/IRealityETHErrors.sol";
import {AnswerType, Template, BondTier} from "../src/RealityETHTypes.sol";

/// Tests for the per-template bond tiers on the ETH core: tiered timeout scaling and the
/// extra arbitrator fee (bond + fee derived from the value sent), plus validation guards.
contract V4BondTiersTest is Test {
    RealityETH_v4_0 internal rc;
    address internal arb = address(0xA4B);
    uint32 internal constant TIMEOUT = 30;
    uint256 internal constant MIN_BOND = 1000;

    function setUp() public {
        rc = new RealityETH_v4_0(address(0));
        vm.deal(address(this), 1_000_000 ether);
    }

    function _one(string memory s) internal pure returns (string[] memory a) {
        a = new string[](1);
        a[0] = s;
    }

    function _none() internal pure returns (string[] memory) {
        return new string[](0);
    }

    // Uint template (freeform answers) with minBond fixed to MIN_BOND; arbitrator supplied per question.
    function _uintTemplate() internal pure returns (Template memory) {
        return Template(
            AnswerType.Uint,
            0,
            false,
            false,
            false,
            false,
            false,
            true,
            address(0),
            MIN_BOND,
            _one(""),
            _none(),
            "",
            "",
            ""
        );
    }

    // Tiers: at 200% of minBond -> timeout x2, +10% fee; at 400% -> timeout x3, +20% fee.
    function _bondTiers() internal pure returns (BondTier[] memory c) {
        c = new BondTier[](2);
        c[0] = BondTier(200, 200, 10);
        c[1] = BondTier(400, 300, 20);
    }

    function _askWithBondTiers() internal returns (bytes32) {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        return rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
    }

    function test_bond_tiers_scale_timeout_and_fee() public {
        bytes32 qid = _askWithBondTiers();
        uint256 t0 = block.timestamp;

        // First answer at exactly minBond (100% -> implicit [100,100,0]): no fee, base timeout.
        rc.submitAnswer{value: MIN_BOND}(qid, bytes32(uint256(42)), 0);
        assertEq(rc.questions(qid).bond, MIN_BOND, "bond == value at the base tier");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
        assertEq(rc.balanceOf(arb), 0, "no fee at the base tier");

        // Second answer: send 2200 -> 220% of minBond -> tier (200,200,10). fee 10% on top, so
        // bond = 2200*100/110 = 2000, fee = 200, timeout x2.
        rc.submitAnswer{value: 2200}(qid, bytes32(uint256(43)), 0);
        assertEq(rc.questions(qid).bond, 2000, "derived bond = value*100/(100+fee)");
        assertEq(rc.balanceOf(arb), 200, "fee credited to arbitrator");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 2, "timeout x2");

        // Third answer: send 4800 -> 480% -> tier (400,300,20). bond = 4800*100/120 = 4000 (doubles
        // 2000), fee = 800, timeout x3.
        rc.submitAnswer{value: 4800}(qid, bytes32(uint256(44)), 0);
        assertEq(rc.questions(qid).bond, 4000, "derived bond at tier 2");
        assertEq(rc.balanceOf(arb), 200 + 800, "cumulative fees");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT * 3, "timeout x3");
    }

    // No bond tiers => value is the bond, no fee, base timeout (unchanged behaviour).
    function test_no_bond_tiers_unchanged() public {
        uint256 id = rc.createTemplate(_uintTemplate());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        uint256 t0 = block.timestamp;
        rc.submitAnswer{value: 5000}(qid, bytes32(uint256(1)), 0);
        assertEq(rc.questions(qid).bond, 5000, "bond == value");
        assertEq(rc.balanceOf(arb), 0, "no fee");
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + TIMEOUT, "base timeout");
    }

    // Bond tiers need a positive minBond (thresholds are a percentage of it).
    function test_bond_tiers_requires_minbond() public {
        // template with bond tiers but minBond left to the asker, who supplies 0
        Template memory t = Template(
            AnswerType.Uint, 0, false, false, false, false, false, false, address(0), 0, _one(""), _none(), "", "", ""
        );
        uint256 id = rc.createTemplate(t, _bondTiers());
        vm.expectRevert(IRealityETHErrors.MinBondRequiredForBondTiers.selector);
        rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0); // minBond 0
    }

    // ---- tiers validation --------------------------------------------------

    function _rejectsBondTiers(BondTier[] memory c) internal {
        vm.expectRevert(IRealityETHErrors.BondTiersInvalid.selector);
        rc.createTemplate(_uintTemplate(), c);
    }

    function test_bond_tiers_validation_rejects_bad() public {
        // first threshold must be > 100
        BondTier[] memory a = new BondTier[](1);
        a[0] = BondTier(100, 100, 0);
        _rejectsBondTiers(a);

        // thresholds must strictly increase
        BondTier[] memory b = new BondTier[](2);
        b[0] = BondTier(200, 200, 0);
        b[1] = BondTier(200, 300, 0);
        _rejectsBondTiers(b);

        // timeouts must not decrease
        BondTier[] memory c = new BondTier[](2);
        c[0] = BondTier(200, 200, 0);
        c[1] = BondTier(400, 150, 0);
        _rejectsBondTiers(c);

        // fee must be <= 100
        BondTier[] memory d = new BondTier[](1);
        d[0] = BondTier(200, 200, 101);
        _rejectsBondTiers(d);

        // fees must not decrease (tiers are keyed on the bond, so a higher bond can't pay a lower fee)
        BondTier[] memory e = new BondTier[](2);
        e[0] = BondTier(200, 200, 20);
        e[1] = BondTier(400, 300, 10);
        _rejectsBondTiers(e);
    }

    // Bond-keyed with a phased-in fee: a value in the gap above a threshold pins the bond at the
    // threshold and takes the remainder as the (partial) fee, so the fee ramps in instead of jumping.
    function test_value_in_gap_stays_in_lower_tier() public {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        // 2100 clears the 200% threshold (2000) but can't cover its 10% fee (which needs 2200), so the
        // bond stays at the base tier's max (1999) with the base timeout, and the excess 101 is the fee.
        (uint256 bond, uint256 fee, uint256 timeoutPct, uint32 eff) = rc.getBondSettingsForValue(qid, 2100);
        assertEq(bond, 1999, "bond stays at the lower tier's max");
        assertEq(fee, 101, "the excess over the lower-tier bond is the fee");
        assertEq(timeoutPct, 100, "lower (base) tier timeout, not escalated");
        assertEq(uint256(eff), TIMEOUT, "base timeout");
        rc.submitAnswer{value: 2100}(qid, bytes32(uint256(5)), 0);
        assertEq(rc.questions(qid).bond, 1999, "lower-tier bond recorded");
        assertEq(rc.balanceOf(arb), 101, "excess fee to the arbitrator");

        // getAnswerFeeForBond is a direct per-tier lookup: 4000 is at the 400% tier (20%) -> 800
        assertEq(rc.getAnswerFeeForBond(qid, 4000), 800, "tier-2 fee is a direct 20% of the bond");
    }

    // The recorded bond never decreases as the value rises (the plateau holds it flat, no downward jump).
    function test_bond_is_monotonic_across_threshold() public {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        (uint256 b1,,,) = rc.getBondSettingsForValue(qid, 1999); // base, just below the threshold
        (uint256 b2,,,) = rc.getBondSettingsForValue(qid, 2000); // in the gap -> held at the lower tier's max
        (uint256 b3,,,) = rc.getBondSettingsForValue(qid, 2200); // enters the tier once its fee is covered
        (uint256 b4,,,) = rc.getBondSettingsForValue(qid, 2310); // climbing within the tier
        assertEq(b1, 1999, "base: bond == value");
        assertEq(b2, 1999, "gap: held at the lower tier's max");
        assertEq(b3, 2000, "enters the tier once its fee is covered");
        assertEq(b4, 2100, "climbs within the tier");
        assertGe(b2, b1);
        assertGe(b3, b2);
        assertGe(b4, b3);
    }

    // Over-large multipliers are clamped to one year rather than rejected.
    function test_timeout_clamped_to_one_year() public {
        BondTier[] memory c = new BondTier[](1);
        c[0] = BondTier(200, 60000, 0); // 600x a 30s base would be 5 hours... use a big base to exceed a year
        uint256 id = rc.createTemplate(
            Template(
                AnswerType.Uint,
                0,
                false,
                false,
                false,
                false,
                false,
                true,
                address(0),
                MIN_BOND,
                _one(""),
                _none(),
                "",
                "",
                ""
            ),
            c
        );
        // base timeout 100 days; x600 would be 60000 days, clamped to 365.
        bytes32 qid = rc.askQuestion(id, _one("Q?"), _none(), arb, uint32(100 days), 0, 0);
        uint256 t0 = block.timestamp;
        rc.submitAnswer{value: 2 * MIN_BOND}(qid, bytes32(uint256(1)), 0); // 200% -> the big-multiplier tier
        assertEq(uint256(rc.questions(qid).finalizeTs), t0 + 365 days, "clamped to one year");
    }

    // getBondTiers returns the implicit base tier first, then the template's tiers.
    function test_get_bond_tiers_includes_implicit_base() public {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);
        BondTier[] memory bl = rc.getBondTiers(qid);
        assertEq(bl.length, 3, "implicit base + 2 template tiers");
        assertEq(uint256(bl[0].bondThresholdPct), 100, "base threshold");
        assertEq(uint256(bl[0].timeoutPct), 100, "base timeout");
        assertEq(uint256(bl[0].feePct), 0, "base fee");
        assertEq(uint256(bl[1].bondThresholdPct), 200, "tier 1");
        assertEq(uint256(bl[2].bondThresholdPct), 400, "tier 2");
        // the raw template view excludes the implicit base
        assertEq(rc.getTemplateBondTiers(id).length, 2, "raw tiers exclude the implicit base");
    }

    function test_getters_template_and_bond_settings() public {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);

        // getTemplateForQuestion resolves the question's template in one call
        assertEq(uint256(rc.getTemplateForQuestion(qid).answerType), uint256(AnswerType.Uint), "template type");
        assertEq(rc.getTemplateForQuestion(qid).minBond, MIN_BOND, "template minBond");

        // getBondSettingsForValue previews the split: 2200 (220%) -> bond 2000, fee 200, timeout x2
        (uint256 bond, uint256 fee, uint256 timeoutPct, uint32 eff) = rc.getBondSettingsForValue(qid, 2200);
        assertEq(bond, 2000, "preview bond");
        assertEq(fee, 200, "preview fee");
        assertEq(timeoutPct, 200, "preview timeout multiplier");
        assertEq(uint256(eff), TIMEOUT * 2, "preview effective timeout");

        // base tier (send exactly minBond): no fee, base timeout
        (bond, fee, timeoutPct, eff) = rc.getBondSettingsForValue(qid, MIN_BOND);
        assertEq(bond, MIN_BOND, "base bond");
        assertEq(fee, 0, "base fee");
        assertEq(timeoutPct, 100, "base multiplier");
        assertEq(uint256(eff), TIMEOUT, "base timeout");
    }

    // getAnswerFeeForBond: inverse of the split — the extra fee on top of a desired bond.
    function test_get_answer_fee_for_bond() public {
        uint256 id = rc.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rc.askQuestion(id, _one("Price?"), _none(), arb, TIMEOUT, 0, 0);

        // a bond between minBond (100%) and the first threshold (200%) incurs no fee
        assertEq(rc.getAnswerFeeForBond(qid, 1500), 0, "no fee below first threshold");

        // a bond of 2000 lands at the 200% tier (10% fee) -> fee 200, total to send 2200
        uint256 fee = rc.getAnswerFeeForBond(qid, 2000);
        assertEq(fee, 200, "10% fee for a 2000 bond");
        uint256 value = 2000 + fee;
        (uint256 bond,,,) = rc.getBondSettingsForValue(qid, value);
        assertGe(bond, 2000, "round-trip records at least the target bond");

        // and sending bond + fee actually records the target bond
        rc.submitAnswer{value: value}(qid, bytes32(uint256(7)), 0);
        assertEq(rc.questions(qid).bond, 2000, "bond + fee records the target bond");
    }

    // With no arbitrator (0x0), the escalation fee goes to the treasury rather than being burned.
    function test_bond_tier_fee_to_treasury_when_no_arbitrator() public {
        address treasury = address(0x7EA5);
        RealityETH_v4_0 rct = new RealityETH_v4_0(treasury);
        uint256 id = rct.createTemplate(_uintTemplate(), _bondTiers());
        bytes32 qid = rct.askQuestion(id, _one("Price?"), _none(), address(0), TIMEOUT, 0, 0); // no arbitrator
        rct.submitAnswer{value: MIN_BOND}(qid, bytes32(uint256(1)), 0); // base tier, no fee
        rct.submitAnswer{value: 2200}(qid, bytes32(uint256(2)), 0); // 220% -> 10% fee -> bond 2000, fee 200
        assertEq(rct.questions(qid).bond, 2000, "derived bond");
        assertEq(rct.balanceOf(treasury), 200, "no-arbitrator bond-tier fee credited to the treasury");
    }
}
