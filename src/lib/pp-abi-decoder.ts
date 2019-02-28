//*****************************************************************************
//  Description
//****************************************************************************/
// Enables decoding transaction data.
// Taken from https://github.com/ConsenSys/abi-decoder
// because of this Stack Exchange question: https://ethereum.stackexchange.com/questions/11144/how-to-decode-input-data-from-a-transaction
/////////////////////////////////////////////////////////////////////////////*/
//  END Description
/////////////////////////////////////////////////////////////////////////////*/
declare var web3: any;
declare var Web3: any;

// SolidityCider is nothing but we3.eth.abi. See https://web3js.readthedocs.io/en/1.0/web3-eth-abi.html?highlight=decode#decodeparameters.
// const SolidityCoder = ;
// SLa on 2019-02-28 Web3 is included globally. No need to import it again.
// const Web3 = require('web3');

const state = {
    savedABIs : [],
    methodIDs : {}
};

function _getABIs() {
    return state.savedABIs;
}

function _addABI(abiArray) {
    if (Array.isArray(abiArray)) {

        // Iterate new abi to generate method id's
        abiArray.map(function (abi) {
            if (abi.name) {
                const signature = new Web3().utils.sha3(abi.name + '(' + abi.inputs.map(function (input) {
                    return input.type;
                }).join(',') + ')');
                if (abi.type == 'event') {
                    state.methodIDs[signature.slice(2)] = abi;
                }
                else {
                    state.methodIDs[signature.slice(2, 10)] = abi;
                }
            }
        });

        state.savedABIs = state.savedABIs.concat(abiArray);
    }
    else {
        throw new Error('Expected ABI array, got ' + typeof abiArray);
    }
}

function _removeABI(abiArray) {
    if (Array.isArray(abiArray)) {

        // Iterate new abi to generate method id's
        abiArray.map(function (abi) {
            if (abi.name) {
                const signature = new Web3().utils.sha3(abi.name + '(' + abi.inputs.map(function (input) {
                    return input.type;
                }).join(',') + ')');
                if (abi.type == 'event') {
                    if (state.methodIDs[signature.slice(2)]) {
                        delete state.methodIDs[signature.slice(2)];
                    }
                }
                else {
                    if (state.methodIDs[signature.slice(2, 10)]) {
                        delete state.methodIDs[signature.slice(2, 10)];
                    }
                }
            }
        });
    }
    else {
        throw new Error('Expected ABI array, got ' + typeof abiArray);
    }
}

function _getMethodIDs() {
    return state.methodIDs;
}

function _decodeMethod(data) {
    const methodID = data.slice(2, 10);
    const abiItem  = state.methodIDs[methodID];
    if (abiItem) {
        const params = abiItem.inputs.map(function (item) {
            return item.type;
        });
        let decoded  = web3.eth.abi.decodeParameters(params, data.slice(10));

        const decodedParams = [];
        for (const index in decoded) {
            if (!decoded.hasOwnProperty(index)) continue;

            // The decoded parameters have a property "__length__" that should not be treated as an index.
            if (isNaN(+index)) continue;

            let parsedParam = decoded[index];

            const isUint = abiItem.inputs[index].type.indexOf('uint') === 0;
            const isInt  = abiItem.inputs[index].type.indexOf('int') === 0;

            if (isUint || isInt) {
                const isArray = Array.isArray(parsedParam);

                if (isArray) {
                    parsedParam = parsedParam.map(val => new Web3().toBigNumber(val).toString());
                }
                else {
                    parsedParam = new Web3().toBigNumber(parsedParam).toString();
                }
            }
            decodedParams.push({
                name  : abiItem.inputs[index].name,
                value : parsedParam,
                type  : abiItem.inputs[index].type
            });
        }

        return {
            name   : abiItem.name,
            params : decodedParams
        }
    }
}

function padZeros(address) {
    var formatted = address;
    if (address.indexOf('0x') != -1) {
        formatted = address.slice(2);
    }

    if (formatted.length < 40) {
        while (formatted.length < 40) formatted = '0' + formatted;
    }

    return '0x' + formatted;
}

function _decodeLogs(logs) {
    return logs.map(function (logItem) {
        const methodID = logItem.topics[0].slice(2);
        const method   = state.methodIDs[methodID];
        if (method) {
            const logData     = logItem.data;
            let decodedParams = [];
            let dataIndex     = 0;
            let topicsIndex   = 1;

            let dataTypes = [];
            method.inputs.map(
                function (input) {
                    if (!input.indexed) {
                        dataTypes.push(input.type);
                    }
                }
            );
            const decodedData = web3.eth.abi.decodeParameters(dataTypes, logData.slice(2));
            // Loop topic and data to get the params
            method.inputs.map(function (param) {
                var decodedP = {
                    name  : param.name,
                    type  : param.type,
                    value : null
                };

                if (param.indexed) {
                    decodedP.value = logItem.topics[topicsIndex];
                    topicsIndex++;
                }
                else {
                    decodedP.value = decodedData[dataIndex];
                    dataIndex++;
                }

                if (param.type == 'address') {
                    decodedP.value = padZeros(new Web3().toBigNumber(decodedP.value).toString(16));
                }
                else if (param.type == 'uint256' || param.type == 'uint8' || param.type == 'int') {
                    decodedP.value = new Web3().toBigNumber(decodedP.value).toString(10);
                }

                decodedParams.push(decodedP);
            });


            return {
                name    : method.name,
                events  : decodedParams,
                address : logItem.address
            };
        }
    });
}

export const AbiDecoder = {
    getABIs      : _getABIs,
    addABI       : _addABI,
    getMethodIDs : _getMethodIDs,
    decodeMethod : _decodeMethod,
    decodeLogs   : _decodeLogs,
    removeABI    : _removeABI
};
