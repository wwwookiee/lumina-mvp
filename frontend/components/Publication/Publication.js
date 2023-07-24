"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {Heading, Flex, useToast, Input, Button, Text, Textarea} from '@chakra-ui/react'

// Ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//components
import NotConnected from '@/components/NotConnected/NotConnected'
import LumiBalance from '@/components/LumiBalance/LumiBalance'

//contract
import Contract from '../../public/Lumina.json'
import Token from '../../public/LuminaToken.json'

const Publication = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA
  const tokenAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMITOKEN

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // UseStates
  const [resize, setResize] = useState('vertical')
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [budget, setBudget] = useState(0)
  const [balance, setBalance] = useState(0)
  const [allowance, setAllowance] = useState(0)

  const getAllowance = async() => {
    try {
        const data = await readContract({
          address: tokenAddress,
          abi: Token.abi,
          functionName: 'allowance',
          account: address,
          args : [address, contractAddress]
        });
        setAllowance(ethers.formatEther(data).toString())
      }
      catch(err) {
        console.log(err)
      }
    }

  const approve = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: tokenAddress,
        abi: Token.abi,
        functionName: 'approve',
        account: address,
        args : [contractAddress, ethers.parseEther(budget)]
      });
      await writeContract(request)
    }
    catch(err) {
      console.log(err)
    }
  }

  const getUserBalance = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getUserBalance',
        account: address,
        args : [address]
      });
      setBalance(ethers.formatEther(data).toString())
    }
    catch(err) {
      console.log(err)
    }
  }

  const addResearch = async() => {
    await (ethers.parseEther(budget) > ethers.parseEther(allowance) ? (approve()) : (null))
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'addResearch',
        account: address,
        args : [domain, title, ethers.parseEther(budget)]
      });
      await writeContract(request)
      getUserBalance()
      getAllowance()
      toast({
        title: 'Success',
        description: 'Research was submitted for review!',
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
        getUserBalance()
        getAllowance()
    }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>
          <LumiBalance balance={ balance } />
          <Flex direction="column" margin="0 auto" width="600px">
            <Heading as="h3" size="lg">Publish a research</Heading>
            <Flex  direction="column" mt="1rem">
                <Text m="1rem 0">Title of your researche</Text>
                <Input placeholder="Implication de la blockchain dans les publications scientifiques" onChange={e => setTitle(e.target.value)}/>
                <Text m="1rem 0">Domain application</Text>
                <Input placeholder="Domain" onChange={e => setDomain(e.target.value)}/>
                <Text m="1rem 0">Budget allowed to the publication (LUMI)</Text>
                <Input placeholder="min: 100 LUMI" onChange={e => setBudget(e.target.value)}/>
                <Text m="1rem 0">Core text of the publication</Text>
                <Textarea
                    placeholder='Here is a sample placeholder'
                    size='sm'
                    resize={resize}
                />
            </Flex>
            <Flex  mt="1rem" justifyContent="flex-end">
              <Button mr="0.5rem" colorScheme='whatsapp' onClick={() => addResearch()}>Submit for review</Button>
            </Flex>
          </Flex>
        </>
      ):(
        <NotConnected/>
      )}
    </>
  )
}

export default Publication