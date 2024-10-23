import dayjs from 'dayjs'
import { removeConfigLayout } from '@/utils/cache/local-storage'

import { useUserStore } from '@/store/modules/user'

import { ethers } from 'ethers'

import api from '@/utils/api'

import numeral from 'numeral'

import moment from 'moment-timezone'

import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ''
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout()
  location.reload()
}

async function checkChainId(chainId) {
  try {
    console.info(chainId)
    // @ts-ignore
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + parseInt(chainId).toString(16) }],
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function buildContract(blockchainId, smartContractCode) {
  const user = useUserStore()

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

  if (accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
    ElMessage.error('Sorry, the current use wallet and login wallet do not match')
    throw new Error('Sorry, the current use wallet and login wallet do not match')
  }

  const blockchain = await getBlockchain(blockchainId)

  console.info(blockchain)

  const currChainId = await ethereum.request({ method: 'eth_chainId' })

  // @ts-ignore
  if (parseInt(currChainId, 16) !== blockchain.chainId) {
    // example of switching or adding network with Harmony Mainnet
    const switchNetwork = async () => {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + parseInt(blockchain.chainId).toString(16) }],
        })
      } catch (switchError) {
        // 4902 error code indicates the chain is missing on the wallet
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x' + parseInt(blockchain.chainId).toString(16),
                  chainName: blockchain.name,
                  nativeCurrency: {
                    name: blockchain.currency,
                    symbol: blockchain.currency,
                    decimals: 18,
                  },
                  rpcUrls: [blockchain.publicRpcUrl],
                  blockExplorerUrls: [blockchain.blockBrowserUrl],
                },
              ],
            })
          } catch (error) {
            console.error(error)
          }
        }
      }
    }

    await switchNetwork()
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const smartContract = await getSmartContractByCode(smartContractCode, blockchainId)

  const contract = new ethers.Contract(smartContract.address, smartContract.contractBinary, signer)
  console.info(contract)
  return contract
}

export async function buildContractAddress(blockchainId, address) {
  const user = useUserStore()

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

  if (accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
    ElMessage.error('Sorry, the current use wallet and login wallet do not match')
    throw new Error('Sorry, the current use wallet and login wallet do not match')
  }

  const blockchain = await getBlockchain(blockchainId)

  console.info(blockchain)

  const currChainId = await ethereum.request({ method: 'eth_chainId' })

  // @ts-ignore
  if (parseInt(currChainId, 16) !== blockchain.chainId) {
    // example of switching or adding network with Harmony Mainnet
    const switchNetwork = async () => {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + parseInt(blockchain.chainId).toString(16) }],
        })
      } catch (switchError) {
        // 4902 error code indicates the chain is missing on the wallet
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x' + parseInt(blockchain.chainId).toString(16),
                  chainName: blockchain.name,
                  nativeCurrency: {
                    name: blockchain.currency,
                    symbol: blockchain.currency,
                    decimals: 18,
                  },
                  rpcUrls: [blockchain.publicRpcUrl],
                  blockExplorerUrls: [blockchain.blockBrowserUrl],
                },
              ],
            })
          } catch (error) {
            console.error(error)
          }
        }
      }
    }

    await switchNetwork()
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const smartContract = await getSmartContractByAddress(address, blockchainId)

  const contract = new ethers.Contract(smartContract.address, smartContract.contractBinary, signer)
  console.info(contract)
  return contract
}

async function getBlockchain(id) {
  const { result } = await api.get('/mgn/blockchain/queryById', { id })

  return result
}

async function getSmartContractByCode(code, blockchainId) {
  const { result } = await api.get('/mgn/smartContract/getSmartContractByCode', { code, blockchainId })

  return result
}

async function getSmartContractByAddress(address, blockchainId) {
  const { result } = await api.get('/mgn/smartContract/getSmartContractByContractAddress', { address, blockchainId })

  return result
}

export async function handleAuthorized(blockchainId, address, amount) {
  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const HyperAGI_Payment_Wallet = await buildContract(blockchainId, 'HyperAGI_Payment_Wallet')

  const allowance = await HyperAGI_Payment_Wallet.getAllowance(signer.getAddress(), address)

  console.info(`allowance:${ethers.formatEther(allowance)},amount:${amount}`)

  if (allowance >= ethers.parseEther(amount.toString())) {
    return
  }

  await (await HyperAGI_Payment_Wallet.authorize(address, ethers.parseEther(amount.toString()), { value: ethers.parseEther(amount.toString()) })).wait()
}

export function toAmount(amount) {
  return toCustomizeAmount(amount, 2)
}

export function toAccountAmount(amount) {
  console.info('amount:', amount)

  return toCustomizeAmount(amount, 10)
}

export function toCustomizeAmount(amount, num) {
  return amount
}

export function toLocalTime(dateStr) {
  let beijingTime = moment.tz(dateStr, 'Asia/Shanghai')
  let localTime = beijingTime.clone().tz(moment.tz.guess())

  let localTimeString = localTime.format('YYYY-MM-DD HH:mm:ss')

  return localTimeString
}

export function toServerTime(dateStr) {
  let beijingTime = moment.tz(dateStr, moment.tz.guess())
  let localTime = beijingTime.clone().tz('Asia/Shanghai')

  let localTimeString = localTime.format('YYYY-MM-DD HH:mm:ss')

  return localTimeString
}

export function exceptionHandling(e, t) {
  console.error('Error details:', e) // 输出完整的错误详情

  if (!e.code) {
    // 检查网络相关的错误
    if (e.message.includes('Failed to fetch') || e.message.includes('Network Error')) {
      ElMessage.error(t('errors.networkError'))
      return
    } else {
      ElMessage.error(e.message)
      return
    }
  }

  const error = e.info.error
  // RPC错误处理
  if (error.code && error.code === 4001) {
    // 用户拒绝了交易请求
    ElMessage.error(t('errors.transactionRejectedByUser'))
  } else if (error.code && error.code === -32000) {
    // 服务器拒绝了请求，可能是因为gas价格太低
    ElMessage.error(t('errors.serverRejectedRequest'))
  } else if (e.reason) {
    // 合约抛出的错误
    ElMessage.error(t('errors.contractError', { reason: e.reason }))
  } else {
    // 其他类型的错误
    ElMessage.error(e.message || t('errors.unknownError'))
  }
}

export function secondsToMinutesAndSeconds(seconds) {
  // 如果秒数少于60，直接返回秒数
  if (seconds < 60) {
    return `${seconds} seconds`
  }

  // 计算分钟和剩余的秒数
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  // 返回格式化的字符串
  if (remainingSeconds === 0) {
    return `${minutes} minutes`
  } else {
    return `${minutes} minutes ${remainingSeconds} seconds`
  }
}

export async function checkBalance(amount) {
  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  const balance = await provider.getBalance(address)

  if (balance <= amount) {
    throw new Error('Insufficient balance')
  }
}
