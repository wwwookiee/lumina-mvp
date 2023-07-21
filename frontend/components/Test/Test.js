"use client"

// REACT
import { useState, useEffect } from 'react'

// CHAKRA-UI
// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'


// CONTRACT
import Contract from '../../public/ABI/LumiToken.json'
import ContractSwap from '../../public/ABI/LumiTokenSwap.json'

// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

import { parseEther } from 'viem'


function Test() {


    /* Contract Address */
    const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
    const contractSwapAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"

    // Reprendre les infos du wallet connecté
    const { address } = useAccount()

    const [amount, setAmount] = useState(null)

    const transferEthToContract = async() => {

        try {
            console.log(parseEther(amount));
            const data = await prepareWriteContract({
            address: contractSwapAddress,
            abi: ContractSwap.abi,
            functionName: 'transferEthToContract',
            account: address,
            //args : [BigInt(amount)],
            overrides: {
                from: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
                value: parseEther(amount),
              },
            });
            return data
        }
        catch(err) {
            console.log(err)
        }
    }

  return (
    <Flex flexDirection="column" alignItems="center">
        <Text mt="2rem">Swap Eth to LUMI</Text>
        <Flex mt="1rem">
            <Input mr="0.5rem" placeholder="Ethers" onChange={e => setAmount(e.target.value)}/>
            <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => transferEthToContract()}>Swap</Button>
        </Flex>
    </Flex>
  )
}

export default Test