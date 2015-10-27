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
var EditableFieldBox = React.createClass({
    getInitialState: function () {
        return {fValue: []};
    },
    
    componentDidMount: function () {
        var formattedRes, fieldVal = [];

        if ((this.props.fieldType === 'select' || this.props.fieldType == 'select-multiple')
            && typeof this.props.fieldSelected !== 'undefined') {
            /**
             * In case of select, radio, check and select2 we need
             * the prepopulated list with id: fieldName parts.
             *
             * For select multiple we need to check for various values in array.
             * For that we need to know if the fieldSelected is an array effectively and the filter 
             * must be based on indexOf instead of equality validation.
             */
            Axe.grab(this.props.fieldSource, function (res) {
                formattedRes = typeof res == 'string' ? JSON.parse(res) : res;
                // We need the field value for the rendering.
                
                // Treating the selection which is for some reason sometimes comes as a string.
                // Must be traced...
                var selected = [];
                if (this.props.fieldType === 'select-multiple') {
                    selected = JSON.parse(this.props.fieldSelected);
                } else if (this.props.fieldSelected.constructor !== Array) {
                    selected = JSON.parse('['+this.props.fieldSelected+']');
                }
                //var selected = this.props.fieldSelected.indexOf('[') === -1 ? JSON.parse('["'+this.props.fieldSelected+'"]') : JSON.parse(this.props.fieldSelected);

                var items = formattedRes.filter(function (obj) {
                    return selected.indexOf(obj.id) > -1
                });

                for (var i = items.length - 1; i >= 0; i--) {
                    fieldVal.push(items[i][this.props.fieldName]);
                };
                
                //console.log(fieldVal); 
                this.setState({fValue: fieldVal});
            }.bind(this));
        } else {
            // In case of text, textArea we just get and show.
            if (this.props.fieldValue) {
                this.setState({fValue: this.props.fieldValue});
            } else {
                Axe.grab(this.props.fieldUrl, function (res) {
                    this.setState({fValue: typeof res == 'string' ? JSON.parse(res)[this.props.fieldName] : res[this.props.fieldName]});
                }.bind(this));
            }
        }
    },

    dataUpdated: function (e) {       
        if ((this.props.fieldType === 'select' || this.props.fieldType === 'select-multiple')
            && typeof this.props.fieldSelected !== 'undefined') {
            
            var formattedRes;
            var fieldVal = [];

            Axe.grab(this.props.fieldSource, function (res) {
                formattedRes = typeof res == 'string' ? JSON.parse(res) : res;

                // Treating the selection which is for some reason sometimes comes as a string.
                // Must be traced...
                var selection = [];
                if (e.newValue.constructor === Array &&
                    e.newValue[0].constructor !== Number) {
                    for (var element in e.newValue) {
                        if (e.newValue[element].constructor !== Number) {
                            selection.push(Number(e.newValue[element]));
                        }
                    }
                } else if (e.newValue.constructor !== Array) {
                    selection = JSON.parse('['+e.newValue+']');
                }

                var items = formattedRes.filter(function (obj) {
                    return selection.indexOf(obj.id) > -1
                });

                for (var i = items.length - 1; i >= 0; i--) {
                    fieldVal.push(items[i][this.props.fieldName]);
                };
                
                //console.log(fieldVal); 
                this.setState({fValue: fieldVal});
                delete e.newValue;
            }.bind(this));
        } else {
            this.setState({fValue: e.newValue});
        }
    },

    render: function () {
        return (
            <div className="editableFieldBox">
                <label htmlFor={this.props.fieldName}>{this.props.fieldTitle}</label>
                <EditableField fieldType={this.props.fieldType} 
                               fieldValue={this.state.fValue} 
                               fieldUrl={this.props.fieldUrl}
                               fieldSource={this.props.fieldSource} 
                               fieldSelected={this.props.fieldSelected} 
                               fieldName={this.props.fieldName}
                               dataUpdatedCallback={this.dataUpdated} />
            </div>
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
    getInitialState: function () {
        return {
            viewStatus: true
        };
    },

    checkType: function (fieldType) {
        if (fieldType === 'select-multiple') {
            var selectedNodes = this.props.fieldValue.map(function (node) {
                return (
                    <li key={node} className="selected_item" onClick={this.handleEditClick}>{node}</li>
                );
            }.bind(this));

            return <div className={this.state.viewStatus ? 'editableMultiple' : 'hidden editableMultiple'}>
                        <ul>
                        {selectedNodes}
                        </ul>
                    </div>;

        } else {
            return <span onClick={this.handleEditClick} className={this.state.viewStatus ? '' : 'hidden'}>{this.props.fieldValue}</span>;
        }
    },

    handleEditClick: function () {
        this.setState({viewStatus: false});
    },

    handleCloseClick: function () {
        this.setState({viewStatus: true});
    },

    handleDataUpdate: function (c) {
        this.setState({viewStatus: true});
        this.props.dataUpdatedCallback(c);
    },

    render: function () {
        return (
            <div className="editableField">
                {this.checkType(this.props.fieldType)}
                <EditableEditBox viewStatus={this.state.viewStatus} 
                                 fieldType={this.props.fieldType} 
                                 fieldValue={this.props.fieldValue}
                                 fieldUrl={this.props.fieldUrl}
                                 fieldSource={this.props.fieldSource} 
                                 fieldName={this.props.fieldName} 
                                 fieldSelected={this.props.fieldSelected}
                                 callbackViewParent={this.handleCloseClick}
                                 dataUpdatedCallback={this.handleDataUpdate} />
            </div>
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
    onChildClick: function () {
        this.props.callbackViewParent();
    },

    handleDataUpdate: function (c) {
        this.props.dataUpdatedCallback(c);
    },

    mountComponent: function () {
        switch (this.props.fieldType) {
            case 'text':
                return <EditableTextInput fieldName={this.props.fieldName} fieldValue={this.props.fieldValue} fieldType={this.props.fieldType} />;
                break;
            case 'select':
            case 'select-multiple':
                return <EditableSelectInput 
                            fieldName={this.props.fieldName} 
                            fieldValue={this.props.fieldValue} 
                            fieldSource={this.props.fieldSource} 
                            fieldSelected={this.props.fieldSelected}
                            fieldType={this.props.fieldType} />
                break;
            case 'checkbox':
                return '';
                break;
            case 'radio':
                return '';
                break;
            case 'textarea':
                return <EditableTextAreaInput fieldName={this.props.fieldName} fieldValue={this.props.fieldValue} fieldSource={this.props.fieldSource} />
                break;
            default:
                console.log('no-type given');
                break;
        }
    },

    render: function () {
        return (
            <div className={this.props.viewStatus ? 'hidden' : ''}>
                {this.mountComponent()}
                <EditableStoreButton fieldUrl={this.props.fieldUrl} 
                                     fieldName={this.props.fieldName}
                                     dataUpdatedCallback={this.handleDataUpdate} />
                <EditableCancelButton callbackParent={this.onChildClick} />
            </div>
        );
    }
});

/**
 * The EditableInput components
 *
 * This is responsible for the updates on the field value, it can be text, textarea, email, date, datetime, select, select2.
 */
var EditableTextInput = React.createClass({
    getInitialState: function () {
        return {fieldValue: []};
    },

    handleChange: function (event) {
        this.setState({fieldValue: event.target.value});
    },

    componentWillReceiveProps: function (nextPros) {
        this.setState({fieldValue: nextPros.fieldValue});
    },

    render: function () {            
        return <input type={this.props.fieldType} name={this.props.fieldName} value={this.state.fieldValue} onChange={this.handleChange} id="editableInput" />
    }
});

var EditableTextAreaInput = React.createClass({
    getInitialState: function () {
        return {fieldValue: []};
    },

    handleChange: function (event) {
        this.setState({fieldValue: event.target.value});
    },

    componentWillReceiveProps: function (nextPros) {
        this.setState({fieldValue: nextPros.fieldValue});
    },

    render: function () {
        return <textarea id="editableInput" rows="5" value={this.state.fieldValue} name={this.props.fieldName} onChange={this.handleChange}></textarea>;
    }
});

var EditableSelectInput = React.createClass({
    getInitialState: function () {
        return {fieldData: [], defValue: this.props.fieldType == 'select' ? 0 : []};
    },

    componentDidMount: function () {
        Axe.grab(this.props.fieldSource, function (res) {
            this.setState({fieldData: typeof res == 'string' ? JSON.parse(res) : res, defValue: this.props.fieldSelected});
        }.bind(this));
    },

    handleChange: function (ev) {
        var selection = [];
        for (var i = ev.target.options.length - 1; i >= 0; i--) {
            if (ev.target.options[i].selected) {
                selection.push(ev.target.options[i].value);
            }
        };

        this.setState({defValue:selection})
    },

    render: function () {
        var selectNodes = this.state.fieldData.map(function (node) {
            return (
                <option key={node.id} value={node.id}>{node[this.props.fieldName]}</option>
            );
        }.bind(this));
        return (
            <select name={this.props.fieldName} id="editableInput" value={this.state.defValue} onChange={this.handleChange} multiple={this.props.fieldType == 'select' ? false : true}>
                {selectNodes}
            </select>
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
    handleStoreEvent: function (event) {
        var element = event.target.previousSibling;

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

        Axe.slash(url, {prop : val}, null, function (res) {
            //alert('Success!');
            setTimeout(function () {
                this.props.dataUpdatedCallback({'newValue':val});
            }.bind(this), 500);
        }.bind(this));
    },

    render: function () {
        return <button type="button" className="editableStoreButton" onClick={this.handleStoreEvent}>Save</button>;
    }
});

/**
 * The EditableCancelButton component
 *
 * This is responsible for cancel the updating state and return the box to view state.
 */
var EditableCancelButton = React.createClass({
    handleClosing: function () {
        this.props.callbackParent();
    },

    render: function () {
        return <button type="button" className="editableCancelButton" onClick={this.handleClosing}>Cancel</button>;
    }
});


