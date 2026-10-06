import { assert, describe, test, newMockEvent, clearStore, afterEach } from "matchstick-as/assembly/index"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { LogNewTemplate, LogNewQuestion } from "../generated/RealityETH-3.0-ETH/RealityETH"
import { handleNewTemplate, handleNewQuestion } from "../src/mapping"

// These tests assert the DEFENDED behaviour and are expected to FAIL against the
// current (unpatched) mapping, which substitutes parameters into the template with
// no escaping and then trusts whatever JSON.parse returns — so a crafted parameter
// can break out of its string and override fixed template fields (type/outcomes/
// title), exactly the parameter-injection class fixed in reality-eth-lib.
//
// The intended fix (mirroring the lib's broken-question behaviour): when a parameter
// breaks out of its slot, mark the Question `malformed` and do NOT store the forged
// qType / qTitle / outcomes. `malformed` is a Boolean to be added to the schema.

let SEP = "␟" // U+241F
let CONTRACT = Address.fromString("0x00000000000000000000000000000000000000ff")
let USER = Address.fromString("0x0000000000000000000000000000000000000abc")
let ARB = Address.fromString("0x0000000000000000000000000000000000000dad")

function mockTemplate(templateId: BigInt, text: string): LogNewTemplate {
  let e = changetype<LogNewTemplate>(newMockEvent())
  e.address = CONTRACT
  e.parameters = new Array<ethereum.EventParam>()
  e.parameters.push(new ethereum.EventParam("template_id", ethereum.Value.fromUnsignedBigInt(templateId)))
  e.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(USER)))
  e.parameters.push(new ethereum.EventParam("question_text", ethereum.Value.fromString(text)))
  return e
}

function mockQuestion(questionId: Bytes, templateId: BigInt, data: string): LogNewQuestion {
  let e = changetype<LogNewQuestion>(newMockEvent())
  e.address = CONTRACT
  e.parameters = new Array<ethereum.EventParam>()
  e.parameters.push(new ethereum.EventParam("question_id", ethereum.Value.fromFixedBytes(questionId)))
  e.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(USER)))
  e.parameters.push(new ethereum.EventParam("template_id", ethereum.Value.fromUnsignedBigInt(templateId)))
  e.parameters.push(new ethereum.EventParam("question", ethereum.Value.fromString(data)))
  e.parameters.push(new ethereum.EventParam("content_hash", ethereum.Value.fromFixedBytes(Bytes.fromHexString("0x" + "22".repeat(32)))))
  e.parameters.push(new ethereum.EventParam("arbitrator", ethereum.Value.fromAddress(ARB)))
  e.parameters.push(new ethereum.EventParam("timeout", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(86400))))
  e.parameters.push(new ethereum.EventParam("opening_ts", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000))))
  e.parameters.push(new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))))
  e.parameters.push(new ethereum.EventParam("created", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000))))
  return e
}

function qid(questionId: Bytes): string {
  return CONTRACT.toHexString() + "-" + questionId.toHexString()
}

let BOOL_TMPL = '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}'
// Zodiac/SafeSnap-shaped template: two %s in the title, type fixed afterwards —
// the real on-chain attack surface.
let ZODIAC_TMPL = '{"title": "Did proposal %s in the space pass (hash 0x%s)?", "type": "bool", "category": "DAO proposal", "lang": "en"}'

describe("handleNewQuestion — parameter injection must be rejected", () => {
  afterEach(() => {
    clearStore()
  })

  test("type + outcomes injected via the lang parameter on a bool template", () => {
    let tid = BigInt.fromI32(200)
    handleNewTemplate(mockTemplate(tid, BOOL_TMPL))
    let q = Bytes.fromHexString("0x" + "aa".repeat(32))
    // lang breaks out of its string and appends type:single-select + outcomes
    let data = "Will it rain?" + SEP + "weather" + SEP + 'en","type":"single-select","outcomes":["No","Yes"],"z":"x'
    handleNewQuestion(mockQuestion(q, tid, data))
    let id = qid(q)
    // Defended: flagged malformed and the forged outcomes are NOT stored.
    assert.fieldEquals("Question", id, "malformed", "true")
    assert.fieldEquals("Question", id, "qTitle", "[Malformed question] Will it rain?")
    assert.notInStore("Outcome", id + "-0")
    assert.notInStore("Outcome", id + "-1")
  })

  test("outcomes injected via the category parameter on a bool template", () => {
    let tid = BigInt.fromI32(201)
    handleNewTemplate(mockTemplate(tid, BOOL_TMPL))
    let q = Bytes.fromHexString("0x" + "bb".repeat(32))
    let data = "Approve?" + SEP + 'misc","outcomes":["No","Yes"],"z":"x' + SEP + "en"
    handleNewQuestion(mockQuestion(q, tid, data))
    let id = qid(q)
    assert.fieldEquals("Question", id, "malformed", "true")
    assert.fieldEquals("Question", id, "qTitle", "[Malformed question] Approve?")
    // A bool question must never end up with outcome entities.
    assert.notInStore("Outcome", id + "-0")
  })

  test("title overridden by a second title key injected via lang", () => {
    let tid = BigInt.fromI32(202)
    handleNewTemplate(mockTemplate(tid, BOOL_TMPL))
    let q = Bytes.fromHexString("0x" + "cc".repeat(32))
    let data = "Real title" + SEP + "cat" + SEP + 'en","title":"FAKE TITLE","z":"x'
    handleNewQuestion(mockQuestion(q, tid, data))
    let id = qid(q)
    // Defended: title carries the visible marker (prefixing whatever parsed).
    assert.fieldEquals("Question", id, "malformed", "true")
    assert.fieldEquals("Question", id, "qTitle", "[Malformed question] FAKE TITLE")
  })

  test("legit Zodiac-style question is NOT flagged malformed (no false positive)", () => {
    let tid = BigInt.fromI32(203)
    handleNewTemplate(mockTemplate(tid, ZODIAC_TMPL))
    let q = Bytes.fromHexString("0x" + "d1".repeat(32))
    handleNewQuestion(mockQuestion(q, tid, "0xabc123" + SEP + "deadbeef"))
    let id = qid(q)
    assert.fieldEquals("Question", id, "malformed", "false")
    assert.fieldEquals("Question", id, "qType", "bool")
  })

  test("injection via the first of two title placeholders on a Zodiac template", () => {
    let tid = BigInt.fromI32(204)
    handleNewTemplate(mockTemplate(tid, ZODIAC_TMPL))
    let q = Bytes.fromHexString("0x" + "d2".repeat(32))
    let data = 'x","type":"single-select","outcomes":["No","Yes"],"z":"' + SEP + "deadbeef"
    handleNewQuestion(mockQuestion(q, tid, data))
    let id = qid(q)
    assert.fieldEquals("Question", id, "malformed", "true")
    assert.fieldEquals("Question", id, "qTitle", "[Malformed question] Did proposal x")
    assert.notInStore("Outcome", id + "-0")
  })
})
