# Reactible

Reactible is a React.js based in-place editable field library for HTML forms.
It is slightly based on the x-editable library.

## Project status
Project is under active development for our current project.

## The API (0.1.2)
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
* From a JSON endpoint via the ```data-fieldUrl``` attribute

In case of the view's session data the editable field should know about the underlying data model, which is declared via the optional ```data-fieldModel``` attribute and ```data-fieldModelId``` attribute. It extracts the related value from the session data using the already defined ```data-fieldName``` attribute.

In case of the JSON endpoint, we define the datasource through the ```data-fieldUrl``` attribute, which the field uses as the update endpoint. It extracts the default value from the endpoint based on the ```data-fieldName``` attribute, and updates the value using the same endpoint.



## License
Copyright (c) 2015 Kornél Mergulhao-Novák
Licensed under the MIT license.
