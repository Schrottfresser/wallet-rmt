import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import useSession from '@client/hooks/useSession.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface LoginFormValues {
    username: string;
}

const initialValues: LoginFormValues = {
    username: '',
};

interface WalletCreateModalProps {
    isOpen?: boolean;
    onClose: () => void;
}

function LoginModal({ isOpen, onClose }: Readonly<WalletCreateModalProps>) {
    const { login } = useSession();

    const [mnemonic, setMnemonic] = useState<string>();
    useEffect(() => {
        setMnemonic(undefined);
    }, [isOpen]);

    const modalSize = mnemonic ? 'medium' : 'small';
    const modalTitle = mnemonic ? 'Welcome to Wallet RMT!' : 'Login';

    const validate = useCallback((values: LoginFormValues): FormikErrors<LoginFormValues> => {
        const errors: FormikErrors<LoginFormValues> = {};
        if (!values.username) {
            errors.username = 'Username required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: LoginFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            const { mnemonic } = await login(values.username);

            setSubmitting(false);
            if (!mnemonic) {
                onClose();
            }

            setMnemonic(mnemonic);
        },
        [login],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={modalSize} title={modalTitle}>
            {mnemonic ? (
                <div>
                    <p className="font-bold">Please write down your recovery phrase:</p>
                    <p className="mt-3">{mnemonic}</p>
                </div>
            ) : (
                <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                    {({ isSubmitting, errors }) => (
                        <Form>
                            <Field
                                type="text"
                                name="username"
                                error={errors.username}
                                placeholder="Username"
                                autoFocus
                            />
                            <Button
                                style="solid"
                                type="submit"
                                text="Login"
                                disabled={isSubmitting}
                                className="w-30 mt-5 mx-auto"
                            />
                        </Form>
                    )}
                </Formik>
            )}
        </Modal>
    );
}

export default LoginModal;
