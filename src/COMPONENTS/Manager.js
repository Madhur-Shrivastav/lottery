import "./Manager.css";
import { useEffect, useState } from "react";

const ManagerComponent = ({ web3api }) => {
  const [ConnectedAccount, setConnectedAccount] = useState(null);
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
      setAccountBalance(
        web3.utils.fromWei(await web3.eth.getBalance(ConnectedAccount), "ether")
      );
    };
    web3 && getAccount();
  }, [web3api, ConnectedAccount]);

  const [Manager, SetManager] = useState(null);

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
  }, [web3api, Manager]);

  const [settingdetails, setsettingdetails] = useState(false);
  const [gettingwinner, setgettingwinner] = useState(false);
  const [paying, setpaying] = useState(false);

  const setdetails = async () => {
    setsettingdetails(true);
    const { contract } = web3api;
    const inputprice = document.getElementById("price").value;
    const inputtickets = document.getElementById("tickets").value;
    if (inputtickets === "" && inputprice === "") {
      alert("You need to enter a price and a number of tickets!");
      setsettingdetails(false);
      return;
    }
    if (inputprice === "") {
      alert("You need to enter a price!");
      setsettingdetails(false);
      return;
    }
    if (inputtickets === "") {
      alert("You need to enter a number of tickets!");
      setsettingdetails(false);
      return;
    }
    try {
      await contract.methods
        .set(
          inputtickets.trimEnd(),
          (parseFloat(inputprice) * 1000000000000000000).toString()
        )
        .send({ from: Manager, gas: 100000, gasLimit: 210001 });
      setsettingdetails(false);
      window.location.reload();
    } catch (error) {
      if (error.message.includes("Only the manager can call this function.")) {
        alert("Only the manager can call this function.");
        console.log("Only the manager can call this function.");
      } else if (
        error.message.includes("You need to have atleast 3 tickets!")
      ) {
        alert("You need to have atleast 3 tickets!");
        console.log("You need to have atleast 3 tickets!");
      } else if (
        error.message.includes(
          "The requested account and/or method has not been authorized by the user."
        )
      ) {
        alert("Only the manager can set details!");
        console.log("Only the manager can set details!");
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
      setsettingdetails(false);
    }
  };

  const [Winner, setWinner] = useState(null);

  const getwinner = async () => {
    setgettingwinner(true);
    const { contract } = web3api;
    try {
      await contract.methods.getWinner().call((error, result) => {
        if (error) {
          console.log(error);
          return;
        } else {
          setWinner(result);
          console.log("Our winner is=>" + result);
        }
      });
      setgettingwinner(false);
    } catch (error) {
      if (error.message.includes("Only the manager can call this function.")) {
        alert("Only the manager can call this function.");
        console.log("Only the manager can call this function.");
      } else {
        console.log(error);
      }
      setgettingwinner(false);
    }
  };
  const PayWinner = async () => {
    setpaying(true);
    const { contract } = web3api;
    try {
      await contract.methods
        .decide()
        .send({ from: Manager, gas: 2100000, gasLimit: 310001 });
      setpaying(false);
      window.location.reload();
    } catch (error) {
      if (error.message.includes("Only the manager can call this function.")) {
        console.log("Only the manager can call this function.");
        alert("Only the manager can call this function.");
      } else if (
        error.message.includes(
          "The requested account and/or method has not been authorized by the user."
        )
      ) {
        alert("Only the manager can pay the winner!");
        console.log("Only the manager can pay the winner!");
      } else if (error.message.includes("No one has participated yet!")) {
        alert("No one has participated yet!");
        console.log("No one has participated yet!");
      } else {
        alert(error);
        console.log(error);
      }
      setpaying(false);
    }
  };

  return (
    <>
      <div id="parent">
        <div id="manager" className="manager-participant-box">
          <div action="" id="manager-form">
            <h2>MANAGER SECTION</h2>
            <div id="address-div">
              <h4>Manager Account: {Manager ? Manager : "not available"}</h4>
            </div>
            <div id="tickets-input">
              <input type="text" id="tickets" />
              <label htmlFor="">Set Tickets:</label>
            </div>
            <div id="price-input">
              <input type="text" id="price" />
              <label htmlFor="">Set Price:</label>
            </div>
            <div>
              {settingdetails ? (
                <button id="setbtn" onClick={setdetails}>
                  SETTING DETAILS...
                </button>
              ) : (
                <button id="setbtn" onClick={setdetails}>
                  SET DETAILS
                </button>
              )}
            </div>
          </div>
        </div>
        <div id="winner" className="winner-box">
          <div action="" id="winner-form">
            <h2>WINNER SECTION</h2>
            <div id="address-div">
              <h4>
                Connected Account:{" "}
                {ConnectedAccount ? ConnectedAccount : "not connected"}
              </h4>
              <h4>
                Connected Account Balance:{" "}
                {Accountbalance ? Accountbalance + " ETH" : "not available"}
              </h4>
              <h4>Previous Winner: {Winner ? Winner : "no winner yet"}</h4>
            </div>
            <div>
              {gettingwinner ? (
                <button id="getwinnerbtn" onClick={getwinner}>
                  GETTING THE WINNER...
                </button>
              ) : (
                <button id="getwinnerbtn" onClick={getwinner}>
                  CHECK WINNER
                </button>
              )}
            </div>
            <div>
              {paying ? (
                <button id="paybtn" onClick={PayWinner}>
                  PAYING THE WINNER...
                </button>
              ) : (
                <button id="paybtn" onClick={PayWinner}>
                  PAY WINNER
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ManagerComponent;
