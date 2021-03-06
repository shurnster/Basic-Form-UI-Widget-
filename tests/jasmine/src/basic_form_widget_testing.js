'use strict';

$.widget('Shurns.basicForm', {

  options: {
    itemNames: [],
    perColumn: 2,
    allRowSameSize: false,
    button: {
      label: 'Submit',
      position: 'left'
    },
    field: {/*validation options*/}
  },

  _create: function () {

    var items = this.options.itemNames,
        field = this.options.field;

    if($.isArray(items) && items.length) {
      this._addClass(this.element, 'form-default');
      
      this._createData();
      this._columnToClass();
      this.element.append(this.uiFormBasic);
      this._submitButton();

      if(!$.isEmptyObject(field)) {
        this._basicValidate();
      }
    }
  },

  _getPerColumnNum: function() {
    var columnNumber = this.options.perColumn;

    //Number of columns can't be no more than 4 per row
    return Math.max(1, Math.min(4, columnNumber));
  },

  _toCamelCase: function(name) {
    //All attribute names from inputs needs to be converted to camel cases
    return name.replace(/(^([A-Z]+)|(\s([a-z])))/g, function (match, p1, p2) {
      if(p2) {
        return p2.toLowerCase();
      }
      return p1.toUpperCase();
    }).replace(/\s/g, '');
  },

  _createData: function () {
    var inputNames = this.options.itemNames,
        columns = this._getPerColumnNum(),
        formData = '',
        storeInputs = [],
        x = 0;

    this.uiFormBasic = $('<form action="#" method="POST">');

    /* 
     * Number of div.row element(s) will be created based on the length of the storeInputs 
     * array, where every other nth element(s) from the storeInputs array will equal to the perColumn
     * option, which extracts and stores every other nth element(s) in the "div.row" element(s)
     */

    $.each(inputNames, function (num, names) {
      storeInputs.push('<div><label>' + names + ':</label><input type="text" name="' + this._toCamelCase(names) + '"></div>');    
    }.bind(this));

    while (x < storeInputs.length) {
      formData += '<div class="rows">' + storeInputs.slice(x, x + columns) + '</div>';
      x += columns;
    }

    formData = formData.replace(/\,/g, '');

    this.uiFormBasic.append(formData);
  },

  _columnToClass: function () {
    var column = this._getPerColumnNum(),
        $allRows = this.uiFormBasic.find('div.rows'),
        cols = {1: 'twelve', 2: 'six', 3: 'four', 4: 'three'},
        colsString = cols[column] + ' columns', // Will be based on the grid css class
        allRowSameSize = this.options.allRowSameSize;

    this._addClass($allRows.find('div'), 'form-default');
    this._addClass($allRows.find('label'), 'labels');
    this._addClass($allRows.find('input'), 'form-default', 'custom-input');

    var equalRowSize = function() {
      var $lastRow = $allRows.last().children(),
          $prevRows = $allRows.last().prevAll().children(),
          lastCols = cols[$lastRow.length] + ' columns',

          /*
           * Expand the input to a bigger size based on the css
           * grid class system rules if the last row has less columns
           */
          evenWidth = $lastRow.length < $prevRows.length ? lastCols : colsString;

      this._addClass($prevRows, colsString);
      this._addClass($lastRow, evenWidth);
    }.bind(this);

    /*
     * Call the equalRowSize function if the allRowSameSize option is set to true, otherwise 
     * every input column will have the same grid column class from the perColum option.
     */
    if(allRowSameSize && $allRows.length > 1) {
      equalRowSize();
    }
    else {
      this._addClass($allRows.children(), colsString);
    }
  },

  _submitButton: function() {
    var label = this.options.button.label;

    this.btn = $('<button type="submit"></button>').button({label: label}); 
    this._addClass(this.btn, 'form-default', 'form-buttons');
    this.uiFormBasic.append(this.btn);
  },

  _basicValidate: function() {
    var form = this.element.children('form');

    this._on(form, {
      submit: function(evt) {
        var $formUi = this.uiFormBasic,
            $inputName,
            field = this.options.field,
            notValid = false,
            that = this;

        for(var i in field) {
          if(field.hasOwnProperty(i)) {
            $inputName = $formUi.find('input[name="' + i + '"]');

            if(field[i].required) {
              notValid = this._isRequired($inputName);
            }
            else if(field[i].validType) {
              notValid = this._validation($inputName)[field[i].validType]();
            }
            else {
              continue;
            }

            if(notValid) {
              $inputName.each(function() {
                var $inputError = $(this),
                    msg = ($inputError.prev().text().replace(/:$/, '') + ' is required').toLowerCase();

                /*
                 * Use the callback function so the span element should only be  
                 * created once every time the submit is still invaildated.
                 */

                $inputError.after(function() {
                  if(!$(this).next().is('span')) {
                    return '<span>' + (field[i].message || msg) + '</span>';
                  }
                });

                that._addErrors($inputError);

                evt.preventDefault();
              });
            }
            else {
              this._removeErrors($inputName);
            }
          }
        }
      }
    })
  },

  _isRequired: function(el) {
    return (el.val() === '' || !el.val().length);
  },

  _addErrors: function(el) {
    this._addClass(el, 'invalidInput');
    this._addClass(el.next(), 'errorMessage');
  },

  _removeErrors: function(el) {
    this._removeClass(el, 'invalidInput');
    this._removeClass(el.next(), 'errorMessage');
    el.next().remove();
  },

  _validation: function(el) {
    var regTests = {
      getPhone: /^(\([0-9]{3}\)[\s])(([0-9]{3}[\-])([0-9]{4}))$/ig,
      getAlpha: /^([A-Za-z]+)$/ig,
      getEmail: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/ig,
      getNumeric: /^[0-9]+$/ig,
      getZip: /(^\d{5}(?:[\s]?[-\s][\s]?\d{4})?$)/ig
    };

    return {
      phone: function() {
        return !(regTests.getPhone.test(el.val()));
      },
      alpha: function() {
        return !(regTests.getAlpha.test(el.val()));
      },
      email: function() {
        return !(regTests.getEmail.test(el.val()));
      },
      numeric: function() {
        return !(regTests.getNumeric.test(el.val()));
      },
      zip: function() {
        return !(regTests.getZip.test(el.val()));
      }
    }
  },
  
  _destroy: function () {
    this._removeClass(this.element, 'form-default');

    this.element.children('form').remove();
  }
});