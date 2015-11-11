# Reactible

Reactible is a React.js based in-place editable field library for HTML forms.
It is slightly based on the x-editable library.

## Project status
Project is under active development for our current project.

*The component currently uses the ```bootstrap-material-design``` library, which is based on the ```materialize.css``` library and Google's *material design* principles. PLEASE DO NOT RELY ON THIS LIBRARY FOR FORMATTING SINCE IT CAN CHANGE IN FUTURE VERSIONS. INSTEAD USE PROPRIETY CSS TO OVERWRITE THE CSS SET.*

## The API
Reactible is working with ```data-attributes``` and the ```.reactible``` class on almost any kind of valid html tag.

### The default ```data-attributes``` for a reactible field are these:
* data-fieldTitle - This defines the ```<label>``` element above or inline the editable field.
* data-fieldName  - The ```name``` attribute for the field.
* data-fieldType  - The ```type``` attribute of the field. Reactible currently supports: text, textarea, select, and multiple-select field types.

### The optional ```data-attributes``` are:
* data-fieldUrl   - This is an attribute for AJAX based functionality. In this case ```reactible``` extracts the value of the field from the Url endpoint - assuming it is a valid REST endpoint - based on the ```data-fieldName``` attribute. And it uses it for ```POST``` or ```PUT``` the new value to that same endpoint.
* data-fieldSelected - If the ```type``` for the field is ```select``` or ```select-multiple```, the ```data-fieldSelected``` attribute can be provided as a default value for the ```<option>``` fields inside the ```<select>``` tag. The ```data-fieldSelected``` attribute accepts a unique value or an array of values for preselected values.
* data-fieldSource  - When the ```type``` is defined as ```select``` or ```select-multiple``` the ```data-fieldSource``` attribute can be provided as a valid URI to pre-populate the list with ```<option>``` values.

### About default values in fields:
During the planning phase we had in mind, that the component should be used in various situations, and it should be able to handle those situations in a flexible manner, at least from the datasource point of view. So for the base we give it two basic forms of datasource:

* Directly from the view's session data
* From a JSON endpoint via the ```data-fieldSource``` attribute

In case of the view's session data the editable field receives it's default data from the session via the ```data-fieldValue``` attribute.

In case of the JSON endpoint, we define the datasource through the ```data-fieldSource``` attribute, which the field uses as the update endpoint. It extracts the default value from the endpoint based on the ```data-fieldName``` attribute, and updates the value using the same endpoint.

### Validation
When click happens on the editable field for submit the value, it passes through the Axe library and while on returning it verifies the response for an ```error``` array. If it has indeed this array, the component injects a ```<span>``` tag with the ```innerHTML``` set for the error text from the ```errors``` array. The ```<span>``` tag also receives the ```reactible-error``` class for better styling possibilites.

### The Axe library

Reactible works with its own XMLHttpRequest library called Axe. Axe is able to handle ```GET```, ```POST``` and ```PUT``` request with pure XMLHttpRequest, and it has an own configuration object to define additional authentication ```TOKEN``` data and ```Content-Type``` parameters. Axe is available also trough the window object and it comes embedded with the component.


## License
Copyright (c) 2015 Kornél Mergulhao-Novák
Licensed under the MIT license.
