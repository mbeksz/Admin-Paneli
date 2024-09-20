/*
Template Name: Toner eCommerce + Admin HTML Template
Author: Themesbrand
Version: 1.2.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Create Product init File
*/
var content = null
var css = null
var js  = null

var content = CodeMirror.fromTextArea(document.getElementById("ckeditor-content"), {
            lineNumbers: true, // Satır numaralarını göster
            mode: "html", // Düzenleme modu (örneğin JavaScript)
            theme: "dracula",
        });
        
content.setSize(null,500)
var css = CodeMirror.fromTextArea(document.getElementById("ckeditor-css"), {
            lineNumbers: true, // Satır numaralarını göster
            mode: "css",
            theme: "dracula",
        });
        
var js = CodeMirror.fromTextArea(document.getElementById("ckeditor-js"), {
            lineNumbers: true, // Satır numaralarını göster
            mode: "javascript",
            theme: "dracula",
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

var detail = null;

const idInput = document.getElementById('page-id-input');

var tags = new Choices('#input-meta-keys',{
    silent: false,
    items: [],
    choices: [],
    renderChoiceLimit: -1,
    maxItemCount: -1,
    addItems: true,
    allowHTML:true,
});

//Page Detail
const xhttp_detail = new XMLHttpRequest();
xhttp_detail.onload = function () {
    var json_records = JSON.parse(this.responseText);  
    detail = json_records;
    console.log('deta',detail)
    document.getElementById('page-title-input').value = detail.page_title
    document.getElementById('page-link-input').value = detail.page_link
    content.setValue(detail.content);
    css.setValue(detail.css);
    js.setValue(detail.js);
    tags.setValue(detail.meta_key.split(','))
    
    setTimeout(()=>{
        
        const headerIndex = headers.findIndex((header)=>header.id==detail.header_id)

        selectHeader.selectedIndex = headerIndex+1;
        
        const footerIndex = footers.findIndex((footer)=>footer.id==detail.footer_id)
        selectFooter.selectedIndex = footerIndex+1;
        
        
    },3000);
}
xhttp_detail.open("GET", "/Yonetici/api/pages.php?id="+idInput.value);
xhttp_detail.send();


var forms = document.querySelectorAll('.needs-validation')

Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            // Form verilerini al
            
            console.log('tags',tags.getValue(true).join(','))

        const formData = {
            id:idInput.value,
            page_title: document.getElementById('page-title-input').value,
            content: content.getValue(),
            page_link: document.getElementById('page-link-input').value,
            header_id: document.getElementById('choices-header-input').value ? parseInt(document.getElementById('choices-header-input').value) : null,
            footer_id: document.getElementById('choices-footer-input').value ? parseInt(document.getElementById('choices-footer-input').value) : null,
            meta_key: tags.getValue(true).join(','),
            css: css.getValue(),
            js: js.getValue()
        };

        
        const xhttp_createPage = new XMLHttpRequest();
        xhttp_createPage.onload = function () {
            if (this.status === 200) {
                alert('Sayfa Güncellendi!')

                // Opsiyonel: Başka bir sayfaya yönlendirme
                
            } else {
                alert('satfa oluşturulamadı')
            }
        };
        xhttp_createPage.onerror = function () {
            alert('hata')
        };
        xhttp_createPage.open("POST", "/Yonetici/api/pages.php?id="+idInput.value);
        xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp_createPage.send(JSON.stringify(formData));

    }

    form.classList.add('was-validated');

    }, false)
});




