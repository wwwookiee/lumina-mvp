"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {
  Heading,
  Flex,
  useToast,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
} from '@chakra-ui/react'

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

const Read = () => {

  // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  let publishedResearches = []

  // UseStates``
  const [balance, setBalance] = useState(0)
  const [resize, setResize] = useState('vertical')
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [budget, setBudget] = useState(0)
  const [researches, setResearches] = useState([])

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

  const getPublishedResearches = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getResearches',
        account: address
      });
      setResearches(data)
    }
    catch(err) {
      console.log(err)
    }
  }

  const addResearch = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'addResearch',
        account: address,
        args : [domain, title, budget]
      });
      await writeContract(request)
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
        getPublishedResearches()
    }
  }, [isConnected, address])

  return (
    <>
      { isConnected ? (
        <>  
          <LumiBalance balance={balance}/>
          <Flex direction="column" margin="0 auto" width="80%">
            <Heading as="h3" size="lg">Read a research</Heading>



            <TableContainer mt="2rem">
              <Table variant='simple'>
                <TableCaption>Published researches</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Domain</Th>
                    <Th>Title</Th>
                    <Th>Read cost (25 LUMI)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {
                    researches.map((item) => (
                      <Tr key={item.id}>
                        <Td>{item.domain}</Td>
                        <Td>{item.title}</Td>
                        <Td align="right"><Button ml="0.5rem" size="xs" colorScheme='whatsapp' onClick={() => stake()}>Read</Button></Td>
                      </Tr>
                    ))
                  }
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </>
      ):(
        <NotConnected/>
      )}
    </>
  )
}

export default Read