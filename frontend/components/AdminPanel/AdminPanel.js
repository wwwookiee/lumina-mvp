"use client"

//React
import { useState, useEffect } from 'react'

//Chakra UI
import {
  Heading, Flex, useToast, Input, Button, Text, Textarea, UnorderedList, ListItem
} from '@chakra-ui/react'

// Ethers
import { ethers } from 'ethers'

// WAGMI
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount, useWaitForTransaction } from 'wagmi'

//Unique id generator
import { v4 as uuidv4 } from 'uuid';

// VIEM (events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, goerli } from 'viem/chains'

//contract
import Contract from '../../public/Lumina.json'
import Token from '../../public/LuminaToken.json'



const AdminPanel = () => {

      // Contract Address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMINA
  const tokenAddress = process.env.NEXT_PUBLIC_CONTRACT_LUMITOKEN

  // Wallet informations
  const { isConnected, address } = useAccount()

  // `toast` init
  const toast = useToast()

  // events logs
  const client = createPublicClient({
    chain: goerli,
    transport: http(),
  })
  
  // UseStates
  const [contributors, setContributors] = useState([])
  const [researches, setResearches] = useState([])
  const [owner, setOwner] = useState(null)
  const [researchId, setResearchId] = useState(null)
  const [contributorAddress, setContributorAddress] = useState(null)

  const getEvents = async () => {

    const contributorsLog = await client.getLogs({
      address : contractAddress,
      event: parseAbiItem('event contributorHasApply(address indexed _from, string _domain, string _references)'),
      fromBlock: 0n,
      toBlock: 1000n
    });
    setContributors(contributorsLog.map(
      log => ({ 
        from: log.args._from,
        domain: log.args._domain,
        references: log.args._references
      })
    ))

  }

  const getResearches = async() => {
    try {
      const data = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'getResearches',
        account: address
      });

      setResearches(data.map(
        event => ({ 
          id: event.id,
          title: event.title,
          domain: event.domain,
          isPublished: event.isPublished
        })
      ))
    }
    catch(err) {
      console.log(err)
    }
  }

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

  const assignContributor = async() => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: 'assignContributor',
        account: address,
        args : [contributorAddress, researchId]
      });
      await writeContract(request)
      toast({
        title: 'Success',
        description: 'Contributor assigned!',
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
      getOwner()
      getEvents()
      getResearches()
    }
  }, [isConnected,address])

  return (
    <>
      { owner === address ? (
      <>
      <Flex direction="column">
        <Text mb="1rem"><strong>Contributors</strong></Text>
        <UnorderedList>
        {
          contributors.map((event) => {
                return  <ListItem key={uuidv4()}>{event.from + " - " + event.domain + " - " + event.references}</ListItem>
            })
        }
        </UnorderedList>
      </Flex>
      <Flex direction="column" mt="2rem">
        <Text mb="1rem"><strong>Researches</strong></Text>
        <UnorderedList>
        {
          researches.map((event) => {
            if(event.isPublished == false){
                return  <ListItem key={uuidv4()}>{"ID : " + event.id + " - " + event.domain + " - " + event.title}</ListItem>
            }
          })
        }
        </UnorderedList>
        <Flex width="400px" direction="column">
          <Text mt="2rem" mb="1rem"><strong>Assign research to contributor</strong></Text>
          <Input mb="1rem" placeholder="Research ID" onChange={(e) => setResearchId(e.target.value)} />
          <Input mb="1rem" placeholder="Contributor Address" onChange={(e) => setContributorAddress(e.target.value)} />
          <Button onClick={() => assignContributor()}>Assign</Button>
        </Flex>

      </Flex>
      
      </>
      ): (
        <Text>You are not the autorize to access this page</Text>
      ) }
    </>


    //contributors to validate

    //projects to assign

    //list of validated contributors
  )
}

export default AdminPanel