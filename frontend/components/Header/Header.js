"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {Flex,Box} from '@chakra-ui/react'

//Next
import Link from 'next/link'

//Rainbow Kit
import { ConnectButton } from '@rainbow-me/rainbowkit'

// WAGMI
import { readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

//contract
import Contract from '../../../backend/artifacts/contracts/Lumina.sol/Lumina.json'

const Header = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA

  // Wallet informations
  const { isConnected, address } = useAccount()

  // UseStates
  const [owner, setOwner] = useState(null)

  const getOwner = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'owner',
        account: address
      });
      setOwner(data)
    }
    catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if(isConnected){
      getOwner()
    }
  }, [isConnected])

  return (
    <Flex
        justifyContent="space-between"
        alignItems="center"
        p="2rem"
        borderBottom="1px"
        borderColor='gray.200'
    >
      <Box w="200px" h="50%">
        <Link href="/"><strong>LUMINA</strong></Link>
      </Box>

      <Link href="/swapping">Swap Tokens</Link>
      <Link href="/staking">Staking</Link>
      <Link href="/publishing">publication</Link>
      <Link href="/reading">Read</Link>
      <Link href="/contributing">Contribute</Link>
      { owner === address && <Link href="/admin">Admin</Link> }      
      <ConnectButton />
    </Flex>
  )
}

export default Header