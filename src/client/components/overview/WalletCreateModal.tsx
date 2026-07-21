import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import Select from '@client/components/base/Select.js';
import useSettings from '@client/hooks/useSettings.js';
import useWallets from '@client/hooks/useWallets.js';
import { WalletType } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback } from 'react';

interface WalletCreateFormValues {
    name: string;
    type: WalletType;
}

const initialValues: WalletCreateFormValues = {
    name: '',
    type: 'bitcoin',
};

interface WalletCreateModalProps {
    isOpen?: boolean;
    onClose: () => void;
    username: string;
}

function WalletCreateModal({ isOpen, onClose, username }: Readonly<WalletCreateModalProps>) {
    const wallets = useWallets();
    const { data: settings } = useSettings();

    const validate = useCallback((values: WalletCreateFormValues): FormikErrors<WalletCreateFormValues> => {
        const errors: FormikErrors<WalletCreateFormValues> = {};
        if (!values.name) {
            errors.name = 'Wallet name required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: WalletCreateFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            await wallets.create(values.name, values.type, username);

            setSubmitting(false);
            onClose();
        },
        [wallets.create, onClose],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Wallet" size="medium">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Field type="text" name="name" error={errors.name} placeholder="Wallet name" autoFocus />
                        <Select name="type" className="mt-3">
                            {settings?.walletTypes.map((walletType) => (
                                <option value={walletType}>{currencyProperties[walletType].name}</option>
                            ))}
                        </Select>

                        <div className="mt-8 flex justify-between">
                            <Button style="hollow" text="Cancel" onClick={onClose} className="w-30" />
                            <Button
                                style="solid"
                                type="submit"
                                text="Create"
                                disabled={isSubmitting}
                                className="w-30"
                            />
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default WalletCreateModal;
