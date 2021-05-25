import json

class RealityCheckTemplate:

    @staticmethod
    def templateConfig():
        with open('rcindex/config/templates.json') as f:
            return json.load(f)

    @staticmethod
    def defaultTemplateIDForType(template_type):
        config = RealityCheckTemplate.templateConfig()
        return config['base_ids'][template_type]

    @staticmethod
    def defaultTemplateForType(template_type):
        content = RealityCheckTemplate.preloadedTemplateContents()
        # print(content)
        template_id = str(RealityCheckTemplate.defaultTemplateIDForType(template_type))
        # print(template_id)
        return content[template_id]

    @staticmethod
    def preloadedTemplateContents():
        config = RealityCheckTemplate.templateConfig()
        return config['content']
