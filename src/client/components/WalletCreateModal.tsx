import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import useWallets from '@client/hooks/useWallets.js';
import { Select } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { WalletType } from '@server/model/mongoose/wallet.js';
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
    const { create } = useWallets();

    const validate = useCallback((values: WalletCreateFormValues): FormikErrors<WalletCreateFormValues> => {
        const errors: FormikErrors<WalletCreateFormValues> = {};
        if (!values.name) {
            errors.name = 'Wallet name required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: WalletCreateFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            await create(values.name, values.type, username);

            setSubmitting(false);
            onClose();
        },
        [create, onClose],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Wallet" size="medium">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Field type="text" name="name" error={errors.name} placeholder="Wallet name" autoFocus />
                        <Select id="type" name="type" className="border-2 rounded-md p-1.5 mt-3">
                            <option value="bitcoin">Bitcoin</option>
                            <option value="monero">Monero</option>
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
