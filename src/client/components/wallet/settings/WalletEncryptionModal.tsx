import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback } from 'react';

interface WalletEncryptionFormValues {
    newPassword: string;
    oldPassword: string;
}

const initialValues: WalletEncryptionFormValues = {
    newPassword: '',
    oldPassword: '',
};

interface WalletEncryptionModalProps {
    isOpen?: boolean;
    onClose: () => void;
    walletPassword: (newPassword: string, oldPassword?: string) => Promise<void>;
    isLocked?: boolean;
}

function WalletEncryptionModal({ isOpen, onClose, walletPassword, isLocked }: WalletEncryptionModalProps) {
    const modalTitle = isLocked ? 'Change wallet password' : 'Encrypt wallet';

    const validate = useCallback((values: WalletEncryptionFormValues): FormikErrors<WalletEncryptionFormValues> => {
        const errors: FormikErrors<WalletEncryptionFormValues> = {};
        if (!values.newPassword) {
            errors.newPassword = 'New wallet password required';
        }

        if (!values.oldPassword && isLocked) {
            errors.oldPassword = 'Old wallet password required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (
            values: WalletEncryptionFormValues,
            { setSubmitting }: { setSubmitting: (submitting: boolean) => void },
        ) => {
            await walletPassword(values.newPassword, values.oldPassword ?? undefined);

            setSubmitting(false);
            onClose();
        },
        [walletPassword, onClose],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="medium">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Field
                            type="password"
                            name="newPassword"
                            error={errors.newPassword}
                            placeholder="New wallet password"
                            autoFocus
                        />
                        {isLocked && (
                            <Field
                                type="password"
                                name="oldPassword"
                                error={errors.oldPassword}
                                placeholder="Old wallet password"
                                className="mt-3"
                            />
                        )}

                        <div className="mt-8 flex justify-between">
                            <Button style="hollow" text="Cancel" onClick={onClose} className="w-30" />
                            <Button style="solid" type="submit" text="Apply" disabled={isSubmitting} className="w-30" />
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default WalletEncryptionModal;
