import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from "./contracts/Voting.json";
import "./App.css"

function App() {
  const [total, setTotal] = useState();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const contract1 = new web3.eth.Contract(Voting.abi, "0xE24162BF083104F49933A70ED208982321F41E9A");
          setContract(contract1);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
          alert('MetaMask is not installed. Please consider installing it: https://metamask.io/');
        }
      }
    };
    loadBlockchainData();
  }, []);

  useEffect(() => {
    const getTotalCandidates = async () => {
      if (contract) {
        const total = await contract.methods.getTotalCandidates().call();
        setTotal(total);
      }
    };
    contract && getTotalCandidates();
  }, [contract]);

  useEffect(() => {
    const getAll = async () => {
      if (contract) {
        const { 0: ids, 1: names, 2: voteCounts } = await contract.methods.getAllCandidates().call();
        const candidates = ids.map((id, index) => ({
          id: id,
          name: names[index],
          voteCount: Number(voteCounts[index].toString())
        }));


        
        setCandidates(candidates);
      }
    };
    contract && getAll();
  }, [contract]);

  const handleSelectCandidate = (id) => {
    setSelectedCandidate(id);
  };

  const handleVote = async () => {
    if (selectedCandidate === null) {
      alert("Please select a candidate to vote for.");
      return;
    }
    // const gasEstimate = await contract.methods.vote(selectedCandidate).estimateGas({ from: account });
    try {
      alert(account)
      console.log("select",typeof Number(selectedCandidate))
      const data = Number(selectedCandidate)
      
      await contract.methods.vote(1).send({ from: account, gas: 90000 });

      // window.location.reload(); // Optionally reload to update the UI post-vote
    } catch (error) {
      console.log("Error voting:", error);
      alert("Error while trying to vote. See console for more details.", error);
    }
  };

  console.log("candidate", candidates)
  return (
    <div className="App">
      <h1>Blockchain Voting App</h1>
      {account && <p>Connected Account: {account}</p>}
      <div className="candidates">
        {candidates.map((candidate) => (
          <div key={candidate.id}
               className={`card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
               onClick={() => handleSelectCandidate(candidate.id)}>
            <p>ID: {Number(candidate.id)}</p>
            <p>Name: {candidate.name}</p>
            <p>Votes: {Number(candidate.voteCount)}</p>
          </div>
        ))}
      </div>
      <button onClick={handleVote}>Vote</button>
      <div>This year there are {total && Number(total)} party for the election</div>
    </div>
  );
}

export default App;

