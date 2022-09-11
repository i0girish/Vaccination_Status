$(document).ready(function() {
    
    // Bind vaccination status radiobuttons to hide/show additional fields
    $('input[type="radio"]').click(function() {
        toggleVaccination(this);
    });

    // Validate file upload size
    $("#formFile").on('change', function(event){
        fileInputHandler(this, event.target.files[0]);
      });
    
    // Have one of the radiobuttons selected when page loads
    $('[name="inlineRadioOptions"][value="option1"]').click();
});



function toggleVaccination(DOMelem) {
    if($(DOMelem).attr('id') == 'doubly' || $(DOMelem).attr('id') == 'singly') {
        $('#vacc-conditional').collapse('show');
        $('#formFile').attr('required', true);
        $('#date1').attr('required', true);
        $('#date2').attr('required', true);
    }
    else {
        $('#vacc-conditional').collapse('hide');
        $('#formFile').attr('required', false);
        $('#date1').attr('required', false);
        $('#date2').attr('required', false);
    }
    // Without bootstrap JS, using `addClass(show)` and `removeClass(show)` also works
    // But without animation
}


async function fileInputHandler(DOMelem, file) {
    
    const MAXBYTES = 1048575; // 10MB

    if (file.size > MAXBYTES) {
        alert("Error : File upload size must be less than 10 MB");
        $(DOMelem).val("");
    }
}
