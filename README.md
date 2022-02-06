# Beyond Meta (ONE Wallet)

Interface that allows token transfer to various EVM chains using QR Code

## How to run

1. Open online qrcode generator like [https://www.the-qrcode-generator.com/](https://www.the-qrcode-generator.com/).
2. Copy & paste this json (remove the comments)
   ```
   {
      "chain": "eth", // 'eth' or 'polygon'
      "chainid": "3", // '3'(ropsten) or '80001'(mumbai) 
      "address": "0x88FB8FBB448A64CB2d35630811ED9CF6ebF518B6",  // token contract address 
      "jsonInterface": {  // ERC20 transfer
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      // Bob's address and token amount
      "inputs": ["0x064495d0F723423557d60475ff5E5AB6540Fbb46", "15"]
   }
   ```
3. Import Alice's account in your mobile Metamask. (private key: 0x7f8a90d5bf2b1e37975156277b893a607166be31ebd58b64bce83a0c4b7f50e0)
4. Import Token "0x88FB8FBB448A64CB2d35630811ED9CF6ebF518B6" to Metamask.
5. Open [https://beyond-meta.github.io/userApp/](https://beyond-meta.github.io/userApp/) to view it in your Metamask browser.
6. Capture the qr code and sign it.
7. Alice will send 15 Token to Bob and 10 Token to Relayer.
8. Change chain to 'polygon', chainId to '80001' and try again. It works!
