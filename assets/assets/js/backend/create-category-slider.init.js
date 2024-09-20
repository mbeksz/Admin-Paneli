
var content = null
var desc = null

var thumbnailArray = [];
var thumbnailIDArray = [];

var featuredImage = null;
var featuredImageID = null;




var myDropzone = new Dropzone("div.my-dropzone", { 
    url: "/Yonetici/api/media.php",
    addRemoveLinks: true,
    acceptedFiles: "image/*", 
    removedfile: function (file) {
        deleteMedia(file.id)
        var index = thumbnailIDArray.findIndex(item=>item===file.id)
        console.log('index',index)
        file.previewElement.remove();
        thumbnailArray.splice(index,1);
        thumbnailIDArray.splice(index,1);

    },
    
    init: function() {

        this.on("success", function(file, response) {
            console.log('response',response)
            thumbnailIDArray.push(response.data.id)
            file.id = response.data.id;
            featuredImageID = response.data.id
            console.log(thumbnailIDArray)
        });
    }
});

myDropzone.on("thumbnail", function (file, dataUrl) {
    thumbnailArray.push(dataUrl);
});
var mockFile = { name: "Existing file!", size: 12345 };

function deleteMedia(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/Yonetici/api/media.php", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response.message); // Başarılı yanıt
                alert("File deleted successfully");
            } else {
                var response = JSON.parse(xhr.responseText);
                console.error(response.message); // Hata yanıtı
                alert("Failed to delete file: " + response.message);
            }
        }
    };

    var data = JSON.stringify({ "id": id });
    xhr.send(data);
}



var editinputValueJson = sessionStorage.getItem('editInputValue');
if (editinputValueJson) {
    var editinputValueJson = JSON.parse(editinputValueJson);
    document.getElementById("formAction").value = "edit";
    document.getElementById("product-id-input").value = editinputValueJson.id;
    //productCategoryInput.setChoiceByValue(editinputValueJson.category);
    myDropzone.options.addedfile.call(myDropzone, mockFile);
    myDropzone.options.thumbnail.call(myDropzone, mockFile, editinputValueJson.productImg);
    thumbnailArray.push(editinputValueJson.productImg)
    document.getElementById("product-title-input").value = editinputValueJson.productTitle;
    document.getElementById("stocks-input").value = editinputValueJson.stock;
    document.getElementById("product-price-input").value = editinputValueJson.price;
    document.getElementById("product-discount-input").value = editinputValueJson.discount;
    //document.getElementById("orders-input").value = editinputValueJson.orders;
    
    // clothe-colors
    Array.from(document.querySelectorAll(".clothe-colors li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        editinputValueJson.color.map(function(subItem){
            if (subItem == nameelem.value) {
                nameelem.setAttribute("checked", "checked");
            }
        })
    })

    // clothe-size
    Array.from(document.querySelectorAll(".clothe-size li")).forEach(function (subElem) {
        var nameelem = subElem.querySelector('[type="checkbox"]');
        if(editinputValueJson.size){
            editinputValueJson.size.map(function(subItem){
                if (subItem == nameelem.value) {
                    nameelem.setAttribute("checked", "checked");
                }
            })
        }
    })
}

var forms = document.querySelectorAll('.needs-validation')
// date & time
var date = new Date().toUTCString().slice(5, 16);

var itemid = 13;





Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            
            const formData = {
                
                cover_image: featuredImageID,
                link:document.getElementById('product-url-input').value,
                title:document.getElementById('product-title-input').value,
                order:document.getElementById('product-order-input').value,
            }
            
            const xhttp_createPage = new XMLHttpRequest();
            xhttp_createPage.onload = function () {
                if (this.status === 201) {
                    alert('Post Oluşturuldu!')
    
                    // Opsiyonel: Başka bir sayfaya yönlendirme
                    setTimeout(function() {
                        window.location.href = "/Yonetici/category-slider.php";
                    }, 2000); // 2 saniye sonra yönlendir
                } else {
                    alert('Post oluşturulamadı')
                }
            };
            xhttp_createPage.onerror = function () {
                alert('hata')
            };
            xhttp_createPage.open("POST", "/Yonetici/api/category-slider.php");
            xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createPage.send(JSON.stringify(formData));

        }

        form.classList.add('was-validated');

    }, false)
});