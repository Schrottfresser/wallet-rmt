import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { ErrorMessage, Field as FormikField } from 'formik';

interface FieldProps {
    type: string;
    id?: string;
    name?: string;
    placeholder?: string;
    error?: string;
}

function Field({ type, id, name, placeholder, error }: Readonly<FieldProps>) {
    const baseClasses = 'border-2 rounded-md p-1 w-full';
    const errorClasses = 'border-red-600';
    const classes = [baseClasses, error ? errorClasses : ''].join(' ');

    return (
        <>
            <FormikField type={type} id={id} name={name} className={classes} placeholder={placeholder} />
            {error && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                    <ExclamationCircleIcon className="size-5" />
                    <ErrorMessage name="username" />
                </div>
            )}
        </>
    );
}

export default Field;
