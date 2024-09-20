     let contentEditor, cssEditor, jsEditor;

            ClassicEditor
            .create(document.querySelector('#ckeditor-content'))
            .then(function (editor) {
                contentEditor = editor;
                editor.ui.view.editable.element.style.height = '200px';
            })
            .catch(function (error) {
                console.error(error);
            });
            
            ClassicEditor
            .create(document.querySelector('#ckeditor-css'))
            .then(function (editor) {
                cssEditor = editor;
                editor.ui.view.editable.element.style.height = '200px';
            })
            .catch(function (error) {
                console.error(error);
            });ClassicEditor
            .create(document.querySelector('#ckeditor-js'))
            .then(function (editor) {
                jsEditor = editor;
                editor.ui.view.editable.element.style.height = '200px';
            })
            .catch(function (error) {
                console.error(error);
            });

const selectHeader = document.getElementById('choices-header-input');
const selectFooter = document.getElementById('choices-footer-input');

var headers = [];
var footers = [];

//Header List
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    var json_records = JSON.parse(this.responseText);
    
    // Gelen tüm header'ları headers dizisine ekle
    Array.from(json_records).forEach(function (element) {
        headers.push(element);
    });

    // headers dizisindeki her bir header'ı selectHeader elementine ekle
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header.id;
        option.textContent = header.title;
        selectHeader.appendChild(option);
    });
}
xhttp.open("GET", "/Yonetici/api/headers.php");
xhttp.send();


//Footer List
const xhttp_footer = new XMLHttpRequest();
xhttp_footer.onload = function () {
    var json_records = JSON.parse(this.responseText);   
        Array.from(json_records).forEach(function (element) {

            footers.push(element);
       });       
            
            footers.forEach(footer => {
                const option = document.createElement('option');
                option.value = footer.id;
                option.textContent = footer.title;
                selectFooter.appendChild(option);
            });

      
    
}
xhttp_footer.open("GET", "/Yonetici/api/footers.php");
xhttp_footer.send();



var forms = document.querySelectorAll('.needs-validation')

Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            
       const content = contentEditor.getData();
    const contentcss = cssEditor.getData();
    const contentjs = jsEditor.getData();

    
            // Form verilerini al
        const formData = {
            page_title: document.getElementById('page-title-input').value,
            content: content,
            page_link: document.getElementById('page-link-input').value,
            header_id: document.getElementById('choices-header-input').value ? parseInt(document.getElementById('choices-header-input').value) : null,
            footer_id: document.getElementById('choices-footer-input').value ? parseInt(document.getElementById('choices-footer-input').value) : null,
            meta_key: document.getElementById('input-meta-keys').value,
            css: contentcss,
            js: contentjs
        };

        
        const xhttp_createPage = new XMLHttpRequest();
        xhttp_createPage.onload = function () {
            if (this.status === 201) {
                alert('Sayfa Oluşturuldu!')

                // Opsiyonel: Başka bir sayfaya yönlendirme
                setTimeout(function() {
                    window.location.href = "/Yonetici/pages.php";
                }, 2000); // 2 saniye sonra yönlendir
            } else {
                alert('satfa oluşturulamadı')
            }
        };
        xhttp_createPage.onerror = function () {
            alert('hata')
        };
        xhttp_createPage.open("POST", "/Yonetici/api/pages.php");
        xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp_createPage.send(JSON.stringify(formData));

    }

    form.classList.add('was-validated');

    }, false)
});




