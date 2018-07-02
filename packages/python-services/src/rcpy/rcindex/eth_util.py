from web3 import Web3
import re

def HumanReadableWei(amt_hex): 
    unit = ''
    displ = ''
    amt = HexToPythonInt(amt_hex)
    if (amt > Web3.toWei(0.0001, 'ether')): 
        unit = 'ether';
        displ = 'ETH';
    elif (amt > Web3.toWei(0.0001, 'gwei')):
        unit = 'gwei';
        displ = 'Gwei';
    else: 
        unit = 'wei';
        displ = 'Wei';

    return str(Web3.fromWei(amt, unit)) + ' ' + displ;

def HexToPythonInt(amt_hex):
    return int(re.sub(r'-0x', '', amt_hex), 16)

