import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useField } from 'formik';

interface SelectProps {
    name?: string;
    title?: string;
    className?: string;
}

function Checkbox({ name, title, className }: SelectProps) {
    const [field, _meta, helpers] = useField(name || 'checkbox');

    const baseClasses = 'group block size-5 rounded border-2 bg-white data-checked:bg-black flex cursor-pointer';
    const classes = [baseClasses, className].join(' ');

    return (
        <HeadlessCheckbox
            value={field.value}
            onChange={(value) => helpers.setValue(value)}
            title={title}
            aria-label={title}
            className={classes}
        >
            <CheckIcon className="text-white opacity-0 group-data-checked:opacity-100" />
        </HeadlessCheckbox>
    );
}

export default Checkbox;
