const $_anguleuxInterne = {

    bindingMap: {},
    forRegistry: {},
    forIndexStorage: {},
    forScope: {},
    forReprocessNeeded: false,
    customEventListeners: []

};

$_anguleuxInterne.initAnguleux = () => {
    $_anguleuxInterne.initElements();
    $_anguleuxInterne.initTemplating();
    $_anguleuxInterne.initDataBinding();
};

$_anguleuxInterne.initElements = () => {
    $_anguleuxInterne.dataBindElements = document.querySelectorAll('*[data-bind]');
    $_anguleuxInterne.agForElements = document.querySelectorAll("*[ag-for]");
    $_anguleuxInterne.agTemplateElements = document.querySelectorAll("*[ag-template=true]");
    $_anguleuxInterne.agTemplateDisabled = document.querySelectorAll("*[ag-template=false]");
};

window.addEventListener("load", $_anguleuxInterne.initAnguleux);

/**
 * Resolves an object path string (Object.Property.NestedProperty.DestinationProperty)
 * starting from the root object and will (always) return a reference to the object one level
 * above the DestinationProperty. The rootObject must NOT be included in the path!
 * If the path is only one level deep, the root object will be returned
 * @param rootObject Object
 * @param objectPath string
 * @returns Object
 */
$_anguleuxInterne.resolveObjectPathMoz = (rootObject, objectPath) => {
    let arr = objectPath.split('.');
    while (arr.length - 1) {
        rootObject = rootObject[arr.shift()];
    }
    return rootObject;
};

/**
 * Gets the last element of the object path (DestinationProperty)
 * @param objectPath
 */
$_anguleuxInterne.getDestinationName = (objectPath) => {
    return objectPath.split(".").pop();
};

window.$scope = {

    a: {
        b: {
            table: ["http://google.ca", "http://bing.com", "http://yahoo.ca", "http://duckduckgo.org"],
            destination: "destinationPropertyValue",
            bool: false
        }
    },
    tUsers: [
        {
            name: "User1",
            lastName: "User1",
            tSessions: [false, true, true]
        },
        {
            name: "User2",
            lastName: "User2",
            tSessions: [true, true, true]
        }
    ]
};

/**
 *
 * @param element
 * @param init direction of binding (for inputs only; true sets value of input to object, false does the opposite)
 */
$_anguleuxInterne.bindElement = (element, init) => {
    let strAttrDataBind = element.getAttribute("data-bind");
    let strBinAttrTemplate = element.getAttribute("ag-template");
    if (element instanceof HTMLInputElement) {
        if (init) {
            if (element.type === "checkbox") {
                element.checked = element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)];
            } else {
                element.value = element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)];
            }
        } else {
            if (element.type === "checkbox") {
                element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)] = element.checked;
            } else {
                element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)] = element.value;
            }
        }
    }
    if (!(element instanceof HTMLInputElement)) {
        if (strBinAttrTemplate === "true") {
            $_anguleuxInterne.handleTemplating(element);
        } else {
            element.innerHTML = element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)];
        }
    }
};

/**
 *
 * @param element HTMLElement
 * @param init boolean
 */
$_anguleuxInterne.updateBinding = (element, init) => {
    let strAttrDataBind = element.getAttribute("data-bind");
    $_anguleuxInterne.bindElement(element, init);
    $_anguleuxInterne.bindingMap[strAttrDataBind].forEach((x) => $_anguleuxInterne.bindElement(x, init));
};


$_anguleuxInterne.initDataBinding = () => {
    //Get elements and bind them
    $_anguleuxInterne.initElements();
    let arrElements = $_anguleuxInterne.dataBindElements;

    let id = 0;
    for (let key in arrElements) {
        let el = arrElements[key];
        if (el instanceof HTMLElement) {

            let strAttrDataBind = arrElements[key].getAttribute("data-bind");

            el.$_objRef = $_anguleuxInterne.resolveObjectPathMoz($scope, strAttrDataBind);
            el.$_uniqueID = id;

            if (!$_anguleuxInterne.bindingMap[strAttrDataBind])
                $_anguleuxInterne.bindingMap[strAttrDataBind] = [];
            $_anguleuxInterne.bindingMap[strAttrDataBind].push(el);

            el.addEventListener('change', () => $_anguleuxInterne.updateBinding(el));
            el.addEventListener('keydown', () => $_anguleuxInterne.updateBinding(el));
            el.addEventListener('keyup', () => $_anguleuxInterne.updateBinding(el));
            el.addEventListener('mousedown', () => $_anguleuxInterne.updateBinding(el));

            if($_anguleuxInterne.customEventListeners.length > 0){
                $_anguleuxInterne.customEventListeners.forEach(eventList => {
                    el.addEventListener('change', (e) => eventList(e));
                    el.addEventListener('keydown', (e) => eventList(e));
                    el.addEventListener('keyup', (e) => eventList(e));
                    el.addEventListener('mousedown', (e) => eventList(e));
                });
            }

            id++;
        }
    }
    //no choice, need to init first time after all ids are present
    for (let key in arrElements) {
        let el = arrElements[key];
        if (el instanceof HTMLElement) {
            $_anguleuxInterne.updateBinding(el, true);
        }
    }
};

/**
 * Handle ag-for attribute.
 * @param element HTMLElement
 * @param hasParentFor boolean
 */
$_anguleuxInterne.handleAgFor = (element) => {
    let attrFor = element.getAttribute("ag-for");
    let rgxFor = /(.*) in (.*)/g;
    let parsed = rgxFor.exec(attrFor);
    let varName = parsed[1];
    let bindPath = parsed[2];
    let parentForVariable = parsed[2].split(".")[0];
    let tableDestinationName = $_anguleuxInterne.getDestinationName(bindPath);

    if(element.getAttribute("for-done") === "true"){
        element.$_createdElementsTable.forEach((z) => {
            z.remove(); //begone
        });
        element.setAttribute("for-done", "false");
    }

    element.$_createdElementsTable = [];

    $_anguleuxInterne.forRegistry[varName] = (bindPath + "." + varName);

    let a = $_anguleuxInterne.forRegistry[varName].split(".");

    if($_anguleuxInterne.forRegistry[a[0]] !== undefined){
        a[0] = $_anguleuxInterne.forRegistry[a[0]];
        $_anguleuxInterne.forRegistry[varName] = a.join(".");
    }

    let fullyQualifiedPath = $_anguleuxInterne.forRegistry[varName];

    //hide original for element
    if(!element.classList.contains("ag-disp-none"))
        element.className += " ag-disp-none";

    let table;
    let scope;

    if (!$scope[bindPath.split(".")[0]]) {
        element.$_objRef = $_anguleuxInterne.resolveObjectPathMoz($_anguleuxInterne.forScope, bindPath); //forScope[varName] should be an array
        table = element.$_objRef[tableDestinationName];
        scope = $_anguleuxInterne.forScope;
    } else {
        element.$_objRef = $_anguleuxInterne.resolveObjectPathMoz($scope, bindPath); //destination of bind path should be an array
        table = element.$_objRef[tableDestinationName];
        scope = $scope;
    }

    //loop one
    table.forEach((x, i) => {
        $_anguleuxInterne.forScope[varName] = x;
        $_anguleuxInterne.forScope["_index"] = i;

        $_anguleuxInterne.forIndexStorage[varName] = i;

        let resolvedPathTable = fullyQualifiedPath.split(".");

        resolvedPathTable.forEach((pathElement, index)=>{
            if($_anguleuxInterne.forScope[pathElement] !== undefined){
                resolvedPathTable[index] = $_anguleuxInterne.forIndexStorage[pathElement];
            }
        });

        let resolvedPath = resolvedPathTable.join(".");
        console.log(resolvedPath);

        //make and clean cloned element, set ag-template to true
        let appendedChildClone = element.parentElement.appendChild(element.cloneNode(true));
        appendedChildClone.$_objRef = $_anguleuxInterne.resolveObjectPathMoz(scope, (bindPath + ".null"));
        appendedChildClone.$_objIndex = i;
        appendedChildClone.className = appendedChildClone.className.replace(" ag-disp-none", "");
        appendedChildClone.removeAttribute("ag-for");
        appendedChildClone.removeAttribute("for-done");

        element.$_createdElementsTable.push(appendedChildClone);

        //appendedChildClone.setAttribute("ag-template", "true");

        //get all children of child
        let agForChildren = Array.from(appendedChildClone.querySelectorAll("*[ag-for]"));

        agForChildren.forEach((y) => {
            $_anguleuxInterne.handleAgFor(y, true);
        });

        let inputChildren = Array.from(appendedChildClone.getElementsByTagName("input"));

        inputChildren.forEach((inputElement) => {
            if(inputElement.getAttribute("for-bind") === "true") {
                let fbp = inputElement.getAttribute("for-bind-path");
                if(fbp !== null){
                    inputElement.setAttribute("data-bind", (resolvedPath + "." + fbp));
                    inputElement.setAttribute("for-bind", "false");
                }else{
                    inputElement.setAttribute("data-bind", resolvedPath);
                    inputElement.setAttribute("for-bind", "false");
                }
            }
        });

        $_anguleuxInterne.handleTemplating(appendedChildClone, resolvedPath);

        /*if (hasParentFor === true) {
            //template using for scope
            $_anguleuxInterne.handleTemplating(appendedChildClone, true);
        } else {
            //template using normal scope
            $_anguleuxInterne.handleTemplating(appendedChildClone, false);
        }*/

    });

    element.setAttribute("for-done", "true");
};

// x : a.b.table.x
// x.tSessions = ['x','tSessions']
// x = a.b.table.x
// ['a.b.table.x', 'tSessions']
//

/**
 * Handle HTML templating for an element
 * @param element HTMLElement
 */
$_anguleuxInterne.handleTemplating = (element, manualBindPath) => {
    let rgxOnlyInnerHTML = /(?<=\>)(.*?)({{(?<innerTemplate>.+?)}})/gs;
    let rgxOnlyAttribute = /\S+?=("[^"]*?{{([^}]+?)}}[^"]*?")/g;

    let matches;

    let workingHTML;
    let outer = false;

    if(!element.innerHTML.match("<")){
        workingHTML = element.outerHTML;
        outer = true;
    }else{
        workingHTML = element.innerHTML;
        outer = false;
    }

    do {
        matches = rgxOnlyInnerHTML.exec(workingHTML);
        if (matches) {
            let tmpltName = matches.groups["innerTemplate"];
            if (!$scope[tmpltName.split(".")[0]]) {

                let actBindPath = manualBindPath;

                if(tmpltName === "_index"){
                    let value = $_anguleuxInterne.forScope["_index"];
                    let strOffset = element.getAttribute("index-offset");
                    let intOffset = Number.parseInt(strOffset);

                    if(strOffset){
                        workingHTML = workingHTML.replace(matches[2], ("<span for-index='" + (value + intOffset) + "'>" + (value + intOffset) + "</span>"));
                    }else{
                        workingHTML = workingHTML.replace(matches[2], ("<span for-index='" + value + "'>" + value + "</span>"));
                    }

                }else{
                    if(tmpltName.split(".").length === 2){
                        actBindPath += ("."+tmpltName.split(".")[1]);
                    }

                    if(!(element instanceof HTMLInputElement)){
                        let resolvedParentObject = $_anguleuxInterne.resolveObjectPathMoz($scope, actBindPath);
                        workingHTML = workingHTML.replace(
                            matches[2],
                            ("<span data-bind='" + actBindPath + "'>" + resolvedParentObject[$_anguleuxInterne.getDestinationName(actBindPath)] + "</span>")
                        );
                    }
                }

            } else {
                let resolvedParentObject = $_anguleuxInterne.resolveObjectPathMoz($scope, tmpltName);
                workingHTML = workingHTML.replace(matches[2], ("<span data-bind='" + tmpltName + "'>" + resolvedParentObject[$_anguleuxInterne.getDestinationName(tmpltName)] + "</span>"));
            }
        }
    } while (matches);

    if(outer){
        element.outerHTML = workingHTML;
    }else{
        element.innerHTML = workingHTML;
    }

    /*
    let attrMatches;
    do{
        let tmpltName = matches[2];
        attrMatches = rgxOnlyAttribute.exec(element.outerHTML);
        if(attrMatches){
            let resolvedParentObject = $_anguleuxInterne.resolveObjectPathMoz($scope, tmpltName);
            let
        }
    }while(matches);
    */
};

$_anguleuxInterne.initTemplating = () => {
    let arDoubleFor = Array.from(document.querySelectorAll("[double-for=true]"));
    let agForEls = Array.from($_anguleuxInterne.agForElements).filter((x) => {
        return !arDoubleFor.includes(x)
    });
    agForEls.forEach((x) => {
        try {
            $_anguleuxInterne.handleAgFor(x, false);
        } catch (e) {
            console.log("Error handling ag-for for element: ");
            console.log(x);
            console.log(e);
        }
    });

    $_anguleuxInterne.initElements();

    let allElements = Array.from($_anguleuxInterne.agTemplateElements).concat(Array.from($_anguleuxInterne.dataBindElements));
    allElements.forEach((x) => {
        try {
            $_anguleuxInterne.handleTemplating(x, false);
        } catch (e) {
            console.log("Error handling templating for element: ");
            console.log(x);
            console.log(e);
        }
    });
};