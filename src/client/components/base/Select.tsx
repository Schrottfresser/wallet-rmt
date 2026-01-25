import { Select as HeadlessSelect } from '@headlessui/react';
import { useField } from 'formik';
import { PropsWithChildren } from 'react';

interface SelectProps extends PropsWithChildren {
    name?: string;
    className?: string;
}

function Select({ name, className, children }: SelectProps) {
    const [field, _meta, helpers] = useField(name || 'select');

    const baseClasses = 'border-2 rounded-md p-1.5';
    const classes = [baseClasses, className].join(' ');

    return (
        <HeadlessSelect
            value={field.value}
            onChange={(event) => helpers.setValue(event.target.value)}
            className={classes}
        >
            {children}
        </HeadlessSelect>
    );
}

export default Select;
