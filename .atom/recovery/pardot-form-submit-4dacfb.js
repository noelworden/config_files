// ==================================================================================================
//
// Pardot form submit handling
//
// ==================================================================================================
const pardotFormSubmit = () => {
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  let props = {
    isEnabled : false,
    passedValidation : false,
    currentPage : null,
    isInWaitingMode : false,
    formSolution: null,
    hashSchedulerRun: false,
    formSolutionClassName: null,
    formNewsletter: null,
    fieldTriggerEmpty: true
  };

  let els = {};

  // Cache dom element selectors
  // ------------------------------------------------
  const createChildren = () => {
    els.$pardotForm      = $('.js-pardot-form');
    els.$fields          = els.$pardotForm.find('.input-field');
    els.$requiredFields  = $('.js-form-required');
    els.$emailField      = $('.js-form-email');
    els.$errorNotice     = $('.js-form-error-notice');
    els.$formSuccess     = $('.js-form-success');
    els.$modalBtn        = $('.js-open-modal');
    els.$newsletterField = $('.js-subscribe-newsletter');
    els.$enableTrigger   = $('.js-enable-trigger');
    els.modalValue       = null;
    els.finalSubmitUrl   = null;
  }

  // Toggle visibility of label
  // ------------------------------------------------
  const toggleLabelVisibility = (e) => {
    let $thisField = $(e.currentTarget)

    if($thisField.val()) {
      $thisField.siblings('.input-label').addClass('is-invisible');
    } else {
      $thisField.siblings('.input-label').removeClass('is-invisible');
    }
  }

  // Individual field validation for empty
  // ------------------------------------------------
  const validateField = (element) => {
    let $thisField     = $(element);
    let thisFieldValue = $thisField.val();

    // Add error style to each empty field
    if(thisFieldValue.length === 0) {
      $thisField.addClass('input-field--error');
    } else {
      $thisField.removeClass('input-field--error');
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
        if(currentForm.find('.input-field--error').length === 0) {
          currentForm.parents('.form').siblings('.js-form-error-notice').slideUp(150);
        }
        props.passedValidation = true;
      } else {
        currentForm.parents('.form').siblings('.js-form-error-notice').slideDown(150);
        emailField.addClass('input-field--error');
      }
    }
  }

  // Build post url for submission
  // -------------------------------------------------
  const buildPostUrl = (currentForm) => {
    let submitBaseUrl           = '/pardot-prospect';
    let formSolution            = currentForm.find('.js-select').val()
    let formSolutionAdjusted    = (formSolution === "Communications") ? "PR and Communications" : formSolution
    props.formSolutionClassName = formSolution.replace(/\s+/g, '-').toLowerCase()
    props.formNewsletter = currentForm.find('.js-subscribe-newsletter--' + props.formSolutionClassName).is(":visible") === true ? currentForm.find('.js-subscribe-newsletter--' + props.formSolutionClassName + ' input.newsletter').is(':checked') : false;

    let formFirstName = currentForm.find('input.first_name').val();
    let formLastName  = currentForm.find('input.last_name').val();
    let formEmail     = currentForm.find('input.work_email').val();
    let formPhone     = currentForm.find('input.phone').val();
    let formCompany   = currentForm.find('input.company').val();
    let formTitle     = currentForm.find('input.title').val();
    let formMessage   = currentForm.find('textarea.message').val();
    let formDemo

    if (currentForm.find('input.js-schedule-demo:checked').length) {
      if (currentForm.find('input.js-schedule-demo:checked').data('response') === "demo-yes") {
        let formDemo = "yes"
      } else {
        let formDemo = "no"
      }
    }

    // if this is the footer signup form, force newsletter field to true
    if (currentForm.hasClass('js-newsletter-signup')) props.formNewsletter = true
    props.formSolution = formSolutionAdjusted

    // Build URL with search params
    const firstNameParam = (formFirstName === undefined) ? '' : `&first_name=${formFirstName}`
    const lastNameParam  = (formLastName === undefined) ? '' : `&last_name=${formLastName}`
    const phoneParam     = (formPhone === undefined) ? '' : `&phone=${formPhone}`
    const companyParam   = (formCompany === undefined) ? '' : `&company=${formCompany}`
    const titleParam     = (formTitle === undefined) ? '' : `&title=${formTitle}`
    const messageParam   = (formMessage === undefined) ? '' : `&message=${formMessage}`
    const demoParam      = (formDemo === undefined) ? '' : `&schedule_a_demo=${formDemo}`

    els.finalSubmitUrl = `${submitBaseUrl}?solution=${formSolutionAdjusted}` +
                                          `&work_email=${formEmail}` +
                                          `&newsletter_` + props.formSolutionClassName.replace('-', '_') + `=${props.formNewsletter}` +
                                          `${firstNameParam}` +
                                          `${lastNameParam}` +
                                          `${phoneParam}` +
                                          `${companyParam}` +
                                          `${titleParam}` +
                                          `${messageParam}` +
                                          `${demoParam}`;
  }

  const putFormIntoWaitingMode = (currentForm) => {
    props.isInWaitingMode = true;
    let $formSubmit = currentForm.find('.form__submit');
    $formSubmit.val('Processing...').addClass('is-waiting');
  }

  const removeWaitingMode = (formSubmit) => {
    props.isInWaitingMode = false;
    formSubmit.val('Submit').removeClass('is-waiting');
  }

  // Submit form
  // ------------------------------------------------
  const submitForm = (e) => {
    if(props.passedValidation) {
      let $currentForm = $(e.currentTarget);
      let $formSubmit  = $currentForm.find('.form__submit');
      // const eventCategoryValue = els.modalValue === null ? "Contact Us" : "Request More Info";
      const eventLabelValue  = $currentForm.parents('.js-data-from').data('jsFrom');

      $currentForm.parents('.form').siblings('.js-form-no-submit-notice').hide();

      putFormIntoWaitingMode($currentForm);
      buildPostUrl($currentForm);

      $.ajax({
        url: els.finalSubmitUrl,
        type: 'post',
        aysnc: false,
        success: () => {
          $currentForm.slideUp(300, () => {
            $currentForm.siblings('.js-form-success').slideDown(150);
            removeWaitingMode($formSubmit)
            checkScheduleDemoResponse($currentForm)
            checkNewsletterSignupResponse($currentForm)
          });
          // add GA success event
          // ga('send', 'event', 'Request More Info', 'complete', labelVal);

          // GTM form success event
          dataLayer.push({
            'event': 'formSubmit',
            'eventCategory': 'Request More Info',
            'eventAction': 'complete',
            'eventLabel': eventLabelValue,
            'solution': props.formSolution
          });

          // Reset to false in case form is submitted again
          props.passedValidation = false;
        },
        error: (response) => {
          removeWaitingMode($formSubmit);
          $currentForm.parents('.form').siblings('.js-form-no-submit-notice').slideDown(150);
        }
      });
    }
  }

  // Check if user wants to sign up for newsletter from modal RMI form
  // if so, fire GTM event
  // ------------------------------------------------
  const checkNewsletterSignupResponse = $currentForm => {
    // detect that form newsletter field exists
    if (props.formNewsletter && ($currentForm.find('input#newsletter-modal-info-' + props.formSolutionClassName).length > 0)) {
      // detect if form newsletter field has been checked or not
      const newsletterSignupResponse = $currentForm.find('input#newsletter-modal-info-' + props.formSolutionClassName)[0].checked
      if(newsletterSignupResponse) {
        // fire GTM event specific to positive newsletter signup
        dataLayer.push({
          'event': 'newsletterSignup',
          'eventCategory': 'Newsletter Sign-up',
          'eventAction': 'full',
          'eventLabel': 'RMI Form - ' + props.formSolution,
          'solution': props.formSolution
        });
      }
    }
  }

  // Check if user wants to schedule a demo
  // if so, launch Drift scheduler
  // https://help.drift.com/developer-docs/widget-api-drift-meetings
  // ------------------------------------------------
  const checkScheduleDemoResponse = $currentForm => {
    const demoResponse = $currentForm.find('input.js-schedule-demo:checked').data('response')

    if (demoResponse === "demo-yes") {
      // fire GTM event specific to positive demo response
      dataLayer.push({
        'event': 'requestDemo',
        'eventCategory': 'Request Demo',
        'eventAction': 'start',
        'eventLabel': 'RMI Form - ' + props.formSolution,
        'solution': props.formSolution
      });

      if(window.location.hash) props.hashSchedulerRun = true

      // open scheduler if haven't already
      if(!props.hashSchedulerRun) {
        props.hashSchedulerRun = true
        // uses Drift playbook hash to launch scheduler
        window.location.replace(window.location.href + '#schedule-a-demo')
      }
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

      validateEmailField($thisForm.find('.js-form-email'), $thisForm);

      // Show form-wide error message if necessary
      if($thisForm.find('.input-field--error').length > 0) {
        $thisForm.parents('.form').siblings('.js-form-error-notice').slideDown(150)

        // Listen for inline fixing of errors
        $thisForm.find('.input-field--error').on('keypress', (e) => {
          let element = $(e.currentTarget)
          validateField(element)
          validateEmailField($thisForm.find('.js-form-email'), $thisForm)
        });

      } else {
        $thisForm.parents('.form').siblings('.js-form-error-notice').slideUp(150)
        props.passedValidation = true
        submitForm(e)
      }
    }
  }

  // Toggle newsletter signup field if it exists for current solution
  // ------------------------------------------------
  const toggleNewsletterSignup = ($currentForm) => {
    // debugger
    // hide any currently visible newsletter fields
    // $currentForm.find('[class*="js-subscribe-newsletter"]').removeClass('is-visible').slideUp(300)
    $currentForm.find('.js-demo').removeClass('is-temporarily-hidden').slideUp(300)

    let chosenSolutionClassName = $currentForm.find('.js-select').val().replace(/\s+/g, '-').toLowerCase()
    let $solutionNewsletterField = $currentForm.find('.js-subscribe-newsletter--' + chosenSolutionClassName)

    // if a newsletter field for this vertical exists, show it
    // if ($solutionNewsletterField.length > 0) $solutionNewsletterField.addClass('is-visible').slideDown(300);

    // if (chosenSolutionClassName === "public-sector") $currentForm.find('.js-demo').addClass('is-temporarily-hidden')
    if (chosenSolutionClassName === "public-sector") $currentForm.find('.js-demo').addClass('is-temporarily-hidden').slideUp(300

  }

  // Check current page to set up pre-filled solution
  // ------------------------------------------------
  const checkCurrentPage = () => {
    props.currentPage     = window.location.pathname;
    let correctedPageName = props.currentPage.slice(1).split("-").join(" ");
    let pageName          = toTitleCase(correctedPageName);
    let formOptionForPage = els.$pardotForm.find('.js-select option[value="' + pageName + '"]');

    if(formOptionForPage.length > 0) {
      formOptionForPage.attr('selected', true);
      els.$pardotForm.find('.chosen-container span').text(pageName);

      els.$pardotForm.find('.active-result.result-selected').removeClass('result-selected');
      els.$pardotForm.find('.active-result:contains(' + pageName + ')').addClass('result-selected');
      els.$pardotForm.find('.js-select').trigger('chosen:updated');
    }

    // Make newsletter field visible if on News page
    toggleNewsletterSignup(els.$pardotForm)
  }

  // Grab current form and then toggle newsletter signup
  // ------------------------------------------------
  const grabCurrentForm = (e) => {
    let $currentForm = $(e.currentTarget).parents('.js-pardot-form')
    toggleNewsletterSignup($currentForm)
  }

  // Set up GA values to send on form success
  // ------------------------------------------------
  const setUpGAValues = (e) => {
    let $thisModal = $(e.currentTarget);
    els.modalValue = $thisModal.data('js-ga-label');
  }

  // Enable any disabled fields
  // ------------------------------------------------
  const enableDisabledFields = (e) => {
    props.fieldTriggerEmpty = false

    const $currentTrigger = $(e.currentTarget)
    const $parentForm = $currentTrigger.parents('.js-pardot-form')

    if ($currentTrigger.val()) {
      if (!props.fieldTriggerEmpty) $parentForm.find('.js-disabled').removeClass('form__field-group--disabled')
    } else {
      $parentForm.find('.js-disabled').addClass('form__field-group--disabled')
      props.fieldTriggerEmpty = true
    }
  }

  // Enable
  // ------------------------------------------------
  const enable = () => {
    if (props.isEnabled) return;

    // Add your event handlers here
    if(els.$pardotForm.length) {
      checkCurrentPage()
      els.$pardotForm.find('.js-select').on('change', grabCurrentForm);
      els.$modalBtn.on('click', setUpGAValues);
      els.$fields.on('input', toggleLabelVisibility);
      els.$pardotForm.on('submit', runValidations);

      if(els.$enableTrigger.length) els.$enableTrigger.on('keyup', enableDisabledFields)
    }

    props.isEnabled = true;

    return;
  }

  // Disable
  // ------------------------------------------------
  const disable = () => {
    if (!props.isEnabled) return;

    // Remove your event handlers here
    if(els.$pardotForm.length) {
      els.$pardotForm.find('.js-select').off('change', grabCurrentForm);
      els.$modalBtn.off('click', setUpGAValues);
      els.$fields.off('input', toggleLabelVisibility);
      els.$pardotForm.off('submit', runValidations);

      els.$pardotForm.show();
      els.$formSuccess.hide();
      props.passedValidation = false;
    }

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

export default pardotFormSubmit;
