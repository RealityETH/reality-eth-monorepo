## Custom Template
This is a dApp to create custom template by calling the `createTemplate(string content)` function. 

## Templates
To avoid duplication and resulting gas fees, parts common to many questions are included in a pre-defined template. The template includes placeholders, and each question only needs to pass in the data necessary to replace the placeholders.

The following templates are built in, one for each question type:

- `0`: `{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}`
- `1`: `{"title": "%s", "type": "uint", "decimals": 18, "category": "%s", "lang": "%s"}`
- `2`: `{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}`
- `3`: `{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s", "lang": "%s"}`
- `4`: `{"title": "%s", "type": "datetime", "category": "%s", "lang": "%s"}`
