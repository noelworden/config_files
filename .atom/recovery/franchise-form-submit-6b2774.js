// ==================================================================================================
//
// Pardot Form Submit
//
// ==================================================================================================
import { trackFranchiseGAEvent } from '../analytics/google-analytics-events';

const franchiseFormSubmit = () => {
  let props = {
    isEnabled : false,
    passedValidation : false,
    isInWaitingMode : false
  };

  let els = {};

  // Cache dom element selectors
  // ------------------------------------------------
  const createChildren = () => {
    els.$realEstateForm      = $('.js-real-estate-form')
    els.$pardotForm          = $('.js-pardot-form');
    els.$inputFields         = els.$pardotForm.find('.input-field');
    els.$checkboxLabel       = els.$pardotForm.find('.form__custom-checkbox-label');
    els.$checkbox            = els.$pardotForm.find('.form__custom-checkbox');
    els.$requiredFields      = els.$inputFields && els.$selectField && els.$checkboxField;
    els.$selectField         = $('.js-custom-select');
    els.$emailField          = $('.js-form-email');
    els.$phoneField          = $('.js-form-phone');
    els.$worthField          = $('.js-form-worth');
    els.$capitalField        = $('.js-form-capital');
    els.$imageUpload         = $('.js-file-upload-input');
    els.$uploadPlaceholder   = $('.js-file-upload-placeholder');
    els.$submitButton        = $('.js-form-submit');
    els.$errorNotice         = $('.js-form-error-notice');
    els.$formSuccess         = $('.js-form-success');
    els.$formFail            = $('.js-form-fail');
  }


  const activateForm = () => {
    els.$checkbox.trigger('click');
    els.$submitButton.toggleClass('is-active');
  }

  const uploadTextSwap = () => {
    if (els.$imageUpload.val().length > 1 ) {
      let newVal = els.$imageUpload.val().split('\\').pop();
      els.$uploadPlaceholder.html(newVal).css('color', 'black');
    }
  }

  // Form field validations
  // ------------------------------------------------
  const runValidations = (e) => {
    e.preventDefault();
    if(!props.isInWaitingMode) {
      let $thisForm = $(e.currentTarget);

      // Look at each required field for a value
      $thisForm.find('.js-form-required').each(function(index, element) {
        validateField(element);
      });

      validatePhoneField(els.$phoneField);
      validateEmailField(els.$emailField, $thisForm);
      if (els.$selectField.length) {
        validateSelect(els.$selectField);
      }
      if (els.$imageUpload.length) {
        validateField(els.$imageUpload);
      }
      if (els.$worthField.length) {
        validateWorthField(els.$worthField);
      }
      if (els.$capitalField.length) {
        validateCapitalField(els.$capitalField);
      }

      // Show form-wide error message if necessary
      if($thisForm.find('.input-field--error').length > 0) {
        $thisForm.siblings('.js-form-error-notice').addClass('is-visible');

        // Listen for inline fixing of errors
        $thisForm.find('.input-field--error').on('keypress', (e) => {
          let element = $(e.currentTarget);
          validateField(element);
          validatePhoneField(els.$phoneField);
          validateEmailField(els.$emailField, $thisForm);

          if (els.$selectField.length) {
            validateSelect(els.$selectField);
          }
          if (els.$worthField.length){
            validateWorthField(els.$worthField);
          }
          if (els.$capitalField.length) {
            validateCapitalField(els.$capitalField);
          }
        });
      } else {
        $thisForm.siblings('.js-form-error-notice').removeClass('is-visible');
        props.passedValidation = true;

        if (/\breal-estate\b/i.test(document.location.pathname)) {
          buildEmailPostUrl($thisForm);
        }

        if (/\bcontact\b/i.test(document.location.pathname)) {
          buildContactPostUrl($thisForm);
        }
      }
    }
  }

  // Individual field validation for empty
  // ------------------------------------------------
  const validateField = (element) => {
    let $thisField     = $(element);
    let $thisLabel     = $thisField.siblings('.input-label');
    let thisFieldValue = $thisField.val();

    // Add error style to each empty field
    if (thisFieldValue.length === 0) {
      $thisLabel.addClass('input-label--error-message');
      $thisField.addClass('input-field--error');
    } else {
      $thisLabel.removeClass('input-label--error-message');
      $thisField.removeClass('input-field--error');
    }
  }

  // How Hear validation
  // ------------------------------------------------
  const validateSelect = (element) => {
    let val = element[1].innerText;
    let $label  = $(element).siblings('.input-label');

    if (val === '0') {
      element.addClass('input-field--error');
      $label.addClass('input-label--error-message');
    } else {
      $(element).removeClass('input-field--error');
      $label.removeClass('input-label--error-message');
    }
  }

  // Phone number validation
  // ------------------------------------------------
  const validatePhoneField = (element) => {
    let number = element.val();
    let cleanNumber = number.replace(/[^\d]/g, '');

    if (cleanNumber.length > 9 && cleanNumber.length < 12) {
      element.removeClass('input-field--error');
      element.siblings('.input-label').removeClass('input-label--error-message');
      return true;
    } else {
      element.addClass('input-field--error');
      element.siblings('.input-label').addClass('input-label--error-message');
    }
  }

  // Net worth validation
  // ------------------------------------------------
  const validateWorthField = (element) => {
    let number = element.val().replace(/[^\w\s]/gi, '');
    let parsedNum = parseInt(number);

    if (parsedNum >= 1000000) {
      element.removeClass('input-field--error');
      element.siblings('.input-label').removeClass('input-label--error-message');
      return true;
    } else {
      element.addClass('input-field--error');
      element.siblings('.input-label').addClass('input-label--error-message');
    }
  }

  // Liquid capital validation
  // ------------------------------------------------
  const validateCapitalField = (element) => {
    let number = element.val().replace(/[^\w\s]/gi, '');
    let parsedNum = parseInt(number);

    if (parsedNum >= 400000) {
      element.removeClass('input-field--error');
      element.siblings('.input-label').removeClass('input-label--error-message');
      return true;
    } else {
      element.addClass('input-field--error');
      element.siblings('.input-label').addClass('input-label--error-message');
    }
  }

  // Test email field against email validation
  // ------------------------------------------------
  const validateEmailRegex = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  // Email field type validation
  // ------------------------------------------------
  const validateEmailField = (emailField, currentForm) => {
    if(!emailField.hasClass('input-field--error')) {
      let email = emailField.val();

      if (validateEmailRegex(email)) {
        if (currentForm.find('.input-field--error').length === 0) {
          props.passedValidation = true;
        }
      } else {
        emailField.siblings('.input-label').addClass('input-label--error-message');
        emailField.addClass('input-field--error');
      }
    }
  }

  // Build Url for send
  // ------------------------------------------------
  const buildContactPostUrl = (currentForm) => {
    let submitBaseUrl = '/franchise/pardot-prospect';
    let formFirstName   = currentForm.find('input.first_name').val();
    let formLastName    = currentForm.find('input.last_name').val();
    let formPhone       = currentForm.find('input.phone').val();
    let formEmail       = currentForm.find('input.email_address').val();
    let formZip         = currentForm.find('input.zip').val();
    let formLocation    = currentForm.find('input.location').val();
    let formCountry     = currentForm.find('input.country').val();
    let formHowHear     = currentForm.find('select.how_hear option:selected').text();
    let formNetWorth    = currentForm.find('input.net_worth').val();
    let formCapital     = currentForm.find('input.capital').val();

    // Build URL with search params
    debugger
    let submitUrl = `${submitBaseUrl}?first_name=${formFirstName}` +
                                         `&last_name=${formLastName}` +
                                         `&phone=${formPhone}` +
                                         `&email=${formEmail}` +
                                         `&zip=${formZip}` +
                                         `&location=${formLocation}` +
                                         `&country=${formCountry}` +
                                         `&how_hear=${formHowHear}` +
                                         `&net_worth=${formNetWorth}` +
                                         `&capital=${formCapital}`;
    submitForm(currentForm, submitUrl);
  }

  const buildEmailPostUrl = (currentForm) => {
    let submitUrl = '/franchise/real-estate-prospect';
    let data = currentForm.serializeArray();
    let formImage       = $('.js-file-upload-input')[0].files[0];
    let formData = new FormData();

    $.each(data, (key,input) => {
      formData.append(input.name, input.value);
    });
    formData.append('image', formImage);
    submitForm(currentForm, submitUrl, formData);
  }

  const putFormIntoWaitingMode = () => {
    props.isInWaitingMode = true;
    els.$submitButton.html('Processing...').removeClass('is-active');
  }

  const removeWaitingMode = () => {
    props.isInWaitingMode = false;
    els.$submitButton.removeClass('is-waiting');
  }

  // Submit form
  // ------------------------------------------------
  const submitForm = (e, url, data = '') => {
    if(props.passedValidation) {
      let $form = $(e.currentTarget);
      putFormIntoWaitingMode();

      $.ajax({
        url: url,
        type: 'post',
        data: data,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: () => {
          removeWaitingMode();
          els.$submitButton.html('').addClass('is-successful');
          els.$formSuccess.addClass('is-visible');
          trackFranchiseGAEvent(e);
        },
        error: (response) => {
          removeWaitingMode();
          els.$submitButton.html('Submit');
          els.$formFail.addClass('is-visible');
        }
      })
    }
  }

  // Enable
  // ------------------------------------------------
  const enable = () => {
    if (props.isEnabled) return;

    els.$pardotForm.on('submit', runValidations);
    els.$realEstateForm.on('submit', runValidations);
    els.$checkboxLabel.on('click', activateForm);
    els.$imageUpload.on('change', uploadTextSwap);

    props.isEnabled = true;

    return;
  }

  // Disable
  // ------------------------------------------------
  const disable = () => {
    if (!props.isEnabled) return;

    // Remove your event handlers here
    els.$checkboxLabel.off('click', activateForm);
    els.$pardotForm.off('submit', runValidations);
    els.$formSuccess.hide();

    props.passedValidation = false;
    props.isEnabled = false;

    return;
  }

  // Init
  // ------------------------------------------------
  const init = () => {
    createChildren();
    enable();
    return;
  }

  return {
    init,
    enable,
    disable
  };
}

export default franchiseFormSubmit;
