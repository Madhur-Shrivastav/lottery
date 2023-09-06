import "./Participants.css";
import { useEffect, useState } from "react";
import { LotteryAddress } from "../CONTRACTS/LotteryAddress";

const Participants = ({ web3api }) => {
  const [ConnectedAccount, setConnectedAccount] = useState(null);
  const [Contractbalance, setContractBalance] = useState(null);
  const [Accountbalance, setAccountBalance] = useState(null);
  const [WalletAccounts, setWalletAccounts] = useState([]); //Wallet being used is MetaMask.
  useEffect(() => {
    const { web3 } = web3api; //extracting {web3} from Web3Api which contains =>({web3,contract})
    const getAccount = async () => {
      const WalletAccounts = await web3api.provider.request({
        method: "eth_requestAccounts",
      }); //Requesting accounts from MetaMask.
      web3api.provider.on("accountsChanged", async () => {
        const WalletAccounts = await web3api.provider.request({
          method: "eth_requestAccounts",
        }); //Requesting accounts from MetaMask.
        const ConnectedAccount = WalletAccounts[0];
        setConnectedAccount(ConnectedAccount);
      });

      setWalletAccounts(WalletAccounts);
      console.log("MetaMask accounts are=>", WalletAccounts);
      const ConnectedAccount = WalletAccounts[0];
      setConnectedAccount(ConnectedAccount);
      setContractBalance(
        web3.utils.fromWei(await web3.eth.getBalance(LotteryAddress), "ether")
      );
      setAccountBalance(
        web3.utils.fromWei(await web3.eth.getBalance(ConnectedAccount), "ether")
      );
    };
    web3 && getAccount();
  }, [web3api, ConnectedAccount]);

  const [Receiver, SetReceiver] = useState(null);
  const [Manager, SetManager] = useState(null);
  const [Tickets, SetTickets] = useState(null);
  const [Price, SetPrice] = useState(null);
  useEffect(() => {
    const { contract } = web3api;
    const getmanager = async () => {
      await contract.methods.getManager().call((error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          const Manager = result;
          console.log("The manager is: " + Manager);
          SetManager(Manager);
        }
      });
    };
    contract && getmanager();
    const getreceiver = async () => {
      await contract.methods.getReceiver().call((error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          const Receiver = result;
          console.log("The receiver is: " + Receiver);
          SetReceiver(Receiver);
        }
      });
    };
    contract && getreceiver();
    const getprice = async () => {
      await contract.methods.getPrice().call((error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          const Price = result / 1000000000000000000;
          console.log("The price per ticket is: " + Price);
          SetPrice(Price);
        }
      });
    };
    contract && getprice();
    const getticketsleft = async () => {
      await contract.methods.getTicketsleft().call((error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          const Tickets = result;
          console.log("Left Tickets: " + Tickets);
          SetTickets(Tickets);
        }
      });
    };
    contract && getticketsleft();
  }, [web3api, Manager, Receiver, Price, Tickets]);

  const [participating, setparticipating] = useState(false);
  const [available, setavailable] = useState(false);

  const Participate = async () => {
    setparticipating(true);
    const { contract } = web3api;
    try {
      const inputname = document.getElementById("name").value;
      const inputtickets = document.getElementById("numberoftickets").value;
      if (inputname === "" && inputtickets === "") {
        alert("You have not filled the details!");
        setparticipating(false);
        return;
      }
      if (inputname === "") {
        alert("You have not filled the name!");
        setparticipating(false);
        return;
      }
      if (inputtickets === "") {
        alert("You have not filled the number of tickets!");
        setparticipating(false);
        return;
      }
      await contract.methods
        .participate(inputname, inputtickets.trimEnd())
        .send({
          from: ConnectedAccount,
          value: (
            parseFloat(inputtickets.trimEnd()) *
            parseFloat(Price) *
            1000000000000000000
          ).toString(),
          gas: 2100000,
          gasLimit: 310001,
        });
      setparticipating(false);
      window.location.reload();
    } catch (error) {
      if (
        error.message.includes(
          "You cannot buy more than half of the total tickets!"
        )
      ) {
        alert("You cannot buy more than half of the total tickets!");
        console.log("You cannot buy more than half of the total tickets!");
      } else if (error.message.includes("You have already participated!")) {
        alert("You have already participated!");
        console.log("You have already participated!");
      } else if (
        error.message.includes("Not enough balance in your account!")
      ) {
        alert("Not enough balance in your account!");
        console.log("Not enough balance in your account!");
      } else if (error.message.includes("Not enough tickets available!")) {
        alert("Not enough tickets available!");
        console.log("Not enough tickets available!");
      } else if (error.message.includes("The manager cannot participate.")) {
        alert("The manager cannot participate.");
        console.log("The manager cannot participate.");
      } else if (
        error.message.includes(
          "MetaMask Tx Signature: User denied transaction signature."
        )
      ) {
        alert("You have rejected to sign the transaction!");
        console.log("You have rejected to sign the transaction!");
      } else {
        alert(error.message);
        console.log(error.message);
      }
      setparticipating(false);
    }
  };

  useEffect(() => {
    const { contract } = web3api;
    const getparticipants = async () => {
      await contract.methods.getParticipants().call((error, result) => {
        if (error) {
          console.error(error);
          return;
        }
        const RequestCards = document.getElementById("request-cards");
        result.forEach((participant) => {
          const CardContainer = document.createElement("div");
          CardContainer.id = "card-container";
          const Card = document.createElement("div");
          Card.id = "card";
          for (var i = 1; i <= 4; i++) {
            if (i === 1) {
              const h4 = document.createElement("h4");
              h4.textContent =
                "Participated at: " +
                new Date(participant.participantTime * 1000).toLocaleString();
              Card.appendChild(h4);
            }
            if (i === 2) {
              const h4 = document.createElement("h4");
              h4.textContent = "Name: " + participant.participantName;
              Card.appendChild(h4);
            }
            if (i === 3) {
              const h4 = document.createElement("h4");
              h4.textContent =
                "Address: " + participant.participantAddress.toLocaleString();
              Card.appendChild(h4);
            }
            if (i === 4) {
              const h4 = document.createElement("h4");
              h4.textContent =
                "Number of tickets bought: " +
                participant.participantTickets.toLocaleString();
              Card.appendChild(h4);
            }
          }
          CardContainer.appendChild(Card);
          RequestCards.appendChild(CardContainer);
          setavailable(true);
        });
      });
    };
    contract && getparticipants();
  }, [web3api]);

  return (
    <>
      <div id="parent">
        <div id="lottery-details-box">
          <div id="lottery-details">
            <h2>LOTTERY DETAILS</h2>
            <h4>Manager Address: {Manager ? Manager : "not available"}</h4>
            <h4>
              Contract Address:{" "}
              {LotteryAddress ? LotteryAddress : "not available"}
            </h4>
            <h4>
              Contract Balance:{" "}
              {Contractbalance ? Contractbalance + " ETH" : "not available"}
            </h4>
            <h4>
              Price per ticket: {Price ? Price + " ETH" : "not available"}
            </h4>
            <h4>Tickets left: {Tickets} </h4>
          </div>
        </div>
        <div id="participant" className="manager-participant-box">
          <div action="" id="participant-form">
            <h2>PARTICIPATION SECTION</h2>
            <div id="address-div">
              <h4>
                Connected Account:{" "}
                {ConnectedAccount ? ConnectedAccount : "not connected"}
              </h4>
              <h4>
                Connected Account Balance:{" "}
                {Accountbalance ? Accountbalance + " ETH" : "not available"}
              </h4>
            </div>
            <div id="name-input">
              <input type="text" id="name" />
              <label htmlFor="">Your name:</label>
            </div>
            <div id="numberoftickets-input">
              <input type="text" id="numberoftickets" />
              <label htmlFor="">Number of tickets you want to buy:</label>
            </div>
            <div>
              {participating ? (
                <button id="purchasebtn" onClick={Participate}>
                  PARTICIPATING...
                </button>
              ) : (
                <button id="purchasebtn" onClick={Participate}>
                  PARTICIPATE
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          {available ? (
            <div id="participantsbar">
              <h1>PARTICIPANTS</h1>
            </div>
          ) : (
            <div id="participantsbar">
              <h1>NO PARTICIPANTS YET....</h1>
            </div>
          )}
        </div>

        <div id="request-cards"></div>
      </div>
    </>
  );
};
export default Participants;
