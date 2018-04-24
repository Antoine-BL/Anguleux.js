window.log = console.log;

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
    return rootObject;
}

/**
 * Gets the last element of the object path (DestinationProperty)
 * @param objectPath
 */
function getDestinationName(objectPath) {
    return objectPath.split(".").pop();
}

window.addEventListener("load", initAnguleux);

var $_anguleuxInterne = {

    bindingMap: {}

};

var $scope = {

    a: {
        b: {
            destination: "destinationPropertyValue"
        }
    }

};

/**
 *
 * @param element HTMLElement
 */
function updateBinding(element) {
    let strAttrDataBind = element.getAttribute("data-bind");

    if (element instanceof HTMLInputElement) {
        element.$_objRef[getDestinationName(element.getAttribute("data-bind"))] = element.value;
    } else {
        element.innerHTML = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
    }

    $_anguleuxInterne.bindingMap[strAttrDataBind].forEach((x) => {
        if (x instanceof HTMLInputElement && x.$_uniqueID !== element.$_uniqueID) {
            x.$_objRef[getDestinationName(element.getAttribute("data-bind"))] = element.value;
        } else {
            x.innerHTML = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
        }
    });

}

function initAnguleux() {

    //Get elements and bind them
    let arrElements = document.querySelectorAll('*[data-bind]')

    let id = 0;
    for (let key in arrElements) {
        let el = arrElements[key];
        if(el instanceof HTMLElement) {

            let strAttrDataBind = arrElements[key].getAttribute("data-bind");

            el.$_objRef = resolveObjectPathMoz($scope, strAttrDataBind);
            el.$_uniqueID = id;

            $_anguleuxInterne.bindingMap[strAttrDataBind] = [];
            $_anguleuxInterne.bindingMap[strAttrDataBind].push(el);

            el.addEventListener('change', () => updateBinding(el));
            el.addEventListener('keydown', () => updateBinding(el));
            el.addEventListener('keyup', () => updateBinding(el));
            el.addEventListener('mousedown', () => updateBinding(el));

            id++;
        }
    }
    //no choice
    for (let key in arrElements) {
        let el = arrElements[key];
        if(el instanceof HTMLElement) {
            updateBinding(el);
        }
    }
}

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