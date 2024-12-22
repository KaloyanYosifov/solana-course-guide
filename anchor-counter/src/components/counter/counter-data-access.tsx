import { getCounterProgram, getCounterProgramId } from '../../../anchor/src'
import { Program } from '@coral-xyz/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useTransactionToast } from '../ui/ui-layout'
import { useAnchorProvider } from '../solana/solana-provider'

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const program = getCounterProgram(provider)
  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  })
  const initialize = useMutation({
    mutationKey: ['counter', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) => {
      return program.methods.initialize().accounts({ counter: keypair.publicKey }).signers([keypair]).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)

      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account!'),
  })

  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  return {
    initialize,
    accounts,
    program,
    programId,
    getProgramAccount,
  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()
  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.counter.fetch(account),
  })
  const increment = useMutation({
    mutationKey: ['counter', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ counter: account }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)

      return Promise.all([accounts.refetch(), accountQuery.refetch()])
    },
    onError: () => toast.error('Failed to increment on program!'),
  })

  return {
    accountQuery,
    increment,
    accounts,
  }
}
