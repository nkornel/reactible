/**
 * EditableField plugin built with React.js, based slightly on the x-Editable jQuery library.
 * This supports AJAX sources trough the source attribute, and the following field types:
 * Text
 * TextArea
 * Select
 * Select2?
 *
 * The mandatory attributes are fieldType, fieldName, fieldTitle.
 * The component hierarchy as follows:
 * 
 * EditableFieldBox
 *     |
 *     | EditableField + <label>
 *         |
 *         | EditableEditBox + <span>
 *             |
 *             | EditableInput | EditableTextAreaInput | EditableSelectInput
 *             | EditableStoreButton
 *             | EditableCancelButton
 */

/**
 * The EditableFieldBox component
 *
 * The main component for EditableField, which contains the label and the EditableField component.
 * 
 */
'use strict';

var EditableFieldBox = React.createClass({
    displayName: 'EditableFieldBox',

    getInitialState: function getInitialState() {
        return { fValue: [] };
    },

    componentDidMount: function componentDidMount() {
        var formattedRes,
            fieldVal = [];

        if ((this.props.fieldType === 'select' || this.props.fieldType == 'select-multiple') && typeof this.props.fieldSelected !== 'undefined') {
            /**
             * In case of select, radio, check and select2 we need
             * the prepopulated list with id: fieldName parts.
             *
             * For select multiple we need to check for various values in array.
             * For that we need to know if the fieldSelected is an array effectively and the filter 
             * must be based on indexOf instead of equality validation.
             */
            Axe.grab(this.props.fieldSource, (function (res) {
                formattedRes = typeof res == 'string' ? JSON.parse(res) : res;
                // We need the field value for the rendering.

                // Treating the selection which is for some reason sometimes comes as a string.
                // Must be traced...
                var selected = [];
                if (this.props.fieldType === 'select-multiple') {
                    selected = JSON.parse(this.props.fieldSelected);
                } else if (this.props.fieldSelected.constructor !== Array) {
                    selected = JSON.parse('[' + this.props.fieldSelected + ']');
                }
                //var selected = this.props.fieldSelected.indexOf('[') === -1 ? JSON.parse('["'+this.props.fieldSelected+'"]') : JSON.parse(this.props.fieldSelected);

                var items = formattedRes.filter(function (obj) {
                    return selected.indexOf(obj.id) > -1;
                });

                for (var i = items.length - 1; i >= 0; i--) {
                    fieldVal.push(items[i][this.props.fieldName]);
                };

                //console.log(fieldVal);
                this.setState({ fValue: fieldVal });
            }).bind(this));
        } else {
            // In case of text, textArea we just get and show.
            if (this.props.fieldValue) {
                this.setState({ fValue: this.props.fieldValue });
            } else {
                Axe.grab(this.props.fieldUrl, (function (res) {
                    this.setState({ fValue: typeof res == 'string' ? JSON.parse(res)[this.props.fieldName] : res[this.props.fieldName] });
                }).bind(this));
            }
        }
    },

    dataUpdated: function dataUpdated(e) {
        if ((this.props.fieldType === 'select' || this.props.fieldType === 'select-multiple') && typeof this.props.fieldSelected !== 'undefined') {

            var formattedRes;
            var fieldVal = [];

            Axe.grab(this.props.fieldSource, (function (res) {
                formattedRes = typeof res == 'string' ? JSON.parse(res) : res;

                // Treating the selection which is for some reason sometimes comes as a string.
                // Must be traced...
                var selection = [];
                if (e.newValue.constructor === Array && e.newValue[0].constructor !== Number) {
                    for (var element in e.newValue) {
                        if (e.newValue[element].constructor !== Number) {
                            selection.push(Number(e.newValue[element]));
                        }
                    }
                } else if (e.newValue.constructor !== Array) {
                    selection = JSON.parse('[' + e.newValue + ']');
                }

                var items = formattedRes.filter(function (obj) {
                    return selection.indexOf(obj.id) > -1;
                });

                for (var i = items.length - 1; i >= 0; i--) {
                    fieldVal.push(items[i][this.props.fieldName]);
                };

                //console.log(fieldVal);
                this.setState({ fValue: fieldVal });
                delete e.newValue;
            }).bind(this));
        } else {
            this.setState({ fValue: e.newValue });
        }
    },

    render: function render() {
        return React.createElement(EditableField, { fieldType: this.props.fieldType,
            fieldValue: this.state.fValue,
            fieldUrl: this.props.fieldUrl,
            fieldSource: this.props.fieldSource,
            fieldSelected: this.props.fieldSelected,
            fieldName: this.props.fieldName,
            dataUpdatedCallback: this.dataUpdated });
    }
});

/**
 * The EditableField component
 *
 * This is the first child of EditableFieldBox, and it contains the field title and EditableEditBox component which holds
 * the components for the field edition.
 * 
 */
var EditableField = React.createClass({
    displayName: 'EditableField',

    getInitialState: function getInitialState() {
        return {
            viewStatus: true
        };
    },

    checkType: function checkType(fieldType) {
        if (fieldType === 'select-multiple') {
            var selectedNodes = this.props.fieldValue.map((function (node) {
                return React.createElement(
                    'li',
                    { key: node, className: 'selected_item', onClick: this.handleEditClick },
                    node
                );
            }).bind(this));

            return React.createElement(
                'div',
                { className: this.state.viewStatus ? 'editableMultiple' : 'hidden editableMultiple' },
                React.createElement(
                    'ul',
                    null,
                    selectedNodes
                )
            );
        } else {
            return React.createElement(
                'span',
                { onClick: this.handleEditClick, className: this.state.viewStatus ? '' : 'hidden' },
                this.props.fieldValue
            );
        }
    },

    handleEditClick: function handleEditClick() {
        this.setState({ viewStatus: false });
    },

    handleCloseClick: function handleCloseClick() {
        this.setState({ viewStatus: true });
    },

    handleDataUpdate: function handleDataUpdate(c) {
        this.setState({ viewStatus: true });
        this.props.dataUpdatedCallback(c);
    },

    render: function render() {
        return React.createElement(
            'div',
            null,
            this.checkType(),
            React.createElement(EditableEditBox, { viewStatus: this.state.viewStatus,
                fieldType: this.props.fieldType,
                fieldValue: this.props.fieldValue,
                fieldUrl: this.props.fieldUrl,
                fieldSource: this.props.fieldSource,
                fieldName: this.props.fieldName,
                fieldSelected: this.props.fieldSelected,
                callbackViewParent: this.handleCloseClick,
                dataUpdatedCallback: this.handleDataUpdate })
        );
    }
});

/**
 * The EditableEditBox component
 *
 * This is basically a container for the edition components.
 *  
 */
var EditableEditBox = React.createClass({
    displayName: 'EditableEditBox',

    onChildClick: function onChildClick() {
        this.props.callbackViewParent();
    },

    handleDataUpdate: function handleDataUpdate(c) {
        this.props.dataUpdatedCallback(c);
    },

    mountComponent: function mountComponent() {
        switch (this.props.fieldType) {
            case 'text':
                return React.createElement(EditableTextInput, { fieldName: this.props.fieldName, fieldValue: this.props.fieldValue, fieldType: this.props.fieldType });
                break;
            case 'select':
            case 'select-multiple':
                return React.createElement(EditableSelectInput, {
                    fieldName: this.props.fieldName,
                    fieldValue: this.props.fieldValue,
                    fieldSource: this.props.fieldSource,
                    fieldSelected: this.props.fieldSelected,
                    fieldType: this.props.fieldType });
                break;
            case 'checkbox':
                return '';
                break;
            case 'radio':
                return '';
                break;
            case 'textarea':
                return React.createElement(EditableTextAreaInput, { fieldName: this.props.fieldName, fieldValue: this.props.fieldValue, fieldSource: this.props.fieldSource });
                break;
            default:
                console.log('no-type given');
                break;
        }
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: this.props.viewStatus ? 'hidden' : '' },
            this.mountComponent(),
            React.createElement(EditableStoreButton, { fieldUrl: this.props.fieldUrl,
                fieldName: this.props.fieldName,
                dataUpdatedCallback: this.handleDataUpdate }),
            React.createElement(EditableCancelButton, { callbackParent: this.onChildClick })
        );
    }
});

/**
 * The EditableInput components
 *
 * This is responsible for the updates on the field value, it can be text, textarea, email, date, datetime, select, select2.
 */
var EditableTextInput = React.createClass({
    displayName: 'EditableTextInput',

    getInitialState: function getInitialState() {
        return { fieldValue: [] };
    },

    handleChange: function handleChange(event) {
        this.setState({ fieldValue: event.target.value });
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextPros) {
        this.setState({ fieldValue: nextPros.fieldValue });
    },

    render: function render() {
        return React.createElement('input', { type: this.props.fieldType, name: this.props.fieldName, value: this.state.fieldValue, onChange: this.handleChange, className: 'form-control', id: 'editableInput' });
    }
});

var EditableTextAreaInput = React.createClass({
    displayName: 'EditableTextAreaInput',

    getInitialState: function getInitialState() {
        return { fieldValue: [] };
    },

    handleChange: function handleChange(event) {
        this.setState({ fieldValue: event.target.value });
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextPros) {
        this.setState({ fieldValue: nextPros.fieldValue });
    },

    render: function render() {
        return React.createElement('textarea', { id: 'editableInput', rows: '5', value: this.state.fieldValue, name: this.props.fieldName, onChange: this.handleChange });
    }
});

var EditableSelectInput = React.createClass({
    displayName: 'EditableSelectInput',

    getInitialState: function getInitialState() {
        return { fieldData: [], defValue: this.props.fieldType == 'select' ? 0 : [] };
    },

    componentDidMount: function componentDidMount() {
        Axe.grab(this.props.fieldSource, (function (res) {
            this.setState({ fieldData: typeof res == 'string' ? JSON.parse(res) : res, defValue: this.props.fieldSelected });
        }).bind(this));
    },

    handleChange: function handleChange(ev) {
        var selection = [];
        for (var i = ev.target.options.length - 1; i >= 0; i--) {
            if (ev.target.options[i].selected) {
                selection.push(ev.target.options[i].value);
            }
        };

        this.setState({ defValue: selection });
    },

    render: function render() {
        var selectNodes = this.state.fieldData.map((function (node) {
            return React.createElement(
                'option',
                { key: node.id, value: node.id },
                node[this.props.fieldName]
            );
        }).bind(this));
        return React.createElement(
            'select',
            { name: this.props.fieldName, id: 'editableInput', value: this.state.defValue, onChange: this.handleChange, multiple: this.props.fieldType == 'select' ? false : true },
            selectNodes
        );
    }
});

/**
 * The EditableStoreButton component
 *
 * This is responsible for updating the field on the server and for 
 * dispatch the updated event for state modification on the parent containers.
 * 
 */
var EditableStoreButton = React.createClass({
    displayName: 'EditableStoreButton',

    handleStoreEvent: function handleStoreEvent(event) {
        var element = event.target.previousSibling ? event.target.previousSibling : event.target.parentNode.previousSibling;

        if (element.multiple) {
            var val = [];
            for (var i = element.options.length - 1; i >= 0; i--) {
                if (element.options[i].selected) {
                    val.push(element.options[i].value);
                }
            };
        } else {
            var val = element.value;
        }
        var url = this.props.fieldUrl;
        var prop = this.props.fieldName;

        if (val.length === 0) {
            alert('Please fill the field');

            return false;
        }

        Axe.slash(url, { name: prop, value: val }, null, (function (res) {
            //alert('Success!');
            setTimeout((function () {
                this.props.dataUpdatedCallback({ 'newValue': val });
            }).bind(this), 500);
        }).bind(this));
    },

    render: function render() {
        return React.createElement(
            'button',
            { type: 'button', className: 'editableStoreButton btn btn-primary', onClick: this.handleStoreEvent },
            React.createElement('i', { className: 'mdi-navigation-check' })
        );
    }
});

/**
 * The EditableCancelButton component
 *
 * This is responsible for cancel the updating state and return the box to view state.
 */
var EditableCancelButton = React.createClass({
    displayName: 'EditableCancelButton',

    handleClosing: function handleClosing() {
        this.props.callbackParent();
    },

    render: function render() {
        return React.createElement(
            'button',
            { type: 'button', className: 'editableCancelButton btn btn-default', onClick: this.handleClosing },
            React.createElement('i', { className: 'mdi-navigation-close' })
        );
    }
});
//# sourceMappingURL=reactible.js.map
