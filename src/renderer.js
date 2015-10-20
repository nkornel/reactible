(function () {

var editableFieldContainers = document.querySelectorAll('.reactible');

for (var i = editableFieldContainers.length - 1; i >= 0; i--) {
    
    ReactDOM.render(
        <EditableFieldBox 
        fieldTitle={editableFieldContainers[i].dataset.fieldtitle}
        fieldName={editableFieldContainers[i].dataset.fieldname}
        fieldType={editableFieldContainers[i].dataset.fieldtype}
        fieldUrl={editableFieldContainers[i].dataset.fieldurl}
        fieldSelected={editableFieldContainers[i].dataset.fieldselected}
        fieldSource={editableFieldContainers[i].dataset.fieldsource} />,
        editableFieldContainers[i]
    );
};

})();
