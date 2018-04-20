const $portee = {};
Object.prototype.deepDefine = function(propriete, valeur) {
  if (typeof propriete === 'string')
    propriete = propriete.split('.');

  if (propriete.length > 1) {
    let strNomProp = propriete.shift();
    this[strNomProp] = {};
    this[strNomProp].deepDefine(propriete, valeur);
  }
  else
    this[propriete[0]] = valeur;
};

// Object.prototype.deepGet = function(propriete) {
//   if (typeof propriete === 'string')
//     propriete = propriete.split('.');
//   if (propriete.length > 1) {
//     propriete.shift();
//     this.deepGet(propriete);
//   } else {
//     return this[propriete[0]];
//   }
// };



window.onload = function () {
  (function () {
    const enumGestionDesTypes = {
      text: ["H1", "H2", "H3", "H4", "H5", "P", "SPAN"],
      input: ["INPUT"]
    };

    let tObjetsBound = [];

    const updateBinding = function (element) {
      let strNomObj = element.getAttribute('data-bind');
      let nouvVal = (enumGestionDesTypes.text.indexOf(element.nodeName.toUpperCase()) > -1) ?
                                                                                      element.innerText : element.value;

      $portee[strNomObj] = nouvVal;
      console.log($portee[strNomObj]);
      tObjetsBound[strNomObj].forEach(e => {
        if (enumGestionDesTypes.text.indexOf(e.nodeName.toUpperCase()) > -1) {
          e.innerText = $portee[strNomObj];
        } else if (enumGestionDesTypes.input.indexOf(e.nodeName.toUpperCase()) > -1) {
          e.value = $portee[strNomObj];
        }
      });
    };

    let elements = document.querySelectorAll('*[data-bind]');
    elements.forEach(e => {
      let strNomObj = e.getAttribute('data-bind');
      let strTypeBalise = e.nodeName;
      if (!tObjetsBound[strNomObj])
        tObjetsBound[strNomObj] = [e];
      else
        tObjetsBound[strNomObj].push(e);

      if (enumGestionDesTypes.text.indexOf(strTypeBalise.toUpperCase()) > -1) {
        if ($portee[strNomObj]) {
          e.innerText = $portee[strNomObj];
        } else {
          $portee.deepDefine(strNomObj, e.innerText);
        }
      } else if (enumGestionDesTypes.input.indexOf(strTypeBalise.toUpperCase()) > -1) {
        if ($portee[strNomObj]) {
          e.value = $portee[strNomObj];
        } else {
          $portee.deepDefine(strNomObj, e.value);
        }
        e.addEventListener('change', () => updateBinding(e));
        e.addEventListener('keydown', () => updateBinding(e));
        e.addEventListener('keyup', () => updateBinding(e));
        e.addEventListener('mousedown', () => updateBinding(e));
      }
      updateBinding(e);
    });
  })();

  document.getElementsByTagName('input')[0].value = 'test';
  document.getElementsByTagName('input')[0].dispatchEvent(new Event('change'));
};