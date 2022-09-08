import { state, actions } from './store/ajaxRequest.js';

/**
 * Represents a request factory
 * @param {Object}                    - request properties object
 * @param {string} url                - the request url
 * @param {function} successCallback  - run, when request status is  200 and state is 4
 * @param {string} [method=GET]       - the request method
 * @param {number} [maxRetry=2]       - how many times to retry send the request
 * @param {number} [delay=5000]       - the delay in milisec beetween two retry
 * @returns {function}                - the reqeust function, witch send the request
 */
function ajaxRequest({
  url,
  successCallback,
  method = 'GET',
  delay = 5000,
  maxRetry = 2,
  retryCount = 3,
} = {}) {
  actions.initRequest(maxRetry, delay);

  /**
   * Log error message to the console.error
   * @param {string} message - the error message
   */
  function handleError(message) {
    console.error(message);
  }

  /**
   * Handle ajax onload event
   * @param {Object} xhr - the error message
   */
  function handleLoad(xhr) {
    console.error(xhr);
    successCallback(xhr.response);
  }

  /**
   * Send ajax request
   */
  function request() {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = (ev) => handleLoad(new Error());
    xhr.onerror = (ev) => {
      if (ev.target.status === 404) {
        retryCount -= 1;
        if (retryCount === 0) {
          handleError(`Resource not avaiable: ${url}`);
        } else {
          const to = setTimeout(() => {
            clearTimeout(to);
            request();
          }, delay);
        }
      } else {
        handleError(ev.message);
      }
    };
    xhr.send();
  }

  return request;
}

export default ajaxRequest;
