import React, { useContext, useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import useRealm from 'hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from 'utils/formatting'
import { tryParseKey } from 'tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  UiInstruction,
  MintForm,
  Instructions,
  ComponentInstructionData,
} from 'utils/uiTypes/proposalCreationTypes'
import { getAccountName } from 'components/instructions/tools'
import { debounce } from 'utils/debounce'
import { Governance } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getMintSchema } from 'utils/validations'
import { getMintInstruction } from 'utils/instructionTools'
import { NewProposalContext } from '../new'
import GovernedAccountSelect from '../components/GovernedAccountSelect'
import Button from '@components/Button'
import TokenBalanceCard from '@components/TokenBalanceCard'

export type MintTokensForm = {
  destinationAccount: string
  amount: number | undefined
  mintAccount: any
  programId: string | undefined
  title?: string
  description?: string
}

const MintTokens = ({
  index,
  governance,
  setGovernance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
  setGovernance: any
}) => {
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { getMintWithGovernances } = useGovernanceAssets()
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<MintTokensForm>({
    destinationAccount: '',
    // No default mint amount
    amount: undefined,
    mintAccount: undefined,
    programId: programId?.toString(),
    title: '',
    description: '',
  })
  const wallet = useWalletStore((s) => s.current)

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.Mint }])
  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const [
    mintGovernancesWithMintInfo,
    setMintGovernancesWithMintInfo,
  ] = useState<GovernedMintInfoAccount[]>([])
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(form.mintAccount.mintInfo)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }
  async function getInstruction(): Promise<UiInstruction> {
    return getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
    })
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form, governedAccount])
  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
  }, [form.mintAccount])
  useEffect(() => {
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      setMintGovernancesWithMintInfo(resp)
    }
    getMintWithGovernancesFcn()
  }, [])
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const schema = getMintSchema({ form, connection })

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex justify-between items-start">
        <div className="w-full flex flex-col gap-y-5 justify-start items-start max-w-xl rounded-xl">
          <GovernedAccountSelect
            label="Mint account"
            noMaxWidth
            useDefaultStyle={false}
            className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            governedAccounts={
              mintGovernancesWithMintInfo as GovernedMultiTypeAccount[]
            }
            onChange={(value) => {
              handleSetForm({ value, propertyName: 'mintAccount' })
            }}
            value={form.mintAccount}
            error={formErrors['mintAccount']}
            shouldBeGoverned={shouldBeGoverned}
            governance={governance}
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="my-6 w-full"
            label="Destination account"
            placeholder="Destination account"
            value={form.destinationAccount}
            type="text"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'destinationAccount',
              })
            }
            error={formErrors['destinationAccount']}
          />

          {destinationAccount && (
            <div className="flex justify-start items-center gap-x-2">
              <p className="pb-0.5 text-fgd-3 text-xs">Account owner:</p>
              <p className="text-xs">{form.destinationAccount}</p>
            </div>
          )}

          {destinationAccountName && (
            <div className="flex justify-start items-center gap-x-2">
              <p className="pb-0.5 text-fgd-3 text-xs">Account name:</p>
              <p className="text-xs">{destinationAccountName}</p>
            </div>
          )}

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="mb-6 w-full"
            placeholder="Amount"
            min={mintMinAmount}
            label="Amount"
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            error={formErrors['amount']}
            onBlur={validateAmountOnBlur}
          />

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={undefined}
            isLoading={isLoading}
            disabled={isLoading || !form.destinationAccount}
          >
            Mint tokens
          </Button>
        </div>

        <div className="max-w-xs w-full">
          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-6"
            label="Title of your proposal"
            placeholder="Title of your proposal (optional)"
            value={form.title || ''}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'title',
              })
            }
          />

          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-20"
            label="Description"
            placeholder="Describe your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
              })
            }
          />

          <TokenBalanceCard />
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default MintTokens
