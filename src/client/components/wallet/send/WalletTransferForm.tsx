import Button from '@client/components/base/Button.js';
import Checkbox from '@client/components/base/Checkbox.js';
import Field from '@client/components/base/Field.js';
import Select from '@client/components/base/Select.js';
import useTransactions from '@client/hooks/useTransactions.js';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback } from 'react';

interface TransferValues {
    address: string;
    amount: string;
    amountUnit: string;
    estimateMode?: TransferPriority;
    substractFee?: boolean;
}

const initialValues: TransferValues = {
    address: '',
    amount: '',
    amountUnit: '',
    estimateMode: 'normal',
    substractFee: false,
};

interface WalletTransferFormProps {
    wallet: WalletDoc;
    username: string;
}

function WalletTransferForm({ wallet, username }: WalletTransferFormProps) {
    const { transfer } = useTransactions(wallet._id.toString());

    const amountValidatorRegex = currencyProperties[wallet.type].amountRegex;
    const convertLesserUnit = currencyProperties[wallet.type].units.lesser.convert;

    const validate = useCallback((values: TransferValues): FormikErrors<TransferValues> => {
        const errors: FormikErrors<TransferValues> = {};

        if (!values.address) {
            errors.address = 'Transfer address required';
        }

        if (!values.amount) {
            errors.amount = 'Transfer amount required';
        } else if (amountValidatorRegex && !values.amount.match(amountValidatorRegex)) {
            errors.amount = 'Transfer amount not valid';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: TransferValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            if (!wallet) {
                return;
            }

            const amount =
                values.amountUnit === currencyProperties[wallet.type].units.main.name
                    ? convertLesserUnit(values.amount)
                    : BigInt(values.amount);

            const txid = await transfer(username, values.address, amount, values.estimateMode, values.substractFee);

            console.log(txid);

            setSubmitting(false);
        },
        [wallet, transfer],
    );

    const currencyName = currencyProperties[wallet.type].name;

    const mainUnitName = currencyProperties[wallet.type].units.main.name;
    const lesserUnitName = currencyProperties[wallet.type].units.lesser.name;

    return (
        <Formik
            initialValues={{ ...initialValues, amountUnit: currencyProperties[wallet.type].units.main.name }}
            validate={validate}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, errors }) => (
                <Form noValidate>
                    <h2 className="text-2xl font-bold">Send {currencyName}</h2>
                    <Field
                        type="text"
                        name="address"
                        error={errors.address}
                        placeholder="Transfer address"
                        autoFocus
                        className="mt-4"
                    />

                    <div className="flex items-center mt-4">
                        <Field
                            type="text"
                            inputmode="decimal"
                            name="amount"
                            error={errors.amount}
                            placeholder="Transfer amount"
                            pattern={amountValidatorRegex}
                            excludeErrorMessage
                            className="mr-2"
                        />
                        <Select name="amountUnit" className="border-2 rounded-md p-1.5 mr-4">
                            <option value={mainUnitName}>{mainUnitName}</option>
                            <option value={lesserUnitName}>{lesserUnitName}</option>
                        </Select>
                        <Select name="estimateMode" className="border-2 rounded-md p-1.5">
                            <option value="normal">Normal</option>
                            <option value="important">Important</option>
                            <option value="unimportant">Unimportant</option>
                        </Select>
                    </div>
                    {errors.amount && (
                        <div className="text-red-600 text-sm flex items-center gap-1">
                            <ExclamationCircleIcon className="size-5" />
                            {errors.amount}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                        <label htmlFor="substractFee">Substract fee</label>
                        <Checkbox name="substractFee" title="Substract fee" />
                    </div>

                    <Button style="solid" type="submit" text="Send" disabled={isSubmitting} className="w-30 mt-8" />
                </Form>
            )}
        </Formik>
    );
}

export default WalletTransferForm;
