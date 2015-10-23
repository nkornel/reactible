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
        return { fieldValue: [] };
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
                var selected = this.props.fieldSelected.indexOf('[') === -1 ? JSON.parse('[' + this.props.fieldSelected + ']') : JSON.parse(this.props.fieldSelected);

                var items = formattedRes.filter(function (obj) {
                    return selected.indexOf(obj.id) > -1;
                });

                for (var i = items.length - 1; i >= 0; i--) {
                    fieldVal.push(items[i][this.props.fieldName]);
                };

                //console.log(fieldVal);
                this.setState({ fieldValue: fieldVal });
            }).bind(this));
        } else {
            // In case of text, textArea we just get and show.
            Axe.grab(this.props.fieldUrl, (function (res) {
                this.setState({ fieldValue: typeof res == 'string' ? JSON.parse(res)[this.props.fieldName] : res[this.props.fieldName] });
            }).bind(this));
        }

        window.addEventListener('stored', (function (e) {
            if ((this.props.fieldType === 'select' || this.props.fieldType === 'select-multiple') && typeof this.props.fieldSelected !== 'undefined') {

                this.context.selection = e.detail;
                fieldVal.length = 0; // Clearing the array

                /*Axe.grab(this.props.fieldSource + '/' + e.detail, function (res) {
                    this.setState({fieldValue: typeof res == 'string' ? JSON.parse(res)[this.props.fieldName] : res[this.props.fieldName]});
                }.bind(this));*/

                Axe.grab(this.props.fieldSource, (function (res) {
                    formattedRes = typeof res == 'string' ? JSON.parse(res) : res;
                    // We need the field value for the rendering.
                    var selected = this.context.selection.indexOf('[') === -1 ? JSON.parse('[' + this.context.selection + ']') : JSON.parse(this.context.selection);

                    var items = formattedRes.filter(function (obj) {
                        return selected.indexOf(obj.id) > -1;
                    });

                    for (var i = items.length - 1; i >= 0; i--) {
                        fieldVal.push(items[i][this.props.fieldName]);
                    };

                    //console.log(fieldVal);
                    this.setState({ fieldValue: fieldVal });
                    delete this.context.selection;
                }).bind(this));
            } else {
                this.setState({ fieldValue: e.detail });
            }
        }).bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener('stored');
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'editableFieldBox' },
            React.createElement(
                'label',
                null,
                this.props.fieldTitle
            ),
            React.createElement(EditableField, { fieldType: this.props.fieldType,
                fieldValue: this.state.fieldValue,
                fieldUrl: this.props.fieldUrl,
                fieldSource: this.props.fieldSource,
                fieldSelected: this.props.fieldSelected,
                fieldName: this.props.fieldName })
        );
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

    handleEditClick: function handleEditClick() {
        this.setState({ viewStatus: false });
    },

    handleCloseClick: function handleCloseClick() {
        this.setState({ viewStatus: true });
    },

    checkType: function checkType(fieldType) {
        if (fieldType === 'select-multiple') {
            var selectedNodes = this.props.fieldValue.map((function (node) {
                return React.createElement(
                    'li',
                    { 'class': 'selected_item', onClick: this.handleEditClick },
                    node
                );
            }).bind(this));

            return React.createElement(
                'div',
                { 'class': 'editableMultiple', className: this.state.viewStatus ? '' : 'hidden' },
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

    render: function render() {
        return React.createElement(
            'div',
            { className: 'editableField' },
            this.checkType(this.props.fieldType),
            React.createElement(EditableEditBox, { viewStatus: this.state.viewStatus,
                fieldType: this.props.fieldType,
                fieldValue: this.props.fieldValue,
                fieldUrl: this.props.fieldUrl,
                fieldSource: this.props.fieldSource,
                fieldName: this.props.fieldName,
                fieldSelected: this.props.fieldSelected,
                callbackViewParent: this.handleCloseClick })
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
            React.createElement(EditableStoreButton, { fieldUrl: this.props.fieldUrl, fieldName: this.props.fieldName, callbackParent: this.onChildClick }),
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
        return React.createElement('input', { type: this.props.fieldType, name: this.props.fieldName, value: this.state.fieldValue, onChange: this.handleChange, id: 'editableInput' });
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
        return { fieldData: [], defValue: 0 };
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
        var element = document.getElementById('editableInput');

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

        Axe.slash(url, { prop: val }, null, (function (res) {
            //alert('Success!');
            var storedEvent = new CustomEvent('stored', { 'detail': val });
            window.dispatchEvent(storedEvent);
            setTimeout((function () {
                this.props.callbackParent();
            }).bind(this), 500);
        }).bind(this));
    },

    render: function render() {
        return React.createElement(
            'button',
            { type: 'button', className: 'editableStoreButton', onClick: this.handleStoreEvent },
            'Save'
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
            { type: 'button', className: 'editableCancelButton', onClick: this.handleClosing },
            'Cancel'
        );
    }
});
//# sourceMappingURL=reactible.js.map
