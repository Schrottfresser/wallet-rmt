import Button from '@client/components/base/Button.js';
import CurrencyValueField from '@client/components/base/CurrencyValueField.js';
import Field from '@client/components/base/Field.js';
import useTransactions from '@client/hooks/useTransaction.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback, useEffect } from 'react';

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
    const { transfer } = useTransactions();

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

            const txid = await transfer(
                username,
                wallet._id,
                values.address,
                amount,
                values.estimateMode,
                values.substractFee,
            );

            console.log(txid);

            setSubmitting(false);
        },
        [transfer],
    );

    return (
        <Formik
            initialValues={{ ...initialValues, amountUnit: currencyProperties[wallet.type].units.main.name }}
            validate={validate}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, errors }) => (
                <Form noValidate>
                    <Field type="text" name="address" error={errors.address} placeholder="Transfer address" autoFocus />
                    <CurrencyValueField
                        currency={wallet.type}
                        name="amount"
                        placeholder="Transfer amount"
                        error={errors.amount}
                        amountValidatorRegex={amountValidatorRegex}
                        selectName="amountUnit"
                    />

                    <Button style="solid" type="submit" text="Send" disabled={isSubmitting} className="w-30 mt-3" />
                </Form>
            )}
        </Formik>
    );
}

export default WalletTransferForm;
