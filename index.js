import { ethers } from "./ethers-5.7.esm.min.js"
import { abi, contractAddress } from "./constants.js"

console.log(ethers)
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balance")
const withdrawButton = document.getElementById("withdraw")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected")
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please install Metamask"
    }
}

//fund
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding amount:${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //Signer / wallet / someone with gas
        const signer = provider.getSigner()
        console.log(signer)
        //contract that we are interacting with
        // ABI and address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const trxRes = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //listen for the tx to be mined
            //listen fo an event
            await listenForTransactionToMine(trxRes, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
        // await trxRes.wait(1)
    } else {
        console.log("No funder yet")
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    } else {
        console.log("No funder yet")
    }
}

//withdraw

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing....")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const trxRes = await contract.withdraw()
            await listenForTransactionToMine(trxRes, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionToMine(transanctionRes, provider) {
    console.log(`Mining: ${transanctionRes.hash}`)
    //listen to the transaction
    return new Promise((resolve, reject) => {
        provider.once(transanctionRes.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`,
            )
            resolve()
        })
    })
}
