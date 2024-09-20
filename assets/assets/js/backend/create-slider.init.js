/*
Template Name: Toner eCommerce + Admin HTML Template
Author: Themesbrand
Version: 1.2.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Create Product init File
*/

ClassicEditor
    .create(document.querySelector('#ckeditor-content'))
    .then(function (editor) {
        editor.ui.view.editable.element.style.height = '200px';
        editor.setData('');
    })
    .catch(function (error) {
        console.error(error);
    });

ClassicEditor
    .create(document.querySelector('#ckeditor-css'))
    .then(function (editor) {
        editor.ui.view.editable.element.style.height = '200px';
        editor.setData('');
    })
    .catch(function (error) {
        console.error(error);
    });

ClassicEditor
    .create(document.querySelector('#ckeditor-js'))
    .then(function (editor) {
        editor.ui.view.editable.element.style.height = '200px';
        editor.setData('');
    })
    .catch(function (error) {
        console.error(error);
    });
    
    
    
    
    
// const selectSlider = document.getElementById('choices-slider-input');

// var sliders = [];

// //Slider List
// const xhttp = new XMLHttpRequest();
// xhttp.onload = function () {
//     var json_records = JSON.parse(this.responseText);   
//         Array.from(json_records).forEach(function (element) {

//             sliders.push(element);
            
            
//             sliders.forEach(slider => {
//                 const option = document.createElement('option');
//                 option.value = slider.id;
//                 option.textContent = slider.slider_title;
//                 selectSlider.appendChild(option);
//             });

//         });
    
// }
// xhttp.open("GET", "http://92.204.212.71/.com/Yonetici/api/sliders.php");
// xhttp.send();





var forms = document.querySelectorAll('.needs-validation')

Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();

            // Form verilerini al
            const formData = {
               
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                order_number: document.getElementById('order_number').value,
                button_name: document.getElementById('button_name').value,
                button_link: document.getElementById('button_link').value,
                image_path: document.getElementById('slider-image-path-input').value,
                // slider_id: document.getElementById('slider_id').value,
                // sliders_id: document.getElementById('choices-slider-input').value ? parseInt(document.getElementById('choices-slider-input').value) : null,
                content: document.querySelector('#ckeditor-content .ck-content').innerHTML,
                css: document.querySelector('#ckeditor-css .ck-content').innerHTML,
                js: document.querySelector('#ckeditor-js .ck-content').innerHTML
            };

            const xhttp_createSlider = new XMLHttpRequest();
            xhttp_createSlider.onload = function () {
                if (this.status === 201) {
                    alert('Slider Oluşturuldu!');

                    // Opsiyonel: Başka bir sayfaya yönlendirme
                    setTimeout(function () {
                        window.location.href = "http://92.204.212.71/.com/Yonetici/sliders.php";
                    }, 2000); // 2 saniye sonra yönlendir
                } else {
                    alert('Slider oluşturulamadı');
                }
            };
            xhttp_createSlider.onerror = function () {
                alert('Hata');
            };
            xhttp_createSlider.open("POST", "http://92.204.212.71/.com/Yonetici/api/sliders.php");
            xhttp_createSlider.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createSlider.send(JSON.stringify(formData));
        }

        form.classList.add('was-validated');
    }, false);
});





