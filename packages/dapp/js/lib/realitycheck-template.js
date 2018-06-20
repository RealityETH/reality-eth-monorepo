'use strict';

const TEMPLATE_CONFIG = require('../config/templates.json');

exports.defaultTemplateIDForType = function(template_type) {
  return TEMPLATE_CONFIG.base_ids[template_type];
}

exports.defaultTemplateForType = function(template_type) {
  return TEMPLATE_CONFIG.content[this.defaultTemplateIDForType(template_type)];
}

exports.preloadedTemplateContents = function() {
  return TEMPLATE_CONFIG.content;
}

exports.encodeText = function(qtype, txt, outcomes, category) {
	var qtext = JSON.stringify(txt).replace(/^"|"$/g, '');
	//console.log('using template_id', template_id);
	if (qtype == 'single-select' || qtype == 'multiple-select') {
	var outcome_str = JSON.stringify(outcomes).replace(/^\[/, '').replace(/\]$/, '');
	//console.log('made outcome_str', outcome_str);
	qtext = qtext + QUESTION_DELIMITER + outcome_str;
	//console.log('made qtext', qtext);
	}
    qtext = qtext + QUESTION_DELIMITER + category;
   return qtext;
}

