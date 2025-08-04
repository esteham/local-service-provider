import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useLiveValidation = (table, field, excludeId = null) => {
  const [validationState, setValidationState] = useState({
    isChecking: false,
    isValid: null,
    message: '',
    exists: false
  });

  const validateValue = useCallback(async (value) => {
    if (!value || value.length < 2) {
      setValidationState({
        isChecking: false,
        isValid: null,
        message: '',
        exists: false
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isChecking: true }));

    try {
      const params = new URLSearchParams({
        table,
        field,
        value: value.trim()
      });

      if (excludeId) {
        params.append('exclude_id', excludeId);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/backend/api/validate.php?${params}`
      );

      if (response.data.success) {
        setValidationState({
          isChecking: false,
          isValid: response.data.available,
          message: response.data.message,
          exists: response.data.exists
        });
      } else {
        setValidationState({
          isChecking: false,
          isValid: null,
          message: 'Validation error',
          exists: false
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState({
        isChecking: false,
        isValid: null,
        message: 'Unable to validate',
        exists: false
      });
    }
  }, [table, field, excludeId]);

  // Debounced validation
  const debouncedValidate = useCallback((value) => {
    const timeoutId = setTimeout(() => {
      validateValue(value);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [validateValue]);

  return {
    ...validationState,
    validate: debouncedValidate,
    reset: () => setValidationState({
      isChecking: false,
      isValid: null,
      message: '',
      exists: false
    })
  };
};

export default useLiveValidation;
