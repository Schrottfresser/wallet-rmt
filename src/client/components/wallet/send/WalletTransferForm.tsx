import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import useTransactions from '@client/hooks/useTransaction.js';
import { getAmountValidatorRegex } from '@client/util/currency.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { WalletDoc } from '@server/model/mongoose/wallet.js';
import { toSats } from '@server/util/currency.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback, useMemo } from 'react';

interface TransferValues {
    address: string;
    amount: string;
    estimateMode?: TransferPriority;
    substractFee?: boolean;
}

const initialValues: TransferValues = {
    address: '',
    amount: '',
    estimateMode: 'normal',
    substractFee: false,
};

interface WalletTransferFormProps {
    wallet: WalletDoc;
    username: string;
}

function WalletTransferForm({ wallet, username }: WalletTransferFormProps) {
    const { transfer } = useTransactions();

    const amountValidatorRegex = useMemo(() => wallet && getAmountValidatorRegex(wallet.type), [wallet?.type]);

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

            const txid = await transfer(
                username,
                wallet._id,
                values.address,
                toSats(values.amount),
                values.estimateMode,
                values.substractFee,
            );

            console.log(txid);

            setSubmitting(false);
        },
        [transfer],
    );

    return (
        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
            {({ isSubmitting, errors }) => (
                <Form noValidate>
                    <Field type="text" name="address" error={errors.address} placeholder="Transfer address" autoFocus />
                    <Field
                        type="text"
                        inputmode="decimal"
                        name="amount"
                        error={errors.amount}
                        placeholder="Transfer amount"
                        pattern={amountValidatorRegex}
                        className="mt-3"
                    />

                    <Button style="solid" type="submit" text="Send" disabled={isSubmitting} className="w-30 mt-3" />
                </Form>
            )}
        </Formik>
    );
}

export default WalletTransferForm;
