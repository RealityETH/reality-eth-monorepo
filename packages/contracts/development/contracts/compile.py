#!/usr/bin/python3

import os
import sys
import re
import tempfile

import subprocess

if len(sys.argv) < 2:
    print("Usage: ./compile.py <contract> [<source_file>], eg ./compile.py RealityETH_ERC20-3.0")

VERSION=sys.argv[1]
CONTRACT_NAME = None

if len(sys.argv) >= 3:
    SOURCE_FILE = sys.argv[2]
else:
    SOURCE_FILE = VERSION + '.sol'

# solc uses the contract name for the output file so get that from the source code
contract_match = re.compile('^contract\s(.*?)\s')

# Get the version from the pragma directive. Assumes we set it strictly.
solc_match = re.compile('^pragma solidity \^(\d+\.\d+\.\d+);') # eg pragma solidity ^0.8.6;

f = open(SOURCE_FILE, "r")
while True:
    next_line = f.readline()
    if not next_line:
        break;
    ln = next_line.strip()
    m = contract_match.match(ln)
    if m is not None:
        CONTRACT_NAME = m.group(1)
    m2 = solc_match.match(ln)
    if m2 is not None:
        SOLCV = m2.group(1)

SOLC_ABI_DIR='solc-'+SOLCV # We store ABIs by solc version

def check_version(solc_bin, needver):
    try:
        # Hopefully we have solc with its version number like solc-0.8.6
        result = subprocess.check_output([solc_bin, '--version'])
        if needver in str(result):
            return True
        else:
            return False
    except Exception:
        return False

if check_version('solc-'+SOLCV, SOLCV):
    SOLC_BIN='solc-'+SOLCV # We download each version seperately and store it with its version number
elif check_version('solc', SOLCV):
    SOLC_BIN='solc'
else:
    print("Solc version "+SOLCV+" not found, please get the binary from https://github.com/ethereum/solidity/releases and put it in your path as solc-"+SOLCV)
    sys.exit(1)



temp_dir = tempfile.TemporaryDirectory()

# print(temp_dir.name)
compile_str = "%s --bin --abi --optimize --optimize-runs=200 %s -o %s && mv %s/%s.bin ../../bytecode/%s.bin && mv %s/%s.abi ../../abi/%s/%s.abi.json" % (SOLC_BIN, SOURCE_FILE, temp_dir.name, temp_dir.name, CONTRACT_NAME, VERSION, temp_dir.name, CONTRACT_NAME, SOLC_ABI_DIR, VERSION)

print(compile_str)
os.system(compile_str)

temp_dir.cleanup()
