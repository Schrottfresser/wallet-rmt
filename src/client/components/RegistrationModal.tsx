import Button from '@client/components/base/Button.js';
import Field from '@client/components/base/Field.js';
import Modal from '@client/components/base/Modal.js';
import useSession from '@client/hooks/useSession.js';
import { Form, Formik, FormikErrors } from 'formik';
import { useCallback } from 'react';

interface RegistrationFormValues {
    username: string;
}

const initialValues: RegistrationFormValues = {
    username: '',
};

interface RegistrationModalProps {
    isOpen?: boolean;
    onClose: () => void;
}

function RegistrationModal({ isOpen, onClose }: Readonly<RegistrationModalProps>) {
    const session = useSession();

    const validate = useCallback((values: RegistrationFormValues): FormikErrors<RegistrationFormValues> => {
        const errors: FormikErrors<RegistrationFormValues> = {};
        if (!values.username) {
            errors.username = 'Username required';
        }

        return errors;
    }, []);

    const handleSubmit = useCallback(
        async (values: RegistrationFormValues, { setSubmitting }: { setSubmitting: (submitting: boolean) => void }) => {
            await session.register(values.username);

            setSubmitting(false);
        },
        [session.login],
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="small" title="Register">
            <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                {({ isSubmitting, errors }) => (
                    <Form>
                        <Field type="text" name="username" error={errors.username} placeholder="Username" autoFocus />
                        <Button
                            style="solid"
                            type="submit"
                            text="Register"
                            disabled={isSubmitting}
                            className="w-30 mt-5 mx-auto"
                        />
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default RegistrationModal;
