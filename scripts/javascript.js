(function (global) {
  "use strict";

  global.addEventListener('load', function () {
    ajaxForm(
      'messageForm',
      'messageFormAlert',
      'user-form__input',
      'response.json'
    );
  });


  /**
   * Submits a form with ajax and validates all fields on presence
   *
   * @param formId {String} Id of the form
   * @param alertId {String} Id of the Alert to print response message
   * @param inputClass {String} class names of inputs
   * @param url {String} Url to submit form
   * @returns {HTMLElement} a form element
   */
  function ajaxForm(formId, alertId, inputClass, url) {
    var alertDOM = getElement(alertId),
        formDOM = getElement(formId),
        inputDOMs = document.getElementsByClassName(inputClass),
        errorClassName = 'user-form__input--invalid',
        hasHtml5Validation = checkHtml5Validation(),
        isValid,

        submitForm = function (e) {
          isValid = validate(inputDOMs);
          if (isValid) {
            sendAjax(url, function (xhttp) {
              var headline;
              addClass(alertDOM, 'show');

              if (xhttp.response) {
                headline = xhttp.response.headline;
              } else {
                headline = JSON.parse(xhttp.responseText).headline;
              }
              alertDOM.innerHTML = headline;

            });
          };
		  e.preventDefault();
        };

    formDOM.addEventListener('submit', submitForm);


    // UTILS
    /**
     * Send Ajax to the server
     * @param url {String}
     * @param onSuccess {Function}
     * @returns {XMLHttpRequest}
     */
    function sendAjax(url, onSuccess) {
      var xhttp = new XMLHttpRequest();
      xhttp.responseType = 'json';
      xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          if (typeof onSuccess === 'function') {
            onSuccess(xhttp);
          }
        }
      };
      xhttp.open("GET", url);
      xhttp.send();
      return xhttp;
    }

    /**
     * Validate inputs for presence
     * @param inputs
     * @returns {boolean}
     */
    function validate(inputs) {
      var allValid = true,
          i = 0,
          j = inputs.length,
          currInput,
          currValue = '';

      for (; i < j; i++) {
        currInput = inputs[i];
        currValue = currInput.value;
        //debugger
        if (!currValue || hasHtml5Validation && !currInput.checkValidity()) {
          addClass(currInput, errorClassName);
          allValid = false;
        }
      }

      return allValid;
    }

    /**
     * Get element by its ID selector
     * @param id
     * @returns {HTMLElement}
     */
    function getElement(id) {
      return document.getElementById(id);
    }

    /**
     * Check if the current browser supports HTML5 forms validations
     * @returns {boolean}
     */
    function checkHtml5Validation() {
      return typeof document.createElement('input').checkValidity === 'function';
    }


    // http://stackoverflow.com/questions/6787383/how-to-add-remove-a-class-in-javascript
    /**
     * Check if particular element has class name
     * @param ele
     * @param cls
     * @returns {boolean}
     */
    function hasClass(ele, cls) {
      return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    /**
     * Add class name to particular element
     * @param ele
     * @param cls
     */
    function addClass(ele, cls) {
      if (!hasClass(ele, cls)) {
        ele.className += " " + cls;
      }
    }

    return formDOM;
  }

}(window));