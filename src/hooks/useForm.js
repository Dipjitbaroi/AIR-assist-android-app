/**
 * useForm Hook
 * 
 * A custom hook for managing form state, validation, and submission.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Form validation hook
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @param {Function} onSubmit - Function to call on successful form submission
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, validate = () => ({}), onSubmit = () => {}) => {
  // Form values state
  const [values, setValues] = useState(initialValues);
  
  // Form errors state
  const [errors, setErrors] = useState({});
  
  // Form touched fields state
  const [touched, setTouched] = useState({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form dirty state (has the form been modified)
  const [isDirty, setIsDirty] = useState(false);
  
  /**
   * Handle input change
   * 
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const handleChange = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
    
    setIsDirty(true);
  }, []);
  
  /**
   * Handle input blur
   * 
   * @param {string} name - Field name
   */
  const handleBlur = useCallback((name) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true,
    }));
  }, []);
  
  /**
   * Set a specific field value
   * 
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);
  
  /**
   * Set a specific field error
   * 
   * @param {string} name - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error,
    }));
  }, []);
  
  /**
   * Set a specific field as touched
   * 
   * @param {string} name - Field name
   * @param {boolean} isTouched - Whether the field is touched
   */
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: isTouched,
    }));
  }, []);
  
  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);
  
  /**
   * Validate form values
   * 
   * @returns {Object} Validation errors
   */
  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, validate]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate form
    const validationErrors = validateForm();
    
    // If no errors, submit form
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
    
    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);
  
  /**
   * Check if form is valid
   * 
   * @returns {boolean} Whether the form is valid
   */
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  // Validate form when values change
  useEffect(() => {
    if (isDirty) {
      validateForm();
    }
  }, [values, isDirty, validateForm]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm,
    isValid,
  };
};

export default useForm;
