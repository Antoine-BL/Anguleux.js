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
    let arr = objectPath.split('.');
    while (arr.length-1) {
        rootObject = rootObject[arr.shift()];
    }
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
 * @param init boolean
 */
function updateBinding(element, init) {
    let strAttrDataBind = element.getAttribute("data-bind");

    if (element instanceof HTMLInputElement) {
        if(!init) {
            element.$_objRef[getDestinationName(element.getAttribute("data-bind"))] = element.value;
        }else{
            element.value = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
        }
    } else {
        element.innerHTML = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
    }

    $_anguleuxInterne.bindingMap[strAttrDataBind].forEach((x) => {
        if (x instanceof HTMLInputElement && x.$_uniqueID !== element.$_uniqueID) {
            if(!init)
            {
                x.$_objRef[getDestinationName(x.getAttribute("data-bind"))] = x.value;
            }else{
                x.value = x.$_objRef[getDestinationName(x.getAttribute("data-bind"))];
            }
        } else {
            x.innerHTML = x.$_objRef[getDestinationName(x.getAttribute("data-bind"))];
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
    //no choice, need to init first time after all ids are present
    for (let key in arrElements) {
        let el = arrElements[key];
        if(el instanceof HTMLElement) {
            updateBinding(el, true);
        }
    }
}
