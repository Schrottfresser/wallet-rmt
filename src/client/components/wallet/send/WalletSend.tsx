import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import useTransactions from '@client/hooks/useTransaction.js';
import useWallets from '@client/hooks/useWallets.js';
import TransferPriority from '@server/model/currency/transferPriority.js';
import { toSats } from '@server/util/currency.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

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

interface WalletSendProps {
    username: string;
}

function WalletSend({ username }: WalletSendProps) {
    const { walletId } = useParams();
    const wallets = useWallets();
    const { transfer } = useTransactions();

    const wallet = useMemo(
        () => wallets.data?.find((wallet) => wallet._id.toString() === walletId),
        [wallets.data, walletId],
    );

    const validate = useCallback((values: TransferValues): FormikErrors<TransferValues> => {
        const errors: FormikErrors<TransferValues> = {};

        if (!values.address) {
            errors.address = 'Transfer address required';
        }

        if (!values.amount) {
            errors.amount = 'Transfer amount required';
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
        [wallets.create],
    );

    if (!wallet || !walletId || wallets.isLoading || wallets.error) {
        return;
    }

    return (
        <div className="p-4 w-full shrink">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Field
                            type="text"
                            name="address"
                            error={errors.address}
                            placeholder="Transfer address"
                            autoFocus
                        />
                        <Field
                            type="text"
                            name="amount"
                            error={errors.amount}
                            placeholder="Transfer amount"
                            className="mt-3"
                        />

                        <Button style="solid" type="submit" text="Send" disabled={isSubmitting} className="w-30 mt-3" />
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default WalletSend;
