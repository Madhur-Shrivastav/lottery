import "./App.css";
import { useEffect, useState } from "react";
//import { Web3 } from "web3";
import Web3 from "web3";
//import detectEthereumProvider from "@metamask/detect-provider";
import LotteryABI from "./CONTRACTS/LotteryABI.json";
import { LotteryAddress } from "./CONTRACTS/LotteryAddress";
import { Routes, Route, Link } from "react-router-dom";
import Participants from "./COMPONENTS/Participants";
import ManagerComponent from "./COMPONENTS/Manager";

function App() {
  let [web3api, setweb3api] = useState({
    web3: null,
    contract: null,
    provider: null,
  });

  useEffect(() => {
    const inititate = async () => {
      //let provider = await detectEthereumProvider(); //Using the detectEthereumProvider() function imported from "@metamask/detect-provider" library to detect MetaMask.
      if (window.ethereum) {
        const provider = window.ethereum;
        // await provider.request({
        // method: "eth_requestAccounts",
        // }); //Requesting accounts from MetaMask.
        // provider.on("accountsChanged", async () => {
        // window.location.reload();
        // });//Reloading the page if someone changes a MetaMask account.
        const web3 = new Web3(provider); //Creating the web3 instance.
        //const networkID = await web3.eth.net.getId(); //Getting the network ID of our smart contract.
        //console.log("NetworkID of the contract is:", networkID);
        //console.log("Artifact of the contract is:", FunderArtifact); //Printing the smart contract's artifact we imported above.
        //console.log("Address of the contract is:", FunderAddress); //Printing the smart contract's address we imported above.
        const contract = new web3.eth.Contract(LotteryABI, LotteryAddress); //Creating the smart contract instance using it's ABI(Application Binary Interface) and it's address.
        console.log("Instance of the contract is:", contract); //Printing the smart contract instance we created above.
        setweb3api({
          web3,
          contract,
          provider,
        }); //Setting the Web3Api
        //console.log("Web3 API is:", web3api);
      } else if (window.web3) {
        const provider = window.web3;
        const web3 = new Web3(provider);
        const contract = new web3.eth.Contract(LotteryABI, LotteryAddress); //Creating the smart contract instance using it's ABI(Application Binary Interface) and it's address.
        //console.log("Instance of the contract is:", contract); //Printing the smart contract instance we created above.
        provider.eth.getAccounts((error) => {
          if (error) {
            console.error(error);
          } else {
            setweb3api({
              web3,
              contract,
              provider,
            }); //Setting the Web3Api
            //console.log("Web3 API is:", web3Api);
          }
        });
      } else {
        console.log("Please install MetaMask!");
      }
    };
    inititate();
  }, []);

  return (
    <>
      <div id="parent">
        <div id="navbar-box">
          <div id="navbar">
            <button id="gotomanager">
              <Link id="link" to="/">
                Manager
              </Link>
            </button>
            <button id="gotoparticipation">
              <Link id="link" to="/participants">
                Participation
              </Link>
            </button>
          </div>
        </div>

        <></>
      </div>
      <Routes>
        <Route
          path="/participants"
          element={<Participants web3api={web3api}></Participants>}
        ></Route>
        <Route
          path="/"
          element={<ManagerComponent web3api={web3api}></ManagerComponent>}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
