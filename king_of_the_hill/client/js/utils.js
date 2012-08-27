define(['jquery'], function($) {

  // Simple scroll functionality in jQuery
  $.fn.scrollToBottom = function() {
    this.prop('scrollTop', this.prop('scrollHeight'));
  };

  var formatDate = function(date) {
    if (!date) return '';
    return [date.getFullYear(), padNumber(date.getMonth() + 1, 2), padNumber(date.getDate(), 2)].join('-');
  };

  var formatTime = function(date) {
     return [padNumber(date.getHours(), 2), padNumber(date.getMinutes(), 2), padNumber(date.getSeconds(), 2)].join(':');
  };

  var padNumber = function(value, length) {
    var string = value.toString();
    if (length <= string.length) return string.substring(0, length);
    return Array(length + 1 - string.length).join('0') + string;
  };

  return {
    formatDate : formatDate
  , formatTime : formatTime
  , padNumber  : padNumber
  };

});