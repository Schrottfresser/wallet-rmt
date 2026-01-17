import Button from '@client/components/base/Button.js';
import Modal from '@client/components/base/Modal.js';
import useWallets from '@client/hooks/useWallets.js';
import { Dialog, DialogPanel, DialogTitle, Select } from '@headlessui/react';
import { WalletType } from '@server/model/mongoose/wallet.js';
import { ErrorMessage, Field, Form, Formik, FormikErrors } from 'formik';
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
    const { createWallet } = useWallets();

    const validate = useCallback((values: WalletCreateFormValues): FormikErrors<WalletCreateFormValues> => {
        const errors: FormikErrors<WalletCreateFormValues> = {};
        if (!values.name) {
            errors.name = 'Required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: WalletCreateFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            await createWallet(values.name, values.type, username);

            setSubmitting(false);
            onClose();
        },
        [createWallet, onClose],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Wallet">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                    <Form>
                        <div className="flex gap-3 items-center">
                            <label htmlFor="name">Wallet name:</label>
                            <Field type="text" id="name" name="name" className="border-2 rounded-md p-1" />
                            <ErrorMessage name="name" component="div" className="text-red-600" />
                        </div>
                        <div className="flex gap-3 items-center mt-3">
                            <label htmlFor="type">Wallet type:</label>
                            <Select id="type" name="type" className="border-2 rounded-md p-1.5">
                                <option value="bitcoin">Bitcoin</option>
                                <option value="monero">Monero</option>
                            </Select>
                        </div>

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
