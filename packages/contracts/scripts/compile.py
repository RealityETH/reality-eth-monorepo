#!/usr/bin/python3

# Compile a contract from src/ into the committed artifact layout
# (bytecode/<version>.bin + abi/solc-<ver>/<version>.abi.json), using the pinned
# settings the historical artifacts were produced with (--optimize
# --optimize-runs=200). Paths are resolved relative to the package root, so this
# can be run from anywhere:
#   ./scripts/compile.py RealityETH-4.0
#   ./scripts/compile.py RealityETH-4.0 /path/to/source.sol

import os
import sys
import re
import tempfile
import subprocess

if len(sys.argv) < 2:
    print("Usage: ./scripts/compile.py <contract> [<source_file>], eg ./scripts/compile.py RealityETH-4.0")
    sys.exit(1)

HERE = os.path.dirname(os.path.abspath(__file__))   # packages/contracts/scripts
ROOT = os.path.dirname(HERE)                         # packages/contracts
SRC_DIR = os.path.join(ROOT, "src")

VERSION = sys.argv[1].replace(".sol", "")

if len(sys.argv) >= 3:
    SOURCE_FILE = sys.argv[2]
else:
    SOURCE_FILE = os.path.join(SRC_DIR, VERSION + ".sol")

# solc names the output file after the contract, so get it from the source.
contract_match = re.compile(r"^contract\s(.*?)\s")
# Pragma version (tolerate both "^0.8.20" and "0.8.20").
solc_match = re.compile(r"^pragma solidity \^?(\d+\.\d+\.\d+);")

CONTRACT_NAME = None
SOLCV = None
with open(SOURCE_FILE, "r") as f:
    for next_line in f:
        ln = next_line.strip()
        m = contract_match.match(ln)
        if m is not None:
            CONTRACT_NAME = m.group(1)
        m2 = solc_match.match(ln)
        if m2 is not None:
            SOLCV = m2.group(1)

if CONTRACT_NAME is None or SOLCV is None:
    print("Could not determine contract name / solc version from " + SOURCE_FILE)
    sys.exit(1)

SOLC_ABI_DIR = "solc-" + SOLCV  # We store ABIs by solc version


def check_version(solc_bin, needver):
    try:
        # Hopefully we have solc with its version number like solc-0.8.6
        result = subprocess.check_output([solc_bin, "--version"])
        return needver in str(result)
    except Exception:
        return False


if check_version("solc-" + SOLCV, SOLCV):
    SOLC_BIN = "solc-" + SOLCV  # each version downloaded and stored with its version number
elif check_version("solc", SOLCV):
    SOLC_BIN = "solc"
else:
    print(
        "Solc version " + SOLCV + " not found, please get the binary from "
        "https://github.com/ethereum/solidity/releases and put it on your path as solc-" + SOLCV
    )
    sys.exit(1)

bytecode_out = os.path.join(ROOT, "bytecode", VERSION + ".bin")
abi_out = os.path.join(ROOT, "abi", SOLC_ABI_DIR, VERSION + ".abi.json")

with tempfile.TemporaryDirectory() as temp_dir:
    # Imports resolve relative to the source file's own directory (src/), so a
    # full path here resolves the ./interfaces/ imports correctly.
    cmd = [SOLC_BIN, "--bin", "--abi", "--optimize", "--optimize-runs=200", "--overwrite", SOURCE_FILE, "-o", temp_dir]
    print(" ".join(cmd))
    subprocess.check_call(cmd)
    os.replace(os.path.join(temp_dir, CONTRACT_NAME + ".bin"), bytecode_out)
    os.replace(os.path.join(temp_dir, CONTRACT_NAME + ".abi"), abi_out)

print("Wrote " + bytecode_out)
print("Wrote " + abi_out)
