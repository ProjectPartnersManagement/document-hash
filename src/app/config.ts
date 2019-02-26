export const config = {
    ethereum : {
        // This is 1 on the live blockchain but 88888 on our private blockchain. We defined this chainId in the genesis-block.json when creating the private blockchain.
        // The genesis-block.json is committed in the shipping company backend repository.
        chainId         : location.href.includes("project-partners.de") ? 1 : 88888,
        // chainId : 88888,
    },
};

