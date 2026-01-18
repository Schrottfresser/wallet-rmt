import { Button as HeadlessButton } from '@headlessui/react';
import { ComponentType } from 'react';

type ButtonStyle = 'solid' | 'hollow';
type ButtonType = 'button' | 'submit';

interface ButtonProps {
    style: ButtonStyle;
    type?: ButtonType;
    icon?: ComponentType<React.SVGProps<SVGSVGElement>>;
    text?: string;
    title?: string;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

function Button({
    style,
    type = 'button',
    icon: Icon,
    text,
    title,
    disabled,
    onClick,
    className,
}: Readonly<ButtonProps>) {
    const baseClasses =
        'flex items-center justify-center gap-2 rounded-md cursor-pointer data-disabled:cursor-default h-9 px-2 border-2 data-disabled:opacity-50';
    const solidClasses = 'text-white border-black data-hover:border-gray-800 bg-black data-hover:bg-gray-800';
    const hollowClasses = 'text-black border-black bg-white data-hover:bg-gray-300';

    const classes = [
        baseClasses,
        className,
        style === 'solid' ? solidClasses : '',
        style === 'hollow' ? hollowClasses : '',
    ].join(' ');

    return (
        <HeadlessButton
            type={type}
            title={title}
            aria-label={title}
            disabled={disabled}
            onClick={onClick}
            className={classes}
        >
            {Icon && <Icon className="size-[1.25em]" />}
            {text}
        </HeadlessButton>
    );
}

export default Button;
