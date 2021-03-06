const $_anguleuxInterne = {

    bindingMap: {},
    forRegistry: {},
    attrRegistry: {},
    forIndexStorage: {},
    forScope: {},
    staticAttributeRegistry: {},
    forReprocessNeeded: false,
    customEventListeners: [],
    customEndingEvents: []

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

    forHREF: {

        test: '{{x}}__{{x}}',
        href: '{{x}}',
        style: '{{a.b.style}}'

    },

    ddlValueBind: {
        value: '{{x.categorie}}'
    },

    test:{
        testattr: '{{y}}'
    },

    a: {
        b: {
            hyperLien: "https://google.ca",
            table: ["http://google.ca", "http://bing.com", "http://yahoo.ca", "http://duckduckgo.org"],
            destination: "destinationPropertyValue",
            bool: false,
            style: 'background-color: #FFF;'
        }
    },
    tUsers: [
        {
            name: "User1",
            lastName: "User1",
            tSessions: [false, true, true],
            categorie: 'Test'
        },
        {
            name: "User2",
            lastName: "User2",
            tSessions: [true, true, true],
            categorie: 'Test2'
        }
    ],

    model: {
        tCategories: [
            {"id": "1", "description": "Test"},
            {"id": "2", "description": "Test2"}]
    }
};

/**
 *
 * @param element
 * @param init direction of binding (for inputs only; true sets value of input to object, false does the opposite)
 */
$_anguleuxInterne.bindElement = (element, init) => {
    let strAttrDataBind = element.getAttribute("data-bind");
    let strBinAttrTemplate = element.getAttribute("ag-template");

    //Bind attribute
    //if (element.hasAttribute("attrib-bind-obj")) {
    //    $_anguleuxInterne.updateAttributes(element);
    //}

    if ((element instanceof HTMLInputElement) || (element instanceof HTMLSelectElement)) {
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
                if (element.type === "text" && element.hasAttribute("validate")) {
                    let rgx = new RegExp(element.getAttribute("validate"));
                    element.$_isValid = false;
                    if (element.value.match(rgx)) {
                        element.$_isValid = true;
                    }
                    element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)] = element.value;
                } else {
                    element.$_objRef[$_anguleuxInterne.getDestinationName(strAttrDataBind)] = element.value;
                }
            }
        }
    }
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLSelectElement)) {
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

$_anguleuxInterne.EventList = ['change', 'keyup', 'keydown', 'mousedown'];

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

            $_anguleuxInterne.EventList.forEach((eventName) => {
                el.addEventListener(eventName, (e) => {
                    if (e.$_init) {
                        $_anguleuxInterne.updateBinding(el, e.$_init);

                        if ($_anguleuxInterne.customEventListeners.length > 0) {
                            $_anguleuxInterne.customEventListeners.forEach(eventList => {
                                el.addEventListener(eventName, (e) => eventList(e, e.$_init));
                            });
                        }
                    } else {
                        $_anguleuxInterne.updateBinding(el);

                        if ($_anguleuxInterne.customEventListeners.length > 0) {
                            $_anguleuxInterne.customEventListeners.forEach(eventList => {
                                el.addEventListener(eventName, (e) => eventList(e));
                            });
                        }
                    }
                });
            });

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

    //For update
    if (element.getAttribute("for-done") === "true") {
        //Get all child for-loops
        let allChildAgFor = Array.from(element.querySelectorAll("*[ag-for]"));

        allChildAgFor.forEach((x) => {
            if (x.$_createdElementsTable) {
                x.$_createdElementsTable.forEach((x) => x.remove()); //begone
            }
        });

        if (element.$_createdElementsTable) {
            element.$_createdElementsTable.forEach((z) => {
                z.remove(); //begone
            });
            element.setAttribute("for-done", "false");
        }
    }

    element.$_createdElementsTable = [];

    $_anguleuxInterne.forRegistry[varName] = (bindPath + "." + varName);

    let a = $_anguleuxInterne.forRegistry[varName].split(".");

    if ($_anguleuxInterne.forRegistry[a[0]] !== undefined) {
        a[0] = $_anguleuxInterne.forRegistry[a[0]];
        $_anguleuxInterne.forRegistry[varName] = a.join(".");
    }

    let fullyQualifiedPath = $_anguleuxInterne.forRegistry[varName];

    //hide original for element
    if (!element.classList.contains("ag-disp-none"))
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

        resolvedPathTable.forEach((pathElement, index) => {
            if ($_anguleuxInterne.forScope[pathElement] !== undefined) {
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

        let inputChildren = Array.from(appendedChildClone.querySelectorAll('input,select'));

        inputChildren.forEach((inputElement) => {
            if (inputElement.getAttribute("for-bind") === "true") {
                let fbp = inputElement.getAttribute("for-bind-path");
                if (fbp !== null) {
                    inputElement.setAttribute("data-bind", (resolvedPath + "." + fbp));
                    inputElement.setAttribute("for-bind", "false");
                } else {
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
    $_anguleuxInterne.customEndingEvents.forEach(fct => fct(element));
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

    if (!element.innerHTML.match("<")) {
        workingHTML = element.outerHTML;
        outer = true;
    } else {
        workingHTML = element.innerHTML;
        outer = false;
    }

    do {
        matches = rgxOnlyInnerHTML.exec(workingHTML);
        if (matches) {
            let tmpltName = matches.groups["innerTemplate"];
            if (!$scope[tmpltName.split(".")[0]]) {

                let actBindPath = manualBindPath;

                if (tmpltName === "_index") {
                    let value = $_anguleuxInterne.forScope["_index"];
                    let strOffset = element.getAttribute("index-offset");
                    let intOffset = Number.parseInt(strOffset);

                    if (strOffset) {
                        workingHTML = workingHTML.replace(matches[2], ("<span for-index='" + (value + intOffset) + "'>" + (value + intOffset) + "</span>"));
                    } else {
                        workingHTML = workingHTML.replace(matches[2], ("<span for-index='" + value + "'>" + value + "</span>"));
                    }

                } else {
                    if (tmpltName.split(".").length === 2) {
                        actBindPath += ("." + tmpltName.split(".")[1]);
                    }

                    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLSelectElement)) {
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
    } while (matches && matches.groups["innerTemplate"] !== undefined);

    if (outer) {
            element.outerHTML = workingHTML;
    } else {
            element.innerHTML = workingHTML;
    }

    if (element.hasAttribute("attrib-bind-obj") || element.querySelectorAll("*[attrib-bind-obj]").length > 0) {
        $_anguleuxInterne.resolveAttributeTemplate(element, manualBindPath);
        Array.from(element.querySelectorAll("*[attrib-bind-obj]")).forEach((childElement) => {
            $_anguleuxInterne.resolveAttributeTemplate(childElement, manualBindPath);
        });
    }
};

$_anguleuxInterne.resolveAttributeTemplate = (element, manualBindPath) => {
    if (element.hasAttribute("attrib-bind-obj")) {
        let attrBindObj = $_anguleuxInterne.resolveObjectPathMoz($scope, element.getAttribute("attrib-bind-obj"))[$_anguleuxInterne.getDestinationName(element.getAttribute("attrib-bind-obj"))];

        for (let attr in attrBindObj) {
            if (attrBindObj.hasOwnProperty(attr)) {
                //iterate through props
                let rgx = /(.*?)({{(?<tmplt>.+?)}})/gs;

                let workingString = attrBindObj[attr];

                let matches;
                do {
                    matches = rgx.exec(workingString);
                    if (matches) {
                        let tmpltName = matches.groups["tmplt"];
                        let wholeTmpl = matches[2];
                        let actBindPath = "";

                        if (!$scope[tmpltName.split(".")[0]]) {
                            //Cant find root var in template in the global scope, use manualBindPath from the for-loop
                            actBindPath = manualBindPath;
                        } else {
                            actBindPath = tmpltName;
                        }

                        if (tmpltName.split(".").length === 2) {
                            actBindPath += ("." + tmpltName.split(".")[1]);
                        }

                        if(typeof actBindPath === 'string' || actBindPath instanceof String){
                            let value = $_anguleuxInterne.resolveObjectPathMoz($scope, actBindPath)[$_anguleuxInterne.getDestinationName(actBindPath)];
                            workingString = workingString.replace(wholeTmpl, value);
                        }

                    }
                } while (matches);

                element.setAttribute(attr, workingString);

            }
        }

       /*if(element.$_stat !== true){
            $_anguleuxInterne.updateAttributes(element);
        }

       if(element.$_stat === true){
            //element.removeAttribute("attrib-bind-obj");
       }*/

    }
};

/**
 * Handles templating / binding for attributes.
 * Element must have attrib-bind-obj="someObjectInScope" where someObjectInScope is { attributeName: "lorem {{var}} ipsum"}
 * Variables inside template may be in global $scope or forScope and will be resolved in that order.
 * @param element
 * @param init
 */
$_anguleuxInterne.updateAttributes = (element, onlyThisOne) => {

    if (element.hasAttribute("attrib-bind-obj")) {
        let attrBindObj = $_anguleuxInterne.resolveObjectPathMoz($scope, element.getAttribute("attrib-bind-obj"))[$_anguleuxInterne.getDestinationName(element.getAttribute("attrib-bind-obj"))];

        for (let attr in attrBindObj) {

            //iterate through props
            let rgx = /(.*?)({{(?<tmplt>.+?)}})/gs;

            let workingString = attrBindObj[attr];

            if(onlyThisOne === undefined) {
                let matches;
                do {
                    matches = rgx.exec(workingString);
                    if (matches) {
                        let tmpltName = matches.groups["tmplt"];
                        let wholeTmpl = matches[2];

                        let value = $_anguleuxInterne.resolveObjectPathMoz($scope, tmpltName)[$_anguleuxInterne.getDestinationName(tmpltName)];

                        workingString = workingString.replace(wholeTmpl, value);
                    }
                } while (matches);
            }else if(attr === onlyThisOne){

                matches = rgx.exec(workingString);
                let tmpltName = matches.groups["tmplt"];
                let wholeTmpl = matches[2];

                let value = $_anguleuxInterne.resolveObjectPathMoz($scope, tmpltName)[$_anguleuxInterne.getDestinationName(tmpltName)];

                workingString = workingString.replace(wholeTmpl, value);

            }

            element.setAttribute(attr, workingString);

            if(element instanceof HTMLSelectElement && element.hasAttribute('value')){
                element.value = element.getAttribute('value');
                console.log('EVIIIIIIIIIIIIL : https://www.youtube.com/watch?v=zQ0c4_P2uno' );
            }

            //attrBindObj[attr] =

            //TODO : Prevent attributes created in for loops with for variables from being overwritten with the last value saved

            console.log("str : " + workingString)

        }
    }
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

$_anguleuxInterne.updateAgFor = (element) => {

    $_anguleuxInterne.handleAgFor(element);
    $_anguleuxInterne.initElements();
    $_anguleuxInterne.initDataBinding();

};

/**
 * Will update all elements associated with the specified object path.
 * NOTE : will not work with for scope.
 * @param init boolean if init is false, inputs will be overwritten; otherwise the object will.
 * @param strObjPath string object path
 */
$_anguleuxInterne.updateAllWithBinding = (strObjPath, init) => {

    $_anguleuxInterne.updateBinding($_anguleuxInterne.bindingMap[strObjPath][0], init);

};
