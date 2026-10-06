import { assert, describe, test, newMockEvent, clearStore, afterEach } from "matchstick-as/assembly/index"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { LogNewTemplate, LogNewQuestion } from "../generated/RealityETH-3.0-ETH/RealityETH"
import { handleNewTemplate, handleNewQuestion } from "../src/mapping"

// U+241F — the reality.eth parameter delimiter.
let SEP = "␟"
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

describe("handleNewQuestion — existing parsing behaviour", () => {
  afterEach(() => {
    clearStore()
  })

  test("parses a legit bool question into title/type/category/lang", () => {
    let tid = BigInt.fromI32(100)
    handleNewTemplate(mockTemplate(tid, '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}'))
    let q = Bytes.fromHexString("0x" + "01".repeat(32))
    handleNewQuestion(mockQuestion(q, tid, "Will it rain?" + SEP + "weather" + SEP + "en_US"))
    let id = qid(q)
    assert.fieldEquals("Question", id, "qTitle", "Will it rain?")
    assert.fieldEquals("Question", id, "qType", "bool")
    assert.fieldEquals("Question", id, "qCategory", "weather")
    assert.fieldEquals("Question", id, "qLang", "en_US")
  })

  test("parses a legit single-select question and stores its outcomes", () => {
    let tid = BigInt.fromI32(101)
    handleNewTemplate(mockTemplate(tid, '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}'))
    let q = Bytes.fromHexString("0x" + "02".repeat(32))
    handleNewQuestion(mockQuestion(q, tid, "Pick one" + SEP + '"Yes","No"' + SEP + "cat" + SEP + "en"))
    let id = qid(q)
    assert.fieldEquals("Question", id, "qType", "single-select")
    assert.fieldEquals("Outcome", id + "-0", "answer", "Yes")
    assert.fieldEquals("Outcome", id + "-1", "answer", "No")
  })

  test("still stores the raw data when the question JSON cannot be parsed", () => {
    let tid = BigInt.fromI32(102)
    handleNewTemplate(mockTemplate(tid, '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}'))
    let q = Bytes.fromHexString("0x" + "03".repeat(32))
    // An unescaped quote in the title parameter breaks the resulting JSON.
    let data = 'Why "this" breaks' + SEP + "cat" + SEP + "en"
    handleNewQuestion(mockQuestion(q, tid, data))
    let id = qid(q)
    assert.fieldEquals("Question", id, "data", data)
  })
})
