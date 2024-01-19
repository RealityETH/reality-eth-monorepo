import sys
import re

def camelcase(s):
    return ''.join(t.title() for t in s.split())

def stringToError(s):
    s = s.replace(".", " ")
    s = s.replace("-", " ")
    s = s.replace(",", " ")
    s = s.replace("?", "")
    return camelcase(s)
    
def invert_sign(expr):
    inversions = {
        '> 0': '== 0',
        '==': '!=',
        '!=': '==',
        '>=': '<',
        '<=': '>',
        '<': '>=',
        '>': '<='
    }
    for before in inversions:
        after = inversions[before] 
        new_expr = expr.replace(before, after)
        if new_expr != expr:
            return new_expr

    if expr.startswith("!"):
        return expr[1:]
    else:
        return "!"+expr

    return expr

require_pattern = '(.*?)require\((.*?)\,\s+\"(.*?)\"\);'
revert_pattern = '^(.*?revert)\(\"(.*?)\"\);'

error_list = {}

source_in = sys.argv[1]
interface_out = None
if len(sys.argv) > 2:
    interface_out = sys.argv[2]

with open(source_in) as f:
    for line in f:
        l = line.rstrip()
        require_result = re.match(require_pattern, l)
        revert_result = re.match(revert_pattern, l)

        if require_result is not None:
            bits = list(require_result.groups())
            # Should be padding, then the condition, then the revert string.
            if len(bits) != 3:
                out = l + " // TODO FIX ERROR MANUALLY"
                #print(l)
            else:
                err_text = bits.pop()
                condstr = bits.pop()
                if "&&" in condstr:
                    out = l + " // TODO FIX ERROR MANUALLY"
                else:
                    # We don't do && because don't have them in our code in require
                    conds = condstr.split(" || ")
                    new_conds = []
                    for cond in conds:
                        new_conds.append(invert_sign(cond))
                    new_condstr = " && ".join(new_conds)

                    err_name = stringToError(err_text)
                    error_list[err_name] = err_text
                    out = "".join(bits)
                    out = out + "if ("
                    out = out + new_condstr
                    out = out + ") revert "
                    out = out + err_name
                    out = out + "();"
            print(out)

        elif revert_result is not None:
            bits = list(revert_result.groups())
            # Should be padding, then the revert string.
            if len(bits) != 2:
                out = l + " // TODO FIX ERROR MANUALLY"
            else: 
                err_text = bits.pop()
                err_name = camelcase(err_text)
                error_list[err_name] = err_text
                start = bits.pop()
                out = start
                out = out + " "
                out = out + err_name
                out = out + "();" 
            print(out)
        else:
            print(l)
            pass


    if interface_out is not None:
        out_fh = open(interface_out+'.sol', 'w')
        for err_name in error_list:
            out_fh.write("    /// @notice "+error_list[err_name]+"\n")
            out_fh.write("    error "+err_name+"();"+"\n")
                #print(result.groups())
            #require(questions[question_id].timeout == 0, "question must not exist");
            #if (!(questions[question_id].timeout == 0)) revert("question must not exist");
        out_fh.close()

