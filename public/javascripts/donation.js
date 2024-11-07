'use strict'

document.addEventListener("DOMContentLoaded", function () {
  paypal.Buttons({
    style: {
      shape: 'rect',
      color: 'blue',
      layout: 'vertical',
      label: 'donate'
    },
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '10.00'
          }
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert('Thank you for your donation, ' + details.payer.name.given_name + '! Birds are smiling at you :)');
      });
    },
    onError: function (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    }
  }).render('#paypal-button-container');
})
