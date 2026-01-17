import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import useSession from '@client/hooks/useSession.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback } from 'react';

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

    const validate = useCallback((values: LoginFormValues): FormikErrors<LoginFormValues> => {
        const errors: FormikErrors<LoginFormValues> = {};
        if (!values.username) {
            errors.username = 'Username required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: LoginFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            await login(values.username);

            setSubmitting(false);
            onClose();
        },
        [login],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Login">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form className="mt-5">
                        <Field type="text" name="username" error={errors.username} placeholder="Username" />
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
        </Modal>
    );
}

export default LoginModal;
