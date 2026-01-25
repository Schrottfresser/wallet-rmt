import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { Field as FormikField } from 'formik';

interface FieldProps {
    type: string;
    inputmode?: string;
    id?: string;
    name?: string;
    placeholder?: string;
    error?: string;
    autoFocus?: boolean;
    pattern?: RegExp;
    className?: string;
}

function Field({ type, inputmode, id, name, placeholder, error, autoFocus, pattern, className }: Readonly<FieldProps>) {
    const baseClasses = 'border-2 rounded-md p-1 w-full';
    const errorClasses = error ? 'border-red-600' : '';
    const classes = [baseClasses, errorClasses, className].join(' ');

    return (
        <>
            <FormikField
                type={type}
                inputmode={inputmode}
                id={id}
                name={name}
                className={classes}
                placeholder={placeholder}
                autoFocus={autoFocus}
                pattern={pattern?.source}
            />
            {error && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                    <ExclamationCircleIcon className="size-5" />
                    {error}
                </div>
            )}
        </>
    );
}

export default Field;
