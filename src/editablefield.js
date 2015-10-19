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
        return {fieldValue: []};
    },
    
    componentDidMount: function () {
        $.get(this.props.fieldSource, function (res) {
            if (this.props.fieldType === 'select' && typeof this.props.fieldSelected !== 'undefined') {
                var x = res.filter(function (obj) {
                    return obj.id == this.props.fieldSelected;
                }.bind(this))[0][this.props.fieldName];

                this.setState({fieldValue: x});
            } else {
                this.setState({fieldValue: res[this.props.fieldName]});
            }
        }.bind(this));

        window.addEventListener('stored', function (e) {
            this.setState({fieldValue: e.detail});
        }.bind(this));
    },

    componentWillUnmount: function() {
        window.removeEventListener('stored');
    },

    render: function () {
        return (
            <div className="editableFieldBox">
                <label>{this.props.fieldTitle}</label>
                <EditableField fieldType={this.props.fieldType} fieldValue={this.state.fieldValue} fieldSource={this.props.fieldSource} fieldSelected={this.props.fieldSelected} fieldName={this.props.fieldName} />
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

    handleEditClick: function () {
        this.setState({viewStatus: false});
    },

    handleCloseClick: function () {
        this.setState({viewStatus: true});
    },

    render: function () {
        return (
            <div className="editableField">
                <span onClick={this.handleEditClick} className={this.state.viewStatus ? '' : 'hidden'}>{this.props.fieldValue}</span>
                <EditableEditBox viewStatus={this.state.viewStatus} fieldType={this.props.fieldType} callbackViewParent={this.handleCloseClick} fieldValue={this.props.fieldValue} fieldSource={this.props.fieldSource} fieldName={this.props.fieldName} fieldSelected={this.props.fieldSelected}/>
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

    mountComponent: function () {
        switch (this.props.fieldType) {
            case 'text':
                return <EditableTextInput fieldName={this.props.fieldName} fieldValue={this.props.fieldValue} fieldType={this.props.fieldType} />;
                break;
            case 'select':
                return <EditableSelectInput fieldName={this.props.fieldName} fieldValue={this.props.fieldValue} fieldSource={this.props.fieldSource} fieldSelected={this.props.fieldSelected}/>
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
                <EditableStoreButton fieldSource={this.props.fieldSource} callbackParent={this.onChildClick} />
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
        return {fieldData: [], defValue: 0};
    },

    componentDidMount: function () {
        $.get(this.props.fieldSource, function (res) {
            this.setState({fieldData: res, defValue: this.props.fieldSelected});
        }.bind(this));
    },

    handleChange: function (ev) {
        this.setState({defValue:ev.target.value})
    },

    render: function () {
        var selectNodes = this.state.fieldData.map(function (node) {
            return (
                <option key={node.id} value={node.id}>{node.name}</option>
            );
        });
        return (
            <select name={this.props.fieldName} id="editableInput" value={this.state.defValue} onChange={this.handleChange}>
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
        var val = document.getElementById('editableInput').value;
        var urlVet = this.props.fieldSource.split('/').slice('3');

        if (val.length === 0) {
            alert('Please fill the field');

            return false;
        }

        $.ajax({
            type: 'PUT',
            url: '/api/show/'+urlVet[0]+'/'+urlVet[1],
            data: {'name':val}
        })
        .done(function(res) {
            alert('Success!');
            this.props.callbackParent();
            var storedEvent = new CustomEvent('stored', {'detail': val});
            window.dispatchEvent(storedEvent);
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


