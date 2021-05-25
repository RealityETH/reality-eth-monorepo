import web3
import json
from web3 import Web3, HTTPProvider, IPCProvider, TestRPCProvider
import os
import ethereum
from eth_utils import encode_hex
from ethereum.utils import to_string, sha3, privtoaddr

from base58 import b58encode, b58decode
from eth_utils import to_hex, decode_hex

from django.conf import settings
CONTRACTS_DIR = os.path.realpath(os.path.dirname(os.path.realpath(__file__)) + '/../../resources/contracts/')

def rr_instance(web3rpc = None):

    contract_path = os.path.join(CONTRACTS_DIR, 'RealityCheck.json')
    rr_contract_key = 'RealityCheck'

    with open(contract_path) as f:
        data = json.load(f)

    # print data['abi']

    if settings.RKETH_ENVIRONMENT != 'test':
        # web3ipc = Web3(IPCProvider(ipc_path=settings.GETH_IPC, testnet=settings.GETH_TESTNET))
        #web3rpc = Web3(HTTPProvider(host=settings.GETH_RPC_HOST, port=settings.GETH_RPC_PORT))
        web3rpc = Web3(HTTPProvider('http://' + settings.GETH_RPC_HOST + ':' + settings.GETH_RPC_PORT))
        rr = web3rpc.eth.contract(abi=data['abi'], address=Web3.toChecksumAddress(settings.RC_ADDRESS))
        return rr

    if web3rpc is None:
        web3rpc = Web3(TestRPCProvider())
    
    ContractFactory = web3rpc.eth.contract(rr_abi_json, code=data['bin_hex'])
    deploy_tx = ContractFactory.deploy()
    addr = web3rpc.eth.getTransactionReceipt(deploy_tx)['contractAddress']
    rr = web3rpc.eth.contract(rr_abi_json, address=addr)

    return rr

def formatHex(data):
    s = web3.Web3.toHex(data)
    return '0x' + s[2:].zfill(64)

def questionURL(question_id):
    return settings.URL_QUESTION_BASE + question_id
