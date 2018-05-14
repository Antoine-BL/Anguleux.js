# Anguleux.js

A quick and dirty two-way model-binding implementation in vanilla JS

# Authors

 - Michael-John Sakellaropoulos : Full implementation and further development
 - Antoine-Brassad Lahey : Proof of concept

# Usage

Include Anguleux.js and AnguleuxStyle.css in the head tag before your code.
  
# Attributes

 - data-bind="foo.bar"    : Will bind the entirety of the element's innerHTML to the value of the resolved property.
 - ag-template="true"     : Will enable HTML templating for an element. Syntax is {{foo.bar}}. Templates in attributes are IGNORED.
 - ag-for="x in foo.table": Will loop through the specified table (in order) and populate the variable you define with the value of the current item in the table for use in templating. If you wish to access the current index, use {{_index}}.
 - index-offset="1"       : Will add to the index rendered by {{_index}} by the number you provide.
 - for-bind="true"        : This attribute indicates that an HTMLInputElement inside an ag-for element must be data bound.
 - for-bind-path="bar"    : This attribute is required if you wish to bind to a property of the current item in the table on an HTMLInputElement. Used in conjunction with for-bind="true".
