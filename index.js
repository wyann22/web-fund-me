import { ethers } from "./lib/ethers.js"
import { abi, contractAddress } from "./constants.js"
const connectionButton = document.getElementById("connectionButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withDrawButton")
withdrawButton.onclick = withdraw
connectionButton.onclick = connect
balanceButton.onclick = getBalance
fundButton.onclick = fund
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("ethereum wallet installed")
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectionButton.innerHTML = "Connected"
  } else {
    connectionButton.innerHTML = "No installed wallet detected!"
  }
}
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transRes = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transRes, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transRes = await contract.withdraw()
      await listenForTransactionMine(transRes, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
function listenForTransactionMine(transRes, provider) {
  console.log(`Mining ${transRes.hash} ...`)
  return new Promise((resolve, reject) => {
    provider.once(transRes.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
    })
    resolve()
  })
}
