import Field from '@client/components/base/Field.js';
import Select from '@client/components/base/Select.js';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { WalletType } from '@server/model/mongoose/wallet.js';
import { currencyProperties } from '@server/util/currency.js';

interface CurrencyValueField {
    currency: WalletType;
    name?: string;
    placeholder?: string;
    error?: string;
    amountValidatorRegex?: RegExp;
    selectName?: string;
}

function CurrencyValueField({
    currency,
    name,
    placeholder,
    error,
    amountValidatorRegex,
    selectName,
}: CurrencyValueField) {
    const mainUnitName = currencyProperties[currency].units.main.name;
    const lesserUnitName = currencyProperties[currency].units.lesser.name;

    return (
        <>
            <div className="flex items-center mt-3">
                <Field
                    type="text"
                    inputmode="decimal"
                    name={name}
                    error={error}
                    placeholder={placeholder}
                    pattern={amountValidatorRegex}
                    excludeErrorMessage
                    className="mr-2"
                />
                <Select name={selectName} className="border-2 rounded-md p-1.5">
                    <option value={mainUnitName}>{mainUnitName}</option>
                    <option value={lesserUnitName}>{lesserUnitName}</option>
                </Select>
            </div>
            {error && (
                <div className="text-red-600 text-sm flex items-center gap-1">
                    <ExclamationCircleIcon className="size-5" />
                    {error}
                </div>
            )}
        </>
    );
}

export default CurrencyValueField;
