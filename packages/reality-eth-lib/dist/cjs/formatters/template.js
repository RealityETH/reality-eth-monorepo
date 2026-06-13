"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTemplateIDForType = defaultTemplateIDForType;
exports.defaultTemplateForType = defaultTemplateForType;
exports.preloadedTemplateContents = preloadedTemplateContents;
const templates_json_1 = __importDefault(require("@reality.eth/contracts/config/templates.json"));
function defaultTemplateIDForType(template_type) {
    return templates_json_1.default.base_ids[template_type];
}
function defaultTemplateForType(template_type) {
    return templates_json_1.default.content[String(defaultTemplateIDForType(template_type))];
}
function preloadedTemplateContents() {
    return templates_json_1.default.content;
}
