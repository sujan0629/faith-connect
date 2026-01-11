import { useState, useCallback } from 'react';
import type { ZodSchema, ZodError } from 'zod';

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function useZodValidation<T extends Record<string, any>>(schema: ZodSchema<T>) {
	const [errors, setErrors] = useState<ValidationErrors<T>>({});

	const validate = useCallback(
		(data: Partial<T>): boolean => {
			try {
				schema.parse(data);
				setErrors({});
				return true;
			} catch (error) {
				if (error instanceof Error && 'issues' in error) {
					const zodError = error as ZodError;
					const newErrors: ValidationErrors<T> = {};
					zodError.issues.forEach((issue) => {
						const path = issue.path[0] as keyof T;
						if (path && !newErrors[path]) {
							newErrors[path] = issue.message;
						}
					});
					setErrors(newErrors);
				}
				return false;
			}
		},
		[schema],
	);

	const validateField = useCallback(
		(field: keyof T, value: any): string | undefined => {
			try {
				// Validate just this field by parsing a partial object
				schema.parse({ [field]: value } as Partial<T>);
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[field];
					return newErrors;
				});
				return undefined;
			} catch (error) {
				if (error instanceof Error && 'issues' in error) {
					const zodError = error as ZodError;
					const fieldIssue = zodError.issues.find((issue) => issue.path[0] === field);
					const message = fieldIssue?.message;
					if (message) {
						setErrors((prev) => ({ ...prev, [field]: message }));
					}
					return message;
				}
			}
		},
		[schema],
	);

	const clearError = useCallback((field: keyof T) => {
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	}, []);

	const clearAllErrors = useCallback(() => {
		setErrors({});
	}, []);

	return {
		errors,
		validate,
		validateField,
		clearError,
		clearAllErrors,
	};
}
