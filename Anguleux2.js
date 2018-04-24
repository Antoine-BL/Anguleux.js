const $portee = {};
Object.prototype.deepDefine = function (propriete, valeur) {
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

HTMLElement.prototype.isInput = function(){
    return (this instanceof HTMLInputElement);
};

window.onload = function () {
    (function () {
        const enumGestionDesTypes = {
            text: ["H1", "H2", "H3", "H4", "H5", "P", "SPAN"],
            input: ["INPUT"]
        };

        var tObjetsBound = [];

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

            if (!e.isInput()) {
                if ($portee[strNomObj]) {
                    e.innerText = $portee[strNomObj];
                } else {
                    $portee.deepDefine(strNomObj, e.innerText);
                }
            } else {
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

/**
 * Resolves an object path string (Object.Property.NestedProperty.DestinationProperty)
 * starting from the root object and will (always) return a reference to the object one level
 * above the DestinationProperty. The rootObject must NOT be included in the path!
 * If the path is only one level deep, the root object will be returned
 * @param rootObject Object
 * @param objectPath string
 * @returns Object
 */
function resolveObjectPath(rootObject, objectPath) {
    let t0 = performance.now();
    let arrSplitPath = objectPath.split(".");
    if (arrSplitPath.length === 1) {
        return rootObject;
    } else {
        let workingReference = rootObject;
        arrSplitPath.forEach((x, i) => {
            if (i < arrSplitPath.length-1) {
                workingReference = workingReference[x];
            }
        });
        let t1 = performance.now();
        console.log("No eval perf: " + (t1 - t0));
        return workingReference;
    }
}

/**
 * Same as resolveObjectPath but instead implemented with eval.
 * According to documentation the browser is forced to do an expensive variable name lookup
 * to find the reference in machine code. This can be avoided by using window as working scope and using Function();
 * @param rootObject
 * @param objectPath
 * @returns {*}
 */
function resolveObjectPathEval(rootObject, objectPath) {
    let t0 = performance.now();
    let oneLevelAbove = objectPath.split(".");
    oneLevelAbove.pop();
    oneLevelAbove = oneLevelAbove.join(".");
    let objectReference = null;
    objectReference = eval("rootObject." + oneLevelAbove);
    let t1 = performance.now();
    console.log("Eval perf: " + (t1 - t0));
    return objectReference;
}

/**
 * Same as the rest except implemented with Function and assuming there is a global var named $scope on window
 */
function resolvePathFunction(objectPath){
    let f = Function()
}

/**
 * Resolves an object path string (Object.Property.NestedProperty.DestinationProperty)
 * starting from the root object and will (always) return a reference to the object one level
 * above the DestinationProperty. The rootObject must NOT be included in the path!
 * If the path is only one level deep, the root object will be returned
 * @param rootObject Object
 * @param objectPath string
 * @returns Object
 */
function resolveObjectPathMoz(rootObject, objectPath) {
    let t0 = performance.now();
    let arr = objectPath.split('.');
    while (arr.length-1) {
        rootObject = rootObject[arr.shift()];
    }
    let t1 = performance.now();
    log("Moz perf: " + (t1 - t0));
    return obj;
}

/**
 * Gets the last element of the object path (DestinationProperty)
 * @param objectPath
 */
function getDestinationName(objectPath) {
    let split = objectPath.split(".");
    return split[split.length - 1];
}

window.log = console.log;

function test(){
    let root = {};
    root.a = {};
    root.a.b = {};
    root.a.b.destination = "destination";
    log("a.b.destination");
    log("expected result: b or {destination: 'destination'}");
    log("NoEval:");
    log(resolveObjectPath(root, "a.b.destination"));
    log("Eval:");
    log(resolveObjectPathEval(root, "a.b.destination"));
    log("Moz:");
    log(resolveObjectPathMoz(root, "a.b.destination"));
}