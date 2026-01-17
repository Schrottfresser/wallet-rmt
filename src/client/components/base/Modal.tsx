import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { PropsWithChildren } from 'react';

type ModalWidth = 'small' | 'medium' | 'large';

interface ModalProps extends PropsWithChildren {
    isOpen?: boolean;
    onClose: () => void;
    title: string;
    size?: ModalWidth;
}

function Modal({ isOpen, onClose, children, title, size = 'medium' }: Readonly<ModalProps>) {
    let modalWidthClasses: string;
    switch (size) {
        case 'small':
            modalWidthClasses = 'max-w-1/5';
            break;
        case 'medium':
            modalWidthClasses = 'max-w-1/4';
            break;
        case 'large':
            modalWidthClasses = 'max-w-1/3';
            break;
    }

    const modalBaseClasses =
        'w-full rounded-xl border-2 p-5 backdrop-blur-2xl duration-300 ease-out data-closed:opacity-0';
    const modalClasses = [modalBaseClasses, modalWidthClasses].join(' ');

    return (
        <Dialog open={!!isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className={modalClasses}>
                        <DialogTitle as="h3" className="font-bold text-xl">
                            {title}
                        </DialogTitle>
                        {children}
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default Modal;
