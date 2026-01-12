import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for rating (0-100)
 */
export function ratingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null; // Let required validator handle this
        }

        const numValue = Number(value);

        if (isNaN(numValue)) {
            return { invalidNumber: true };
        }

        if (numValue < 0 || numValue > 100) {
            return { outOfRange: { min: 0, max: 100, actual: numValue } };
        }

        return null;
    };
}

/**
 * Validator for age (16-40)
 */
export function ageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numValue = Number(value);

        if (isNaN(numValue)) {
            return { invalidNumber: true };
        }

        if (numValue < 16 || numValue > 40) {
            return { outOfRange: { min: 16, max: 40, actual: numValue } };
        }

        return null;
    };
}

/**
 * Validator for form rating (0-10)
 */
export function formValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numValue = Number(value);

        if (isNaN(numValue)) {
            return { invalidNumber: true };
        }

        if (numValue < 0 || numValue > 10) {
            return { outOfRange: { min: 0, max: 10, actual: numValue } };
        }

        return null;
    };
}
