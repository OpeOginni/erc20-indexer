import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [buttonText, setButtonText] = useState("Check ERC-20 Token Balances");
  const [ensName, setEnsName] = useState(null);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  async function getTokenBalance() {
    const config = {
      apiKey: "<----Alchemy API---->", // Put in your own Alchemy Mainnet API key
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    setButtonText("Checking Address..."); // To let the user know that the search is in progress
    if (userAddress.length != 42 || !userAddress.startsWith("0x")) {
      setButtonText("Check ERC-20 Token Balances");
      return alert("Please plug in a correct ETH wallet Address");
    }

    const ens = await alchemy.core.lookupAddress(userAddress);
    setEnsName(ens); // Getting the Address ENS Name

    try {
      const data = await alchemy.core.getTokenBalances(userAddress);

      setResults(data);

      const tokenDataPromises = [];

      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }

      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setHasQueried(true);
      setButtonText("Check ERC-20 Token Balances");
    } catch (err) {
      return alert("Invalid ETH wallet Address");
    }
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          {buttonText}
        </Button>

        <Heading my={36}>Welcome {ensName}</Heading>

        <Heading my={36}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  color="white"
                  bg="blue"
                  w={"20vw"}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> {tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                  </Box>
                  {tokenDataObjects[i].logo ? (
                    <Image
                      src={tokenDataObjects[i].logo}
                      style={{ width: 70, height: 70 }} // Better logo size
                    />
                  ) : (
                    <Image
                      src="/noLogo.png"
                      style={{ width: 70, height: 70 }} // Better logo size
                    />
                  )}
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;
