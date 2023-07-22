"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {Heading, Flex, useToast, Input, Button, Label, Card, CardHeader, CardBody, Stack, StackDivider, Box, Text, Tr} from '@chakra-ui/react'

// Ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//components
import NotConnected from '@/components/NotConnected/NotConnected'
import LumiBalance from '@/components/LumiBalance/LumiBalance'

//contract
import Contract from '../../../backend/artifacts/contracts/Lumina.sol/Lumina.json'

const Contribute = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // UseStates
  const [domain, setDomain] = useState('')
  const [references, setReferences] = useState('')




  const contributorApplication = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'contributorApplication',
        account: address,
        args : [domain, references]
      });
      await writeContract(request)
      toast({
        title: 'Application sent!',
        //description: 'You swapped ' + voterAddress,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

    }
    catch(err) {
      console.log(err)
      toast({
        title: 'Error!',
        description: err.details || 'An error occured.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    if(isConnected){
    }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>
          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Contributor application</Heading>
            <Text mt="1rem">You can contribute to the project by peer reviewing publications & get rewarded</Text>
            <Flex  direction="column" mt="1rem">
              <Text m="1rem 0">Domain of expertise</Text>
              <Input placeholder="ex: Biology" onChange={e => setDomain(e.target.value)}/>
              <Text m="1rem 0">Link to your references (CV, LinkedIn, etc.)</Text>
              <Input placeholder="ex: https://www.linkedin.com/in/jordandivita/" onChange={e => setReferences(e.target.value)}/>
            </Flex>
            <Flex  mt="1rem" justifyContent="flex-end">
              <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => contributorApplication()}>Apply</Button>
            </Flex>
          </Flex>

          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Reviewing</Heading>
            <Text mt="1rem">Peer review assigned to you</Text>
            <Flex  mt="1rem" justifyContent="flex-center">
              <Text>Research Name</Text>
              <Button ml="0.5rem" size="xs" colorScheme='whatsapp' onClick={() => stake()}>Validate</Button>
            </Flex>
          </Flex>
        </>
      ):(
        <NotConnected/>
      )}
    </>
  )
}

export default Contribute