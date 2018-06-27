import json
import re
import datetime

class RealityCheckQuestion:

    QUESTION_MAX_OUTCOMES = 128;

    @staticmethod
    def delimiter():
        return '\u241f' 

    @staticmethod
    def minNumber(qjson): 
        is_signed = (qjson['type'] == 'int')
        if (not is_signed):
            return 0
        else:
            maxNumber(qjson) * -1

    @staticmethod
    def maxNumber(qjson): 
        is_signed = (qjson['type'] == 'int')

        divby = 1
        decimals = RealityCheckQuestion.decimals(qjson)
        if decimals > 0:
            divby = 10**decimals

        if is_signed: 
            divby = divby * 2

        return 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff / divby

    @staticmethod
    def arrayToBitmaskBigNumber(selections):
        bitstr = '';
        for i in range(len(selections)):
            if selections[i]:
                item = '1'
            else:
                item = '0'
            bitstr = item + bitstr;
        return int(bitstr, 2)

    @staticmethod
    def answerToBytes32(answer, qjson):
        qtype = qjson['type'];
        if (qtype == 'multiple-select'): 
            answer = RealityCheckQuestion.arrayToBitmaskBigNumber(answer);

        decimals = RealityCheckQuestion.decimals(qjson)
        if (decimals > 0): 
            multiplier = 10 ** decimals
            answer = answer * multiplier

        if (qtype == 'int'): 
            return RealityCheckQuestion.padToBytes32(RealityCheckQuestion.toTwosComplementHex(int(answer)))
        else:
            return RealityCheckQuestion.padToBytes32(int(answer))

    @staticmethod
    def decimals(qjson):
        if ('decimals' in qjson): 
            return int(qjson['decimals'])
        else:
            return 0

    @staticmethod
    def bytes32ToString(bytes32str, qjson):
        qtype = qjson['type'];

        decimals = RealityCheckQuestion.decimals(qjson)

        if (qtype == 'int'): 
            num = RealityCheckQuestion.fromTwosComplementHex(bytes32str)
        else:
            bytes32str = re.sub('/^0x/', '', bytes32str)
            num = int(bytes32str, 16)

        if (decimals > 0):
            multiplier = 10 ** decimals
            num = num / multiplier 

        return str(num)

    @staticmethod
    def padToBytes32(n, raw=False):
        ret = str(n).zfill(64)
        if (raw):
            return ret
        else:
            return "0x" + ret

    @staticmethod
    def convertTsToString(ts): 
        # TODO
        return ts

    @staticmethod
    def secondsTodHms(sec): 
        sec = sec
        d = Math.floor(sec / (3600 * 24))
        h = Math.floor(sec % (3600 * 24) / 3600)
        m = Math.floor(sec % (3600 * 24) % 3600 / 60)
        s = Math.floor(sec % (3600 * 24) % 3600 % 60)

        ret = ''

        if d == 1:
            ret = ret + ' day'
        if d > 1:
            ret = ret + ' days'

        if h == 1:
            ret = ret + ' hour'
        if h > 1:
            ret = ret + ' hours'

        if m == 1:
            ret = ret + ' minute'
        if m > 1:
            ret = ret + ' minutes'

        if s == 1:
            ret = ret + ' second'
        if s > 1:
            ret = ret + ' seconds'

        return s

    @staticmethod
    def parseQuestionJSON(data): 
        #print(data)
        question_json = json.loads(data)
        if ('outcomes' in question_json and len(question_json['outcomes']) > RealityCheckQuestion.QUESTION_MAX_OUTCOMES): 
            raise Exception("Too many outcomes")
        return question_json

    @staticmethod
    def populatedJSONForTemplate(template, question): 
        qbits = question.split(RealityCheckQuestion.delimiter())
        # The JavaScript parsing will merrily fill in missing entries with ""
        # We don't know how many entries the template has, so keep trying until we hit a silly number
        done = False
        added_params = 0
        while not done:
            try:
                interpolated = template % (*qbits, )
                done = True
            except TypeError as te:
                if added_params > 1024:
                    raise te
                qbits.append("") 
                added_params = added_params + 1
        return RealityCheckQuestion.parseQuestionJSON(interpolated)

    @staticmethod
    def encodeText(qtype, txt, outcomes, category): 
        #print(":" + json.dumps(txt) + ":")
        qtext = json.dumps(txt)
        qtext = re.sub(r'^"', '', qtext);
        qtext = re.sub(r'"$', '', qtext);
        delim = RealityCheckQuestion.delimiter();
        if (qtype == 'single-select' or qtype == 'multiple-select'): 
            outcome_str = json.dumps(outcomes)
            outcome_str = re.sub(r'^\[', '', outcome_str)
            outcome_str = re.sub(r'\]$', '', outcome_str)
            qtext = qtext + delim + outcome_str;
        qtext = qtext + delim + category;
        return qtext;

    @staticmethod
    def getInvalidValue(question_json): 
        if (question_json['type'] == 'int'): 
            return '0x8000000000000000000000000000000000000000000000000000000000000000'
        else: 
            return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

    @staticmethod
    def getAnswerString(question_json, answer): 

        if (answer is None): 
            return 'null'

        if (answer == RealityCheckQuestion.getInvalidValue(question_json)): 
            return 'Invalid'

        label = '';
        t = question_json['type']
        if t == 'uint':
            answer = re.sub(r'^0x', '', answer)
            num = int(answer, 16)
            decimals = RealityCheckQuestion.decimals(question_json)
            if num == 0:
                return '0'

            if decimals > 0:
                multiplier = 10 ** decimals
                val = str(num / multiplier)
            else:
                val = str(num)

            val = val.rstrip('0')
            val = val.rstrip('.')
            return val
        
        if t == 'int':
            num = RealityCheckQuestion.fromTwosComplementHex(answer)
            decimals = RealityCheckQuestion.decimals(question_json)

            if num == 0:
                return '0'

            if decimals > 0:
                multiplier = 10 ** decimals
                val = str(num / multiplier)
            else:
                val = str(num)

            #print("val")
            #print(val)
            val = val.rstrip('0')
            val = val.rstrip('.')
            return val

        if t == 'bool':
            answer = int(re.sub(r'^0x', '', answer), 16)
            if answer == 1:
                return 'Yes'
            elif answer == 0:
                return 'No'

        if t == 'single-select':
            if ('outcomes' in question_json and len(question_json['outcomes']) > 0):
                answer = re.sub(r'^0x', '', answer)
                idx = int(answer, 16)
                return question_json['outcomes'][idx];
            else:
                raise Exception("no outcomes")

        if t == 'multiple-select':
            if ('outcomes' in question_json and len(question_json['outcomes']) > 0): 
                answer = re.sub(r'^0x', '', answer)
                answer_int = int(answer, 16)
                answer_bits = format(answer_int, '0>256b')
                entries = [];
                idx = 256
                for i in range(len(question_json['outcomes'])):
                    idx = idx - 1
                    if (str(answer_bits)[idx] == '1'): 
                        entries.append(question_json['outcomes'][i])
                return ' / '.join(entries)
        if t == 'datetime':
            answer = re.sub(r'^0x', '', answer)
            answer_int = int(answer, 16)
            t = datetime.datetime.utcfromtimestamp(answer_int)
            Y = str(int(t.strftime('%Y')))
            m = str(int(t.strftime('%m')))
            d = str(int(t.strftime('%d')))
            return Y+'/'+m+'/'+d

        return str(label);

    @staticmethod
    def fromTwosComplementHex(bytes32str):
        bytes32str = re.sub(r'^0x', '', bytes32str)
        val = int(bytes32str, 16)
        return -(val & 0x8000000000000000000000000000000000000000000000000000000000000000) | (val & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)

    @staticmethod
    def toTwosComplementHex(signed_int):
        max_hex = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        if (signed_int >= 0):
            return hex(signed_int)
        else:
            return hex(((abs(x) ^ max_hex) + 1) & max_hex)
