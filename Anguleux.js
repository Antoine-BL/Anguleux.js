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

    bindingMap: {},
    forRegistry: []

};

var $scope = {

    a: {
        b: {
            table: ["http://google.ca", "http://bing.com", "http://yahoo.ca", "http://duckduckgo.org"],
            destination: "destinationPropertyValue"
        }
    }

};

/**
 *
 * @param element
 * @param init
 * @param direction boolean false: element to object, true object to element
 */
function bind(element, init, direction=true){
    let strAttrDataBind = element.getAttribute("data-bind");

}

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
            if(element.getAttribute("ag-template") === "true"){
                handleTemplating(element)
            }
            else
                element.value = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
        }
    } else {
        if(element.getAttribute("ag-template") === "true"){
            //Template bind do nothing
            handleTemplating(element);
        }else{
            //Simple bind
            element.innerHTML = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
        }
    }

    $_anguleuxInterne.bindingMap[strAttrDataBind].forEach((x) => {
        console.log(x);
        if (x instanceof HTMLInputElement && x.$_uniqueID !== element.$_uniqueID) {
            if(!init)
            {
                x.$_objRef[getDestinationName(x.getAttribute("data-bind"))] = x.value;
            }else{
                x.value = x.$_objRef[getDestinationName(x.getAttribute("data-bind"))];
            }
        } else {
            if(x.$_objRef)
                if(element.getAttribute("ag-template") === "true"){
                    //Template bind
                    handleTemplating(element);
                }else{
                    //Simple bind
                    element.innerHTML = element.$_objRef[getDestinationName(element.getAttribute("data-bind"))];
                }
            else
                x.parentElement.removeChild(x);
        }
    });

}

function initElements(){
    $_anguleuxInterne.dataBindElements = document.querySelectorAll('*[data-bind]');
    $_anguleuxInterne.agForElements = document.querySelectorAll("*[ag-for]");
    $_anguleuxInterne.agTemplateElements = document.querySelectorAll("*[ag-template=true]");
    $_anguleuxInterne.agTemplateDisabled = document.querySelectorAll("*[ag-template=false]");
}

function initDataBinding(){
    //Get elements and bind them
    initElements();
    let arrElements = $_anguleuxInterne.dataBindElements;

    let id = 0;
    for (let key in arrElements) {
        let el = arrElements[key];
        if(el instanceof HTMLElement) {

            let strAttrDataBind = arrElements[key].getAttribute("data-bind");

            el.$_objRef = resolveObjectPathMoz($scope, strAttrDataBind);
            el.$_uniqueID = id;

            if(!$_anguleuxInterne.bindingMap[strAttrDataBind])
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

/**
 * Handle ag-for attribute.
 * @param element HTMLElement
 */
function handleAgFor(element){
    //Setup working vars
    let strAttrAgFor = element.getAttribute("ag-for");
    let rgxFor = /(.*) in (.*)/g;
    let parsed = rgxFor.exec(strAttrAgFor);
    let strNomVarFor = parsed[1];
    let strNomTable = parsed[2];
    let strNomTableSeul = getDestinationName(strNomTable);

    //Setup the for element
    element.display = "none";
    element.$_objRef = resolveObjectPathMoz($scope, strNomTable);

    //Do the for, generate HTMLElements
    for (let key in element.$_objRef[strNomTableSeul]) {
        let appendedChild = element.parentElement.appendChild(element.cloneNode(true));
        appendedChild.$_objRef = resolveObjectPathMoz($scope, (strNomTable+".null"));
        element.setAttribute("ag-template", "true");
        element.setAttribute("data-bind", (strNomTable+"."+key));
        $scope[strNomVarFor] = element.$_objRef[strNomTableSeul][key];
        console.log(key);
        handleTemplating(appendedChild);
    }

}

/**
 * Handle HTML templating for an element
 * @param element HTMLElement
 */
function handleTemplating(element) {
    let rgx = /{{([^}]+)}}/g;
    let matches;
    do {
        matches = rgx.exec(element.innerHTML);
        if (matches) {
            let tmpltName = matches[1];
            let resolvedParentObject = resolveObjectPathMoz($scope, tmpltName);
            console.log(matches[1]);
            console.log(resolvedParentObject);
            console.log(tmpltName);
            //replace
            element.innerHTML = rgx[Symbol.replace](element.innerHTML, resolvedParentObject[getDestinationName(tmpltName)]);
        }
    } while (matches);
}

function initTemplating(){
    let agForEls = Array.from($_anguleuxInterne.agForElements);
    let allElements = Array.from($_anguleuxInterne.agTemplateElements).concat(Array.from($_anguleuxInterne.dataBindElements)).concat(agForEls);

    allElements.forEach((x, i) => {
        if(agForEls.includes(x)){
            handleAgFor(x);
        } else{}
        //handleTemplating();
    });
}

function initAnguleux() {
    initElements();
    initTemplating();
    initDataBinding();
}